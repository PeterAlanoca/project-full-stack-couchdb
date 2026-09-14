import { UniqueId } from '../../../shared/domain/value-objects/unique-id.value-object.js';

export type CopyStatus = 'available' | 'rented' | 'inactive';

export type DeactivationReason =
  | 'not_returned'
  | 'theft'
  | 'loss'
  | 'deterioration'
  | 'other';

export interface Deactivation {
  reason: DeactivationReason;
  notes?: string;
  date: Date;
}

export class CopyId extends UniqueId {
  protected constructor(value: string) {
    super(value);
  }

  static create(): CopyId {
    return new CopyId(UniqueId.generateCouchId('copy'));
  }

  static from(value: string): CopyId {
    return new CopyId(value);
  }
}

export interface CopyProps {
  id: CopyId;
  movieId: string;
  copyCode: string;
  status: CopyStatus;
  acquiredAt: Date;
  deactivation: Deactivation | null;
}

export class Copy {
  private constructor(private readonly props: CopyProps) {}

  static create(params: { movieId: string; copyCode: string }): Copy {
    return new Copy({
      id: CopyId.create(),
      movieId: params.movieId,
      copyCode: params.copyCode,
      status: 'available',
      acquiredAt: new Date(),
      deactivation: null,
    });
  }

  static reconstitute(props: CopyProps): Copy {
    return new Copy(props);
  }

  get id(): CopyId {
    return this.props.id;
  }
  get movieId(): string {
    return this.props.movieId;
  }
  get copyCode(): string {
    return this.props.copyCode;
  }
  get status(): CopyStatus {
    return this.props.status;
  }
  get acquiredAt(): Date {
    return this.props.acquiredAt;
  }
  get deactivation(): Deactivation | null {
    return this.props.deactivation;
  }

  isAvailable(): boolean {
    return this.props.status === 'available';
  }

  markAsRented(): Copy {
    return new Copy({ ...this.props, status: 'rented' });
  }

  markAsAvailable(): Copy {
    return new Copy({ ...this.props, status: 'available' });
  }

  deactivate(reason: DeactivationReason, notes?: string): Copy {
    return new Copy({
      ...this.props,
      status: 'inactive',
      deactivation: { reason, notes, date: new Date() },
    });
  }

  toJSON() {
    return {
      _id: this.props.id.value,
      id: this.props.id.value,
      movieId: this.props.movieId,
      copyCode: this.props.copyCode,
      status: this.props.status,
      acquiredAt: this.props.acquiredAt ? this.props.acquiredAt.toISOString() : '',
      deactivation: this.props.deactivation,
    };
  }
}
