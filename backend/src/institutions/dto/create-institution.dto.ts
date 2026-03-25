import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateInstitutionDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsString()
  @MinLength(3)
  code: string;

  @IsOptional()
  @IsString()
  address?: string;
}
