import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { SectionsService } from './sections.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('sections')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SectionsController {
  constructor(private readonly sectionsService: SectionsService) {}

  @Get('institution/:institutionId')
  @Roles(Role.ADMIN, Role.TEACHER)
  async findByInstitution(@Param('institutionId') institutionId: string) {
    return this.sectionsService.findAll(institutionId);
  }

  @Post('institution/:institutionId/auto-assign')
  @Roles(Role.ADMIN, Role.TEACHER)
  async autoAssignStudents(@Param('institutionId') institutionId: string) {
    return this.sectionsService.autoAssignStudents(institutionId);
  }

  @Post()
  @Roles(Role.ADMIN, Role.TEACHER)
  async create(@Body() body: { institutionId: string; name: string }) {
    return this.sectionsService.create(body.institutionId, body.name);
  }

  @Post(':id/assign')
  @Roles(Role.ADMIN, Role.TEACHER)
  async assignStudents(
    @Param('id') id: string,
    @Body() body: { studentIds: string[] },
  ) {
    return this.sectionsService.assignStudents(id, body.studentIds);
  }

  @Post(':id/remove-student')
  @Roles(Role.ADMIN, Role.TEACHER)
  async removeStudent(
    @Param('id') id: string,
    @Body() body: { studentId: string },
  ) {
    return this.sectionsService.removeStudent(id, body.studentId);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.TEACHER)
  async delete(@Param('id') id: string) {
    return this.sectionsService.delete(id);
  }
}
