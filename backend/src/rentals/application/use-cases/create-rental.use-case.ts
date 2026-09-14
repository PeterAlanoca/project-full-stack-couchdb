import { Inject, Injectable } from '@nestjs/common';
import { Rental } from '../../domain/entities/rental.entity.js';
import { PricingDomainService } from '../../domain/services/pricing.domain-service.js';
import type { IRentalRepository } from '../../domain/repositories/rental.repository.interface.js';
import { RENTAL_REPOSITORY } from '../../domain/repositories/rental.repository.interface.js';
import type { ICustomerRepository } from '../../../customers/domain/repositories/customer.repository.interface.js';
import { CUSTOMER_REPOSITORY } from '../../../customers/domain/repositories/customer.repository.interface.js';
import type { ICopyRepository } from '../../../copies/domain/repositories/copy.repository.interface.js';
import { COPY_REPOSITORY } from '../../../copies/domain/repositories/copy.repository.interface.js';
import type { IMovieRepository } from '../../../movies/domain/repositories/movie.repository.interface.js';
import { MOVIE_REPOSITORY } from '../../../movies/domain/repositories/movie.repository.interface.js';
import type { IBusinessRulesRepository } from '../../../config/domain/repositories/business-rules.repository.interface.js';
import { BUSINESS_RULES_REPOSITORY } from '../../../config/domain/repositories/business-rules.repository.interface.js';
import {
  CustomerBlockedException,
  NoCopiesAvailableException,
  EntityNotFoundException,
} from '../../../shared/application/exceptions/domain.exception.js';
import { CreateRentalDto } from './rental.dto.js';

@Injectable()
export class CreateRentalUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY) private readonly customerRepo: ICustomerRepository,
    @Inject(COPY_REPOSITORY) private readonly copyRepo: ICopyRepository,
    @Inject(MOVIE_REPOSITORY) private readonly movieRepo: IMovieRepository,
    @Inject(RENTAL_REPOSITORY) private readonly rentalRepo: IRentalRepository,
    @Inject(BUSINESS_RULES_REPOSITORY) private readonly rulesRepo: IBusinessRulesRepository,
  ) {}

  async execute(dto: CreateRentalDto): Promise<Rental> {
    const customer = await this.customerRepo.findById(dto.customerId);
    if (!customer) throw new EntityNotFoundException('Customer', dto.customerId);
    if (customer.isBlocked()) throw new CustomerBlockedException(dto.customerId);

    const rules = await this.rulesRepo.get();

    const resolvedItems: Array<{
      copyId: string; movieId: string; movieTitle: string; days: number;
    }> = [];

    for (const item of dto.items) {
      const movie = await this.movieRepo.findById(item.movieId);
      if (!movie) throw new EntityNotFoundException('Movie', item.movieId);

      const availableCopies = await this.copyRepo.findAvailableByMovieId(item.movieId);
      if (availableCopies.length === 0) throw new NoCopiesAvailableException(item.movieId);

      resolvedItems.push({
        copyId: availableCopies[0].id.value,
        movieId: item.movieId,
        movieTitle: movie.title,
        days: item.days,
      });
    }

    const pricing = PricingDomainService.calculateRentalPricing(resolvedItems, rules);

    const copiesToUpdate = await Promise.all(
      resolvedItems.map((i) => this.copyRepo.findById(i.copyId)),
    );
    const rentedCopies = copiesToUpdate
      .filter((c): c is NonNullable<(typeof copiesToUpdate)[number]> => c !== null)
      .map((c) => c.markAsRented());
    await this.copyRepo.bulkUpdate(rentedCopies);

    const maxDays = Math.max(...dto.items.map((i) => i.days));
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + maxDays);

    const rental = Rental.create({
      customerId: dto.customerId,
      customerSnapshot: {
        fullName: customer.fullName,
        email: customer.email,
        dni: customer.dni || '',
      },
      items: pricing.items,
      subtotal: pricing.subtotal,
      discountPercent: pricing.discountPercent,
      discountAmount: pricing.discountAmount,
      total: pricing.total,
      dueDate,
    });

    return this.rentalRepo.save(rental);
  }
}

@Injectable()
export class PreviewRentalPriceUseCase {
  constructor(
    @Inject(BUSINESS_RULES_REPOSITORY) private readonly rulesRepo: IBusinessRulesRepository,
  ) {}

  async execute(items: Array<{ days: number }>) {
    const rules = await this.rulesRepo.get();
    const fakeItems = items.map((item, i) => ({
      copyId: `preview-${i}`,
      movieId: `preview-${i}`,
      movieTitle: `Película ${i + 1}`,
      days: item.days,
    }));
    return PricingDomainService.calculateRentalPricing(fakeItems, rules);
  }
}
