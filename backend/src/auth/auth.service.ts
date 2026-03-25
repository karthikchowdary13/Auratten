import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { Role } from '../common/enums/role.enum';

import { OtpService } from './otp.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly otpService: OtpService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12);

    const isEmailVerified = await this.otpService.isVerified(
      dto.email,
      'EMAIL',
      dto.emailOtp,
    );
    const isMobileVerified = await this.otpService.isVerified(
      dto.mobileNumber,
      'MOBILE',
      dto.mobileOtp,
    );

    if (!isEmailVerified || !isMobileVerified) {
      throw new BadRequestException('Email or Mobile number not verified');
    }

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
        role: dto.role,
        mobileNumber: dto.mobileNumber,
        isEmailVerified: true,
        isMobileVerified: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        institutionId: true,
        isActive: true,
        avatar: true,
        isEmailVerified: true,
        isMobileVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Cleanup used OTPs
    await this.prisma.otpRecord.deleteMany({
      where: {
        identifier: { in: [dto.email, dto.mobileNumber] },
      },
    });

    return user;
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = this.generateTokens(user.id, user.role as Role);

    const { password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      ...tokens,
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        institutionId: true,
        institution: {
          select: {
            name: true,
            code: true,
          },
        },
        mobileNumber: true,
        avatar: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  async verifyPassword(userId: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    return { success: true };
  }

  async changePassword(userId: string, currentPass: string, newPass: string) {
    await this.verifyPassword(userId, currentPass);

    const hashedNewPassword = await bcrypt.hash(newPass, 12);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    return { message: 'Password changed successfully' };
  }

  private generateTokens(userId: string, role: Role) {
    const payload = { sub: userId, role };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwtSecret') as string,
      expiresIn: this.configService.get<string>('jwtExpiresIn') as `${number}s`,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwtRefreshSecret') as string,
      expiresIn: this.configService.get<string>(
        'jwtRefreshExpiresIn',
      ) as `${number}s`,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async sendOtp(identifier: string, type: 'EMAIL' | 'MOBILE') {
    const code = await this.otpService.generateOtp(identifier, type);

    let sent = false;
    if (type === 'EMAIL') {
      sent = await this.notificationsService.sendEmailOtp(identifier, code);
    } else {
      sent = await this.notificationsService.sendSMSOtp(identifier, code);
    }

    if (!sent) {
      console.error(
        `[AuthService] FAILED to send OTP to ${identifier}. Is AWS configured?`,
      );
      // For development/debugging, we'll log the code so the user can still test
      console.log(`[DEBUG] OTP for ${identifier} is: ${code}`);
      throw new BadRequestException(
        `Failed to send OTP to ${identifier}. Please check server logs or AWS configuration.`,
      );
    }

    console.log(`[AuthService] OTP successfully sent to ${identifier}`);

    return { success: true, message: `OTP sent to ${identifier}` };
  }

  async verifyOtp(identifier: string, code: string, type: 'EMAIL' | 'MOBILE') {
    const isValid = await this.otpService.verifyOtp(identifier, code, type);
    return { success: isValid };
  }
}
