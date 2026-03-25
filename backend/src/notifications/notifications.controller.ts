import { Controller, Post, UseGuards, Body, Param } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Roles(Role.ADMIN, Role.TEACHER, Role.HR)
  @Post('notify-parent/:studentId')
  async notifyParent(@Param('studentId') studentId: string) {
    return this.notificationsService.triggerManualParentAlert(studentId);
  }

  @Roles(Role.ADMIN)
  @Post('test-email')
  async testEmail(@Body() body: { email: string }) {
    return this.notificationsService.sendAttendanceConfirmation(
      body.email,
      'Test Class',
      new Date(),
    );
  }
}
