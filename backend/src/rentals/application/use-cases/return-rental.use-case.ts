import { Inject, Injectable } from '@nestjs/common';
import { Rental } from '../../domain/entities/rental.entity.js';
import type { IRentalRepository } from '../../domain/repositories/rental.repository.interface.js';
import { RENTAL_REPOSITORY } from '../../domain/repositories/rental.repository.interface.js';
import type { ICopyRepository } from '../../../copies/domain/repositories/copy.repository.interface.js';
import { COPY_REPOSITORY } from '../../../copies/domain/repositories/copy.repository.interface.js';
import { EntityNotFoundException } from '../../../shared/application/exceptions/domain.exception.js';

@Injectable()
export class ReturnRentalUseCase {
  constructor(
    @Inject(RENTAL_REPOSITORY) private readonly rentalRepo: IRentalRepository,
    @Inject(COPY_REPOSITORY) private readonly copyRepo: ICopyRepository,
  ) {}

  async execute(rentalId: string): Promise<Rental> {
    const rental = await this.rentalRepo.findById(rentalId);
    if (!rental) {
      throw new EntityNotFoundException('Rental', rentalId);
    }

    if (rental.status === 'returned') {
      return rental;
    }

    // Release and mark all rented copies as available again
    for (const item of rental.items) {
      if (item.copyId) {
        const copy = await this.copyRepo.findById(item.copyId);
        if (copy) {
          const availableCopy = copy.markAsAvailable();
          await this.copyRepo.update(availableCopy);
        }
      }
    }

    const returnedRental = rental.markAsReturned();
    return this.rentalRepo.update(returnedRental);
  }
}
