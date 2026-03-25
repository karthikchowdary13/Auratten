import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class MarkAttendanceDto {
  @IsNotEmpty()
  @IsString()
  token: string; // The 30s rotating JWT from the QR code

  @IsNotEmpty()
  @IsString()
  deviceFingerprint: string;

  @IsOptional()
  @IsString()
  ipAddress?: string;
}
