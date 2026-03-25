import { IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateQrSessionDto {
  @IsString()
  institutionId: string;

  @IsOptional()
  @IsString()
  sectionId?: string;

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  expiresInMinutes?: number = 60; // Default session lives for 1 hour before expiring completely
}
