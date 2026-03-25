import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';
import { Role } from '../../common/enums/role.enum';

export class RegisterDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  mobileNumber: string;

  @IsString()
  emailOtp: string;

  @IsString()
  mobileOtp: string;

  @IsEnum(Role)
  role: Role;
}
