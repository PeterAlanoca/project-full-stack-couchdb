import { Rental } from '../entities/rental.entity.js';

export interface IRentalRepository {
  findById(id: string): Promise<Rental | null>;
  findAll(): Promise<Rental[]>;
  findByCustomerId(customerId: string): Promise<Rental[]>;
  save(rental: Rental): Promise<Rental>;
  update(rental: Rental): Promise<Rental>;
}

export const RENTAL_REPOSITORY = Symbol('IRentalRepository');
