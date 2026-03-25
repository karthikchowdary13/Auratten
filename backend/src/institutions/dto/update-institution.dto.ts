import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateInstitutionDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  code?: string;

  @IsOptional()
  @IsString()
  address?: string;
}
