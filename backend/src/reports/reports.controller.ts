import { Controller, Get, Param, Query, UseGuards, Res } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import type { Response } from 'express';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Roles(Role.STUDENT, Role.TEACHER, Role.ADMIN, Role.HR)
  @Get('student/:userId')
  async getStudentReport(
    @Param('userId') userId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.generateStudentReport(
      userId,
      startDate,
      endDate,
    );
  }

  @Roles(Role.ADMIN, Role.HR, Role.TEACHER)
  @Get('institution/:institutionId')
  async getInstitutionReport(
    @Param('institutionId') institutionId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('sectionId') sectionId?: string,
  ) {
    return this.reportsService.generateInstitutionReport(
      institutionId,
      startDate,
      endDate,
      sectionId,
    );
  }

  @Roles(Role.STUDENT, Role.TEACHER, Role.ADMIN, Role.HR)
  @Get('student/:userId/pdf')
  async downloadStudentPDF(
    @Res() res: Response,
    @Param('userId') userId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    try {
      const reportData = await this.reportsService.generateStudentReport(
        userId,
        startDate,
        endDate,
      );
      const buffer = await this.reportsService.generatePDF(
        reportData,
        'STUDENT',
      );

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=Student_Report_${userId}.pdf`,
        'Content-Length': buffer.length,
      });

      res.end(buffer);
    } catch (error) {
      console.error('[ReportsController] downloadStudentPDF error:', error);
      res.status(500).json({ message: 'Could not generate PDF' });
    }
  }

  @Roles(Role.ADMIN, Role.HR, Role.TEACHER)
  @Get('institution/:institutionId/pdf')
  async downloadInstitutionPDF(
    @Res() res: Response,
    @Param('institutionId') institutionId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('sectionId') sectionId?: string,
  ) {
    try {
      const reportData = await this.reportsService.generateInstitutionReport(
        institutionId,
        startDate,
        endDate,
        sectionId,
      );
      const buffer = await this.reportsService.generatePDF(
        reportData,
        'INSTITUTION',
      );

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=Institution_Report_${institutionId}.pdf`,
        'Content-Length': buffer.length,
      });

      res.end(buffer);
    } catch (error) {
      console.error('[ReportsController] downloadInstitutionPDF error:', error);
      res.status(500).json({ message: 'Could not generate institution PDF' });
    }
  }
}
