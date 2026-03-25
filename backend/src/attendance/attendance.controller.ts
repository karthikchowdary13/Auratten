import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Ip,
  Req,
  Query,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';
import { OfflineSyncDto } from './dto/offline-sync.dto';
import { ManualAttendanceDto } from './dto/manual-attendance.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '../common/enums/role.enum';
import type { Request } from 'express';

@UseGuards(JwtAuthGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @UseGuards(RolesGuard)
  @Roles(Role.STUDENT)
  @Post('mark')
  markAttendance(
    @CurrentUser() user: any,
    @Body() dto: MarkAttendanceDto,
    @Ip() ipAddress: string,
    @Req() request: Request,
  ) {
    const finalIp = (request.headers['x-forwarded-for'] as string) || ipAddress;
    return this.attendanceService.markAttendance(user.id, {
      ...dto,
      ipAddress: finalIp,
    });
  }

  @UseGuards(RolesGuard)
  @Roles(Role.STUDENT)
  @Post('sync')
  syncOfflineAttendance(@CurrentUser() user: any, @Body() dto: OfflineSyncDto) {
    return this.attendanceService.syncOfflineAttendance(user.id, dto);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.STUDENT)
  @Get('my')
  getMyAttendance(
    @CurrentUser() user: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.attendanceService.getStudentAttendance(user.id, {
      startDate,
      endDate,
      institutionId: user.institutionId,
    });
  }

  @UseGuards(RolesGuard)
  @Roles(Role.TEACHER, Role.ADMIN, Role.HR)
  @Get('session/:id')
  getSessionAttendance(
    @CurrentUser() user: any,
    @Param('id') sessionId: string,
  ) {
    return this.attendanceService.getClassAttendance(
      user.institutionId,
      sessionId,
    );
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.HR)
  @Get('summary')
  getSummary(
    @CurrentUser() user: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.attendanceService.getAttendanceSummary(
      user.institutionId,
      startDate,
      endDate,
    );
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.TEACHER)
  @Post('manual')
  markManual(@CurrentUser() user: any, @Body() dto: ManualAttendanceDto) {
    return this.attendanceService.markManualAttendance(
      user.id,
      dto.userId,
      dto.sessionId,
      dto.status,
    );
  }

  @UseGuards(RolesGuard)
  @Roles(Role.TEACHER, Role.ADMIN, Role.HR)
  @Get('recent')
  getRecent(@CurrentUser() user: any) {
    return this.attendanceService.getRecentActivity(user.institutionId);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.TEACHER, Role.ADMIN, Role.HR)
  @Get('analytics')
  getAnalytics(
    @CurrentUser() user: any,
    @Query('sectionId') sectionId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.attendanceService.getAnalytics(
      user.institutionId,
      sectionId,
      startDate,
      endDate,
    );
  }

  @UseGuards(RolesGuard)
  @Roles(Role.TEACHER, Role.ADMIN, Role.HR)
  @Get('user/:id')
  async getUserDetails(
    @CurrentUser() user: any,
    @Param('id') studentId: string,
  ) {
    // Verification: ensure student is in the same institution
    const student = await this.attendanceService.getStudentAttendance(
      studentId,
      { institutionId: user.institutionId },
    );
    const history = await this.attendanceService.getStudentHistory(studentId);
    return { ...student, history };
  }
}
