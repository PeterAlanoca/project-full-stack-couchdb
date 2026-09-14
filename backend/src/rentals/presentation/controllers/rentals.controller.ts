import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { CreateRentalUseCase, PreviewRentalPriceUseCase } from '../../application/use-cases/create-rental.use-case.js';
import { ReturnRentalUseCase } from '../../application/use-cases/return-rental.use-case.js';
import { CreateRentalDto, PreviewRentalDto } from '../../application/use-cases/rental.dto.js';
import { Inject } from '@nestjs/common';
import type { IRentalRepository } from '../../domain/repositories/rental.repository.interface.js';
import { RENTAL_REPOSITORY } from '../../domain/repositories/rental.repository.interface.js';
import type { ICustomerRepository } from '../../../customers/domain/repositories/customer.repository.interface.js';
import { CUSTOMER_REPOSITORY } from '../../../customers/domain/repositories/customer.repository.interface.js';

@Controller('rentals')
export class RentalsController {
  constructor(
    @Inject(RENTAL_REPOSITORY) private readonly rentalRepo: IRentalRepository,
    @Inject(CUSTOMER_REPOSITORY) private readonly customerRepo: ICustomerRepository,
    private readonly createRentalUseCase: CreateRentalUseCase,
    private readonly previewPriceUseCase: PreviewRentalPriceUseCase,
    private readonly returnRentalUseCase: ReturnRentalUseCase,
  ) {}

  @Get()
  async findAll() {
    const rentals = await this.rentalRepo.findAll();
    return Promise.all(
      rentals.map(async (r) => {
        const json = r.toJSON();
        if (!json.customerSnapshot?.dni && json.customerId) {
          const cust = await this.customerRepo.findById(json.customerId);
          if (cust) {
            json.customerSnapshot = {
              fullName: json.customerSnapshot?.fullName || cust.fullName,
              email: json.customerSnapshot?.email || cust.email,
              dni: cust.dni || '',
            };
          }
        }
        return json;
      }),
    );
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.rentalRepo.findById(id);
  }

  @Post()
  create(@Body() dto: CreateRentalDto) {
    return this.createRentalUseCase.execute(dto);
  }

  @Post('preview')
  preview(@Body() dto: PreviewRentalDto) {
    return this.previewPriceUseCase.execute(dto.items);
  }

  @Patch(':id/return')
  returnRental(@Param('id') id: string) {
    return this.returnRentalUseCase.execute(id);
  }
}
