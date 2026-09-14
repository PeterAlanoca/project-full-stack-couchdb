import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import {
  RegisterCustomerUseCase,
  UpdateCustomerUseCase,
  BlockCustomerUseCase,
  UnblockCustomerUseCase,
} from '../../application/use-cases/customer.use-cases.js';
import { RegisterCustomerDto, UpdateCustomerDto, BlockCustomerDto } from '../../application/use-cases/customer.dto.js';
import { Inject } from '@nestjs/common';
import type { ICustomerRepository } from '../../domain/repositories/customer.repository.interface.js';
import { CUSTOMER_REPOSITORY } from '../../domain/repositories/customer.repository.interface.js';

@Controller('customers')
export class CustomersController {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository,
    private readonly registerUseCase: RegisterCustomerUseCase,
    private readonly updateUseCase: UpdateCustomerUseCase,
    private readonly blockUseCase: BlockCustomerUseCase,
    private readonly unblockUseCase: UnblockCustomerUseCase,
  ) {}

  @Get()
  findAll() {
    return this.customerRepository.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.customerRepository.findById(id);
  }

  @Post()
  register(@Body() dto: RegisterCustomerDto) {
    return this.registerUseCase.execute(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCustomerDto) {
    return this.updateUseCase.execute(id, dto);
  }

  @Patch(':id/block')
  block(@Param('id') id: string, @Body() dto: BlockCustomerDto) {
    return this.blockUseCase.execute(id, dto);
  }

  @Patch(':id/unblock')
  unblock(@Param('id') id: string) {
    return this.unblockUseCase.execute(id);
  }
}
