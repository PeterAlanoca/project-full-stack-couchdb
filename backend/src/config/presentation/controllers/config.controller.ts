import { Controller, Get, Put, Body } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import type { IBusinessRulesRepository } from '../../domain/repositories/business-rules.repository.interface.js';
import { BUSINESS_RULES_REPOSITORY } from '../../domain/repositories/business-rules.repository.interface.js';
import { IsArray, IsInt, IsNumber, IsOptional, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import type { RentalPrice, VolumeDiscount } from '../../domain/entities/business-rules.entity.js';

class RentalPriceDto {
  @IsInt() @Min(1) days: number;
  @IsNumber() @Min(0) priceBs: number;
}

class VolumeDiscountDto {
  @IsInt() @Min(1) minItems: number;
  @IsInt() @IsOptional() maxItems?: number | null;
  @IsNumber() @Min(0) discountPercent: number;
}

@Controller('config/business-rules')
export class ConfigController {
  constructor(
    @Inject(BUSINESS_RULES_REPOSITORY)
    private readonly rulesRepo: IBusinessRulesRepository,
  ) {}

  @Get()
  get() { return this.rulesRepo.get(); }

  @Put()
  async update(@Body() dto: { rentalPricing: RentalPriceDto[]; volumeDiscounts: VolumeDiscountDto[]; maxRentalDays: number }) {
    const current = await this.rulesRepo.get();
    const updated = current.update({
      rentalPricing: dto.rentalPricing as RentalPrice[],
      volumeDiscounts: dto.volumeDiscounts.map((d) => ({
        minItems: d.minItems,
        maxItems: d.maxItems ?? null,
        discountPercent: d.discountPercent,
      })) as VolumeDiscount[],
      maxRentalDays: dto.maxRentalDays,
    });
    return this.rulesRepo.save(updated);
  }
}
