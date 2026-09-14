import { UniqueId } from '../../../shared/domain/value-objects/unique-id.value-object.js';

export type RentalStatus = 'active' | 'returned' | 'overdue';

export interface RentalItem {
  copyId: string;
  movieId: string;
  movieTitle: string;
  days: number;
  pricePerRental: number;
}

export interface CustomerSnapshot {
  fullName: string;
  email: string;
  dni?: string;
}

export class RentalId extends UniqueId {
  protected constructor(value: string) {
    super(value);
  }

  static create(): RentalId {
    return new RentalId(UniqueId.generateCouchId('rental'));
  }

  static from(value: string): RentalId {
    return new RentalId(value);
  }
}

export interface RentalProps {
  id: RentalId;
  customerId: string;
  customerSnapshot: CustomerSnapshot;
  items: RentalItem[];
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  total: number;
  status: RentalStatus;
  rentedAt: Date;
  dueDate: Date;
  returnedAt: Date | null;
}

export class Rental {
  private constructor(private readonly props: RentalProps) {}

  static create(params: {
    customerId: string;
    customerSnapshot: CustomerSnapshot;
    items: RentalItem[];
    subtotal: number;
    discountPercent: number;
    discountAmount: number;
    total: number;
    dueDate: Date;
  }): Rental {
    return new Rental({
      id: RentalId.create(),
      ...params,
      status: 'active',
      rentedAt: new Date(),
      returnedAt: null,
    });
  }

  static reconstitute(props: RentalProps): Rental {
    return new Rental(props);
  }

  get id(): RentalId {
    return this.props.id;
  }
  get customerId(): string {
    return this.props.customerId;
  }
  get customerSnapshot(): CustomerSnapshot {
    return this.props.customerSnapshot;
  }
  get items(): RentalItem[] {
    return this.props.items;
  }
  get subtotal(): number {
    return this.props.subtotal;
  }
  get discountPercent(): number {
    return this.props.discountPercent;
  }
  get discountAmount(): number {
    return this.props.discountAmount;
  }
  get total(): number {
    return this.props.total;
  }
  get status(): RentalStatus {
    return this.props.status;
  }
  get rentedAt(): Date {
    return this.props.rentedAt;
  }
  get dueDate(): Date {
    return this.props.dueDate;
  }
  get returnedAt(): Date | null {
    return this.props.returnedAt;
  }

  markAsReturned(): Rental {
    return new Rental({
      ...this.props,
      status: 'returned',
      returnedAt: new Date(),
    });
  }

  toJSON() {
    return {
      _id: this.props.id.value,
      id: this.props.id.value,
      customerId: this.props.customerId,
      customerSnapshot: this.props.customerSnapshot,
      items: this.props.items,
      subtotal: this.props.subtotal,
      discountPercent: this.props.discountPercent,
      discountAmount: this.props.discountAmount,
      total: this.props.total,
      status: this.props.status,
      rentedAt: this.props.rentedAt ? this.props.rentedAt.toISOString() : '',
      dueDate: this.props.dueDate ? this.props.dueDate.toISOString() : '',
      returnedAt: this.props.returnedAt ? this.props.returnedAt.toISOString() : null,
    };
  }
}
