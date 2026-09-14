import { Inject, Injectable } from '@nestjs/common';
import * as nano from 'nano';
import { COUCHDB_DATABASE } from '../../../shared/infrastructure/couchdb/couchdb.module.js';
import { ICustomerRepository } from '../../domain/repositories/customer.repository.interface.js';
import {
  Customer, CustomerId, CustomerProps, CustomerStatus,
  BlockRecord, CustomerAddress,
} from '../../domain/entities/customer.entity.js';

interface CustomerDocument {
  _id: string;
  _rev?: string;
  type: 'customer';
  dni?: string;
  fullName: string;
  phone: string;
  email: string;
  birthDate: string;
  address: CustomerAddress;
  status: CustomerStatus;
  block: { reason: string; blockedAt: string } | null;
  registeredAt: string;
  updatedAt: string;
}

@Injectable()
export class CouchdbCustomerRepository implements ICustomerRepository {
  constructor(
    @Inject(COUCHDB_DATABASE)
    private readonly db: nano.DocumentScope<CustomerDocument>,
  ) {}

  private toEntity(doc: CustomerDocument): Customer {
    const block: BlockRecord | null = doc.block
      ? { reason: doc.block.reason, blockedAt: new Date(doc.block.blockedAt) }
      : null;

    return Customer.reconstitute({
      id: CustomerId.from(doc._id),
      dni: doc.dni || '',
      fullName: doc.fullName,
      phone: doc.phone,
      email: doc.email,
      birthDate: new Date(doc.birthDate),
      address: doc.address,
      status: doc.status,
      block,
      registeredAt: new Date(doc.registeredAt),
      updatedAt: new Date(doc.updatedAt),
    } as CustomerProps);
  }

  private toDocument(customer: Customer): Omit<CustomerDocument, '_rev'> {
    return {
      _id: customer.id.value,
      type: 'customer',
      dni: customer.dni || '',
      fullName: customer.fullName,
      phone: customer.phone,
      email: customer.email,
      birthDate: customer.birthDate.toISOString().split('T')[0],
      address: customer.address,
      status: customer.status,
      block: customer.block
        ? { reason: customer.block.reason, blockedAt: customer.block.blockedAt.toISOString() }
        : null,
      registeredAt: customer.registeredAt.toISOString(),
      updatedAt: customer.updatedAt.toISOString(),
    };
  }

  async findById(id: string): Promise<Customer | null> {
    try {
      const doc = await this.db.get(id);
      return this.toEntity(doc);
    } catch {
      return null;
    }
  }

  async findAll(): Promise<Customer[]> {
    const result = await this.db.find({ selector: { type: 'customer' } });
    return result.docs.map((d) => this.toEntity(d));
  }

  async save(customer: Customer): Promise<Customer> {
    await this.db.insert(this.toDocument(customer) as CustomerDocument);
    return customer;
  }

  async update(customer: Customer): Promise<Customer> {
    const existing = await this.db.get(customer.id.value);
    await this.db.insert({ ...this.toDocument(customer), _rev: existing._rev } as CustomerDocument);
    return customer;
  }
}
