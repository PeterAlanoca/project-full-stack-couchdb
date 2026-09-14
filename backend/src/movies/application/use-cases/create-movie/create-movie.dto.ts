import {
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  Min,
  IsInt,
  ValidateNested,
  IsBoolean,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class OscarDto {
  @IsString()
  category: string;

  @IsInt()
  @Min(1929)
  year: number;

  @IsBoolean()
  won: boolean;
}

export class CreateMovieDto {
  @IsString()
  title: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  alternativeTitles?: string[] = [];

  @IsInt()
  @Min(1)
  durationMinutes: number;

  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  genres: string[];

  @IsInt()
  @Min(1888)
  year: number;

  @IsArray()
  @IsString({ each: true })
  actors: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OscarDto)
  @IsOptional()
  oscars?: OscarDto[] = [];

  @IsNumber()
  @Min(0)
  unitCostBs: number;

  @IsInt()
  @Min(1)
  initialCopies: number;
}
