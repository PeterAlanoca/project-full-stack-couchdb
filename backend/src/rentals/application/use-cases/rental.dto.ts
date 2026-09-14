import { IsString, IsArray, ValidateNested, IsInt, Min, Max, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

export class RentalItemDto {
  @IsString()
  movieId: string;

  @IsInt()
  @Min(1)
  @Max(5)
  days: number;
}

export class CreateRentalDto {
  @IsString()
  customerId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RentalItemDto)
  @ArrayMinSize(1)
  items: RentalItemDto[];
}

export class PreviewRentalDto {
  @IsInt()
  @Min(1)
  itemCount: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RentalItemDto)
  @ArrayMinSize(1)
  items: RentalItemDto[];
}
