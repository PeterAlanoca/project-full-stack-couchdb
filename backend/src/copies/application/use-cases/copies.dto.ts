import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

export type DeactivationReason =
  | 'not_returned'
  | 'theft'
  | 'loss'
  | 'deterioration'
  | 'other';

export class AddCopiesDto {
  @IsInt()
  @Min(1)
  quantity: number;
}

export class DeactivateCopyDto {
  @IsEnum(['not_returned', 'theft', 'loss', 'deterioration', 'other'])
  reason: DeactivationReason;

  @IsString()
  @IsOptional()
  notes?: string;
}
