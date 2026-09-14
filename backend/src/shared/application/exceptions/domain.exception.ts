export class DomainException extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = 'DomainException';
  }
}

export class CustomerBlockedException extends DomainException {
  constructor(customerId: string) {
    super(
      `Customer '${customerId}' is blocked and cannot rent movies.`,
      'CUSTOMER_BLOCKED',
    );
  }
}

export class NoCopiesAvailableException extends DomainException {
  constructor(movieId: string) {
    super(
      `No available copies for movie '${movieId}'.`,
      'NO_COPIES_AVAILABLE',
    );
  }
}

export class RentalDaysExceededException extends DomainException {
  constructor(days: number, maxDays: number) {
    super(
      `Rental days (${days}) exceed the maximum allowed (${maxDays}).`,
      'RENTAL_DAYS_EXCEEDED',
    );
  }
}

export class EntityNotFoundException extends DomainException {
  constructor(entity: string, id: string) {
    super(`${entity} with id '${id}' not found.`, 'ENTITY_NOT_FOUND');
  }
}
