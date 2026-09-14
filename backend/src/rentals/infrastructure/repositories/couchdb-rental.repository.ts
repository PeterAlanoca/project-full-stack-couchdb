import { Inject, Injectable } from '@nestjs/common';
import * as nano from 'nano';
import { COUCHDB_DATABASE } from '../../../shared/infrastructure/couchdb/couchdb.module.js';
import { IRentalRepository } from '../../domain/repositories/rental.repository.interface.js';
import { Rental, RentalId, RentalProps, RentalStatus, RentalItem, CustomerSnapshot } from '../../domain/entities/rental.entity.js';

interface RentalDocument {
  _id: string;
  _rev?: string;
  type: 'rental';
  customerId: string;
  customerSnapshot: CustomerSnapshot;
  items: RentalItem[];
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  total: number;
  status: RentalStatus;
  rentedAt: string;
  dueDate: string;
  returnedAt: string | null;
}

@Injectable()
export class CouchdbRentalRepository implements IRentalRepository {
  constructor(
    @Inject(COUCHDB_DATABASE)
    private readonly db: nano.DocumentScope<RentalDocument>,
  ) {}

  private toEntity(doc: RentalDocument): Rental {
    return Rental.reconstitute({
      id: RentalId.from(doc._id),
      customerId: doc.customerId,
      customerSnapshot: doc.customerSnapshot,
      items: doc.items,
      subtotal: doc.subtotal,
      discountPercent: doc.discountPercent,
      discountAmount: doc.discountAmount,
      total: doc.total,
      status: doc.status,
      rentedAt: new Date(doc.rentedAt),
      dueDate: new Date(doc.dueDate),
      returnedAt: doc.returnedAt ? new Date(doc.returnedAt) : null,
    } as RentalProps);
  }

  private toDocument(rental: Rental): Omit<RentalDocument, '_rev'> {
    return {
      _id: rental.id.value,
      type: 'rental',
      customerId: rental.customerId,
      customerSnapshot: rental.customerSnapshot,
      items: rental.items,
      subtotal: rental.subtotal,
      discountPercent: rental.discountPercent,
      discountAmount: rental.discountAmount,
      total: rental.total,
      status: rental.status,
      rentedAt: rental.rentedAt.toISOString(),
      dueDate: rental.dueDate.toISOString(),
      returnedAt: rental.returnedAt ? rental.returnedAt.toISOString() : null,
    };
  }

  async findById(id: string): Promise<Rental | null> {
    try {
      return this.toEntity(await this.db.get(id));
    } catch { return null; }
  }

  async findAll(): Promise<Rental[]> {
    const result = await this.db.find({ selector: { type: 'rental' } });
    return result.docs.map((d) => this.toEntity(d));
  }

  async findByCustomerId(customerId: string): Promise<Rental[]> {
    const result = await this.db.find({
      selector: { type: 'rental', customerId },
    });
    return result.docs.map((d) => this.toEntity(d));
  }

  async save(rental: Rental): Promise<Rental> {
    await this.db.insert(this.toDocument(rental) as RentalDocument);
    return rental;
  }

  async update(rental: Rental): Promise<Rental> {
    const existing = await this.db.get(rental.id.value);
    await this.db.insert({ ...this.toDocument(rental), _rev: existing._rev } as RentalDocument);
    return rental;
  }
}
