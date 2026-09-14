import {
  IsString, IsEmail, IsDateString,
  IsNumber, IsOptional, ValidateNested, Min, Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CoordinatesDto {
  @IsNumber()
  @Min(-180) @Max(180)
  longitude: number;

  @IsNumber()
  @Min(-90) @Max(90)
  latitude: number;
}

export class AddressDto {
  @IsString()
  street: string;

  @IsString()
  city: string;

  @ValidateNested()
  @Type(() => CoordinatesDto)
  coordinates: CoordinatesDto;
}

export class RegisterCustomerDto {
  @IsString()
  @IsOptional()
  dni?: string;

  @IsString()
  fullName: string;

  @IsString()
  phone: string;

  @IsEmail()
  email: string;

  @IsDateString()
  birthDate: string;

  @ValidateNested()
  @Type(() => AddressDto)
  @IsOptional()
  address?: AddressDto;
}

export class UpdateCustomerDto {
  @IsString()
  @IsOptional()
  dni?: string;

  @IsString()
  @IsOptional()
  fullName?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsDateString()
  @IsOptional()
  birthDate?: string;

  @ValidateNested()
  @Type(() => AddressDto)
  @IsOptional()
  address?: AddressDto;
}

export class BlockCustomerDto {
  @IsString()
  reason: string;
}
