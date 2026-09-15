import { UniqueId } from '../../../shared/domain/value-objects/unique-id.value-object.js';

export type AdminRole = 'superadmin' | 'admin';

export class AdminId extends UniqueId {
  protected constructor(value: string) {
    super(value);
  }

  static create(): AdminId {
    return new AdminId(UniqueId.generateCouchId('admin'));
  }

  static from(value: string): AdminId {
    return new AdminId(value);
  }
}

export interface AdminProps {
  id: AdminId;
  username: string;
  passwordHash: string;
  fullName: string;
  email: string;
  role: AdminRole;
  isActive: boolean;
  createdAt: Date;
  lastLoginAt: Date | null;
}

export class Admin {
  private constructor(private readonly props: AdminProps) {}

  static create(params: {
    username: string;
    passwordHash: string;
    fullName: string;
    email: string;
    role?: AdminRole;
  }): Admin {
    if (!params.username || params.username.trim().length < 3) {
      throw new Error('Admin username must have at least 3 characters.');
    }
    if (!params.passwordHash) {
      throw new Error('Password hash is required.');
    }
    const now = new Date();
    return new Admin({
      id: AdminId.create(),
      username: params.username.trim().toLowerCase(),
      passwordHash: params.passwordHash,
      fullName: params.fullName.trim(),
      email: (params.email || '').trim().toLowerCase(),
      role: params.role || 'admin',
      isActive: true,
      createdAt: now,
      lastLoginAt: null,
    });
  }

  static reconstitute(props: AdminProps): Admin {
    return new Admin(props);
  }

  get id(): AdminId {
    return this.props.id;
  }
  get username(): string {
    return this.props.username;
  }
  get passwordHash(): string {
    return this.props.passwordHash;
  }
  get fullName(): string {
    return this.props.fullName;
  }
  get email(): string {
    return this.props.email;
  }
  get role(): AdminRole {
    return this.props.role;
  }
  get isActive(): boolean {
    return this.props.isActive;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
  get lastLoginAt(): Date | null {
    return this.props.lastLoginAt;
  }

  recordLogin(): Admin {
    return new Admin({
      ...this.props,
      lastLoginAt: new Date(),
    });
  }

  toJSON() {
    return {
      _id: this.props.id.value,
      id: this.props.id.value,
      type: 'admin',
      username: this.props.username,
      fullName: this.props.fullName,
      email: this.props.email,
      role: this.props.role,
      isActive: this.props.isActive,
      createdAt: this.props.createdAt.toISOString(),
      lastLoginAt: this.props.lastLoginAt ? this.props.lastLoginAt.toISOString() : null,
    };
  }
}
