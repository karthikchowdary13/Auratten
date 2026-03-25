import { Module, forwardRef } from '@nestjs/common';
import { QrService } from './qr.service';
import { QrController } from './qr.controller';
import { JwtModule } from '@nestjs/jwt';
import { AttendanceModule } from '../attendance/attendance.module';

@Module({
  imports: [JwtModule.register({}), forwardRef(() => AttendanceModule)],
  controllers: [QrController],
  providers: [QrService],
  exports: [QrService],
})
export class QrModule {}
