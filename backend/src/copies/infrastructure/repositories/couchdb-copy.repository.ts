import { Inject, Injectable } from '@nestjs/common';
import * as nano from 'nano';
import { COUCHDB_DATABASE } from '../../../shared/infrastructure/couchdb/couchdb.module.js';
import { ICopyRepository } from '../../domain/repositories/copy.repository.interface.js';
import {
  Copy,
  CopyId,
  CopyProps,
  CopyStatus,
  Deactivation,
  DeactivationReason,
} from '../../domain/entities/copy.entity.js';

interface CopyDocument {
  _id: string;
  _rev?: string;
  type: 'copy';
  movieId: string;
  copyCode: string;
  status: CopyStatus;
  acquiredAt: string;
  deactivation: {
    reason: DeactivationReason;
    notes?: string;
    date: string;
  } | null;
}

@Injectable()
export class CouchdbCopyRepository implements ICopyRepository {
  constructor(
    @Inject(COUCHDB_DATABASE)
    private readonly db: nano.DocumentScope<CopyDocument>,
  ) {}

  private toEntity(doc: CopyDocument): Copy {
    const deactivation: Deactivation | null = doc.deactivation
      ? {
          reason: doc.deactivation.reason,
          notes: doc.deactivation.notes,
          date: new Date(doc.deactivation.date),
        }
      : null;

    return Copy.reconstitute({
      id: CopyId.from(doc._id),
      movieId: doc.movieId,
      copyCode: doc.copyCode,
      status: doc.status,
      acquiredAt: new Date(doc.acquiredAt),
      deactivation,
    } as CopyProps);
  }

  private toDocument(copy: Copy): Omit<CopyDocument, '_rev'> {
    return {
      _id: copy.id.value,
      type: 'copy',
      movieId: copy.movieId,
      copyCode: copy.copyCode,
      status: copy.status,
      acquiredAt: copy.acquiredAt.toISOString(),
      deactivation: copy.deactivation
        ? {
            reason: copy.deactivation.reason,
            notes: copy.deactivation.notes,
            date: copy.deactivation.date.toISOString(),
          }
        : null,
    };
  }

  async findById(id: string): Promise<Copy | null> {
    try {
      const doc = await this.db.get(id);
      return this.toEntity(doc);
    } catch {
      return null;
    }
  }

  async findByMovieId(movieId: string): Promise<Copy[]> {
    const result = await this.db.find({
      selector: { type: 'copy', movieId },
    });
    return result.docs.map((d) => this.toEntity(d));
  }

  async findAvailableByMovieId(movieId: string): Promise<Copy[]> {
    const result = await this.db.find({
      selector: { type: 'copy', movieId, status: 'available' },
    });
    return result.docs.map((d) => this.toEntity(d));
  }

  async save(copy: Copy): Promise<Copy> {
    await this.db.insert(this.toDocument(copy) as CopyDocument);
    return copy;
  }

  async update(copy: Copy): Promise<Copy> {
    const existing = await this.db.get(copy.id.value);
    await this.db.insert({ ...this.toDocument(copy), _rev: existing._rev } as CopyDocument);
    return copy;
  }

  async bulkUpdate(copies: Copy[]): Promise<Copy[]> {
    const ids = copies.map((c) => c.id.value);
    const existingDocs = await Promise.all(ids.map((id) => this.db.get(id)));

    const docs = copies.map((copy, index) => ({
      ...this.toDocument(copy),
      _rev: existingDocs[index]._rev,
    }));

    await this.db.bulk({ docs });
    return copies;
  }
}
