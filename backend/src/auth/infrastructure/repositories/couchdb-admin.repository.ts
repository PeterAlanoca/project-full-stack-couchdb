import { Inject, Injectable } from '@nestjs/common';
import * as nano from 'nano';
import { COUCHDB_DATABASE } from '../../../shared/infrastructure/couchdb/couchdb.module.js';
import { IAdminRepository } from '../../domain/repositories/admin.repository.interface.js';
import { Admin, AdminId, AdminProps, AdminRole } from '../../domain/entities/admin.entity.js';

interface AdminDocument {
  _id: string;
  _rev?: string;
  type: 'admin';
  username: string;
  passwordHash: string;
  fullName: string;
  email: string;
  role: AdminRole;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

@Injectable()
export class CouchdbAdminRepository implements IAdminRepository {
  constructor(
    @Inject(COUCHDB_DATABASE)
    private readonly db: nano.DocumentScope<AdminDocument>,
  ) {}

  private toEntity(doc: AdminDocument): Admin {
    return Admin.reconstitute({
      id: AdminId.from(doc._id),
      username: doc.username,
      passwordHash: doc.passwordHash,
      fullName: doc.fullName,
      email: doc.email || '',
      role: doc.role || 'admin',
      isActive: doc.isActive !== false,
      createdAt: new Date(doc.createdAt),
      lastLoginAt: doc.lastLoginAt ? new Date(doc.lastLoginAt) : null,
    } as AdminProps);
  }

  private toDocument(admin: Admin): Omit<AdminDocument, '_rev'> {
    return {
      _id: admin.id.value,
      type: 'admin',
      username: admin.username,
      passwordHash: admin.passwordHash,
      fullName: admin.fullName,
      email: admin.email,
      role: admin.role,
      isActive: admin.isActive,
      createdAt: admin.createdAt.toISOString(),
      lastLoginAt: admin.lastLoginAt ? admin.lastLoginAt.toISOString() : null,
    };
  }

  async findById(id: string): Promise<Admin | null> {
    try {
      const doc = await this.db.get(id);
      if (doc.type !== 'admin') return null;
      return this.toEntity(doc);
    } catch {
      return null;
    }
  }

  async findByUsername(username: string): Promise<Admin | null> {
    const result = await this.db.find({
      selector: {
        type: 'admin',
        username: username.toLowerCase().trim(),
      },
      limit: 1,
    });

    if (!result.docs || result.docs.length === 0) {
      return null;
    }

    return this.toEntity(result.docs[0]);
  }

  async findAll(): Promise<Admin[]> {
    const result = await this.db.find({
      selector: { type: 'admin' },
    });
    return result.docs.map((doc) => this.toEntity(doc));
  }

  async save(admin: Admin): Promise<Admin> {
    await this.db.insert(this.toDocument(admin) as AdminDocument);
    return admin;
  }

  async update(admin: Admin): Promise<Admin> {
    const existing = await this.db.get(admin.id.value);
    await this.db.insert({
      ...this.toDocument(admin),
      _rev: existing._rev,
    } as AdminDocument);
    return admin;
  }

  async count(): Promise<number> {
    const result = await this.db.find({
      selector: { type: 'admin' },
      fields: ['_id'],
    });
    return result.docs.length;
  }
}
