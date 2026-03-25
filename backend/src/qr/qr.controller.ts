import {
  Controller,
  Post,
  Patch,
  Get,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { QrService } from './qr.service';
import { CreateQrSessionDto } from './dto/create-qr-session.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '../common/enums/role.enum';

@UseGuards(JwtAuthGuard)
@Controller('qr')
export class QrController {
  constructor(private readonly qrService: QrService) {}

  @UseGuards(RolesGuard)
  @Roles(Role.TEACHER, Role.ADMIN)
  @Post()
  createSession(@CurrentUser() user: any, @Body() dto: CreateQrSessionDto) {
    return this.qrService.createSession(
      user.id,
      dto.institutionId,
      dto.expiresInMinutes,
      dto.sectionId,
    );
  }

  @UseGuards(RolesGuard)
  @Roles(Role.TEACHER, Role.ADMIN)
  @Patch(':id/rotate')
  rotateToken(@Param('id') id: string) {
    return this.qrService.generateRotatingToken(id);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.TEACHER, Role.ADMIN, Role.HR)
  @Get('institution/:id')
  getActiveSessions(@Param('id') institutionId: string) {
    return this.qrService.getActiveSessions(institutionId);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.TEACHER, Role.ADMIN, Role.HR)
  @Get('history/:id')
  getHistory(@Param('id') institutionId: string) {
    return this.qrService.getSessionHistory(institutionId);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.TEACHER, Role.ADMIN)
  @Patch(':id/end')
  endSession(@Param('id') id: string) {
    return this.qrService.endSession(id);
  }
}
