import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '../common/enums/role.enum';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  getProfile(@CurrentUser() user: { id: string }) {
    return this.usersService.getUserProfile(user.id);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.HR, Role.TEACHER)
  @Get()
  findAllByInstitution(
    @Query('institutionId') institutionId: string,
    @Query('sectionId') sectionId?: string,
  ) {
    return this.usersService.findAllByInstitution(institutionId, sectionId);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.TEACHER)
  @Patch(':id')
  updateUser(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.usersService.updateUser(id, dto, user.id);
  }

  @Delete(':id')
  deleteUser(
    @Param('id') id: string,
    @Body() data: { password?: string },
    @CurrentUser() caller: { id: string },
  ) {
    return this.usersService.deleteUser(id, data.password, caller.id);
  }

  @Patch(':id/avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = './uploads/avatars';
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const userId = req.params.id as string;
          cb(
            null,
            `${userId}-${uniqueSuffix}${extname(file.originalname)}`,
          );
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    }),
  )
  uploadAvatar(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    console.log(
      `Upload attempt for user ${id}. File:`,
      file ? file.originalname : 'MISSING',
    );
    if (!file) throw new BadRequestException('File is required');

    // Anyone can upload their own avatar, or admins can upload for others
    const fileUrl = `/uploads/avatars/${file.filename}`;
    return this.usersService.updateAvatar(id, fileUrl);
  }
}
