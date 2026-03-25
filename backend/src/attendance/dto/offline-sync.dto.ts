import {
  IsArray,
  IsString,
  IsOptional,
  IsISO8601,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class OfflineRecordDto {
  @IsString()
  token: string;

  @IsString()
  deviceFingerprint: string;

  @IsISO8601()
  markedAt: string;

  @IsOptional()
  @IsString()
  latitude?: string;

  @IsOptional()
  @IsString()
  longitude?: string;
}

export class OfflineSyncDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OfflineRecordDto)
  records: OfflineRecordDto[];
}
