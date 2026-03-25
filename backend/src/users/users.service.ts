import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly userSelectWithoutPassword = {
    id: true,
    email: true,
    name: true,
    role: true,
    institutionId: true,
    sectionId: true,
    mobileNumber: true,
    isActive: true,
    avatar: true,
    createdAt: true,
    updatedAt: true,
  };

  async findAllByInstitution(institutionId: string, sectionId?: string) {
    const where: any = { institutionId, isActive: true };
    if (sectionId) where.sectionId = sectionId;

    return this.prisma.user.findMany({
      where,
      select: this.userSelectWithoutPassword,
    });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: this.userSelectWithoutPassword,
    });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async updateUser(id: string, dto: UpdateUserDto, callerId?: string) {
    const targetUser = await this.findById(id);

    if (dto.role && dto.role !== targetUser.role) {
      if (!dto.currentPassword || !callerId) {
        throw new ForbiddenException(
          'Confirm password is required to change roles',
        );
      }

      const caller = await this.prisma.user.findUnique({
        where: { id: callerId },
      });
      if (!caller) throw new ForbiddenException('Admin account not found');

      const isValid = await bcrypt.compare(
        dto.currentPassword,
        caller.password,
      );
      if (!isValid) throw new ForbiddenException('Incorrect password');
    }

    const { currentPassword, ...updateData } = dto;

    return this.prisma.user.update({
      where: { id },
      data: updateData as any,
      select: this.userSelectWithoutPassword,
    });
  }

  async deleteUser(id: string, password?: string, callerId?: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException(`User with id ${id} not found`);

    if (callerId === id) {
      // Owner self-deletion: require password
      if (!password) {
        throw new ForbiddenException(
          'Password confirmation is required to delete your account',
        );
      }
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        throw new UnauthorizedException('Incorrect password');
      }
    } else if (callerId) {
      // Admin deletion: check if caller is admin
      const caller = await this.prisma.user.findUnique({
        where: { id: callerId },
      });
      if (!caller || caller.role !== 'ADMIN') {
        throw new ForbiddenException('Insufficient permissions');
      }
    } else {
      throw new UnauthorizedException();
    }

    return this.prisma.user.update({
      where: { id },
      data: { isActive: false },
      select: this.userSelectWithoutPassword,
    });
  }

  async updateAvatar(id: string, avatarPath: string) {
    return this.prisma.user.update({
      where: { id },
      data: { avatar: avatarPath },
      select: this.userSelectWithoutPassword,
    });
  }

  async getUserProfile(id: string) {
    return this.findById(id);
  }
}
