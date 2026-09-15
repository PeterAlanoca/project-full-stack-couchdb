import { UniqueId } from '../../../shared/domain/value-objects/unique-id.value-object.js';
import { GeoPoint } from '../../../shared/domain/value-objects/geolocation.value-object.js';

export type CustomerStatus = 'active' | 'blocked';

export interface BlockRecord {
  reason: string;
  blockedAt: Date;
}

export interface CustomerAddress {
  street: string;
  city: string;
  coordinates: GeoPoint;
}

export class CustomerId extends UniqueId {
  protected constructor(value: string) {
    super(value);
  }

  static create(): CustomerId {
    return new CustomerId(UniqueId.generateCouchId('customer'));
  }

  static from(value: string): CustomerId {
    return new CustomerId(value);
  }
}

export interface CustomerProps {
  id: CustomerId;
  dni: string;
  fullName: string;
  phone: string;
  email: string;
  birthDate: Date;
  address: CustomerAddress;
  status: CustomerStatus;
  block: BlockRecord | null;
  registeredAt: Date;
  updatedAt: Date;
  createdBy?: string | null;
  updatedBy?: string | null;
}

export class Customer {
  private constructor(private readonly props: CustomerProps) {}

  static create(params: {
    dni: string;
    fullName: string;
    phone: string;
    email: string;
    birthDate: Date;
    address: CustomerAddress;
    createdBy?: string | null;
  }): Customer {
    if (!params.fullName || params.fullName.trim().length === 0) {
      throw new Error('Customer fullName cannot be empty.');
    }
    if (!params.email || !params.email.includes('@')) {
      throw new Error('Invalid customer email.');
    }
    const now = new Date();
    return new Customer({
      id: CustomerId.create(),
      dni: (params.dni || '').trim(),
      fullName: params.fullName.trim(),
      phone: params.phone.trim(),
      email: params.email.trim().toLowerCase(),
      birthDate: params.birthDate,
      address: params.address,
      status: 'active',
      block: null,
      registeredAt: now,
      updatedAt: now,
      createdBy: params.createdBy || null,
      updatedBy: params.createdBy || null,
    });
  }

  static reconstitute(props: CustomerProps): Customer {
    return new Customer(props);
  }

  get id(): CustomerId {
    return this.props.id;
  }
  get dni(): string {
    return this.props.dni;
  }
  get fullName(): string {
    return this.props.fullName;
  }
  get phone(): string {
    return this.props.phone;
  }
  get email(): string {
    return this.props.email;
  }
  get birthDate(): Date {
    return this.props.birthDate;
  }
  get address(): CustomerAddress {
    return this.props.address;
  }
  get status(): CustomerStatus {
    return this.props.status;
  }
  get block(): BlockRecord | null {
    return this.props.block;
  }
  get registeredAt(): Date {
    return this.props.registeredAt;
  }
  get updatedAt(): Date {
    return this.props.updatedAt;
  }
  get createdBy(): string | null {
    return this.props.createdBy || null;
  }
  get updatedBy(): string | null {
    return this.props.updatedBy || null;
  }

  isBlocked(): boolean {
    return this.props.status === 'blocked';
  }

  blockCustomer(reason: string, adminId?: string): Customer {
    return new Customer({
      ...this.props,
      status: 'blocked',
      block: { reason, blockedAt: new Date() },
      updatedAt: new Date(),
      updatedBy: adminId || this.props.updatedBy || null,
    });
  }

  unblock(adminId?: string): Customer {
    return new Customer({
      ...this.props,
      status: 'active',
      block: null,
      updatedAt: new Date(),
      updatedBy: adminId || this.props.updatedBy || null,
    });
  }

  update(
    params: Partial<
      Pick<CustomerProps, 'dni' | 'fullName' | 'phone' | 'email' | 'birthDate' | 'address'>
    > & { updatedBy?: string | null },
  ): Customer {
    return new Customer({
      ...this.props,
      ...params,
      updatedAt: new Date(),
      updatedBy: params.updatedBy !== undefined ? params.updatedBy : this.props.updatedBy,
    });
  }

  toJSON() {
    return {
      _id: this.props.id.value,
      id: this.props.id.value,
      dni: this.props.dni || '',
      fullName: this.props.fullName,
      phone: this.props.phone,
      email: this.props.email,
      birthDate: this.props.birthDate ? this.props.birthDate.toISOString().split('T')[0] : '',
      address: this.props.address,
      status: this.props.status,
      block: this.props.block,
      registeredAt: this.props.registeredAt ? this.props.registeredAt.toISOString() : '',
      updatedAt: this.props.updatedAt ? this.props.updatedAt.toISOString() : '',
      createdBy: this.props.createdBy || null,
      updatedBy: this.props.updatedBy || null,
    };
  }
}
