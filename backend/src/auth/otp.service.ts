import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class OtpService {
  constructor(private prisma: PrismaService) {}

  async generateOtp(identifier: string, type: 'EMAIL' | 'MOBILE') {
    // Generate 6 digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // Delete any existing OTP for this identifier and type
    await this.prisma.otpRecord.deleteMany({
      where: { identifier, type },
    });

    // Create new record
    await this.prisma.otpRecord.create({
      data: {
        identifier,
        type,
        code, // In a production app, you might want to hash this
        expiresAt,
      },
    });

    return code;
  }

  async verifyOtp(identifier: string, code: string, type: 'EMAIL' | 'MOBILE') {
    const otpRecord = await this.prisma.otpRecord.findFirst({
      where: {
        identifier,
        type,
        code,
        expiresAt: { gt: new Date() },
      },
    });

    if (!otpRecord) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    // OTP is valid, but we don't delete it yet because we need to check it
    // again during the final registration call.
    // Or we can delete it and return a success status that the frontend tracks.
    // For pre-registration, we'll keep it for a short while or mark it as verified.

    return true;
  }

  async isVerified(identifier: string, type: 'EMAIL' | 'MOBILE', code: string) {
    const otpRecord = await this.prisma.otpRecord.findFirst({
      where: {
        identifier,
        type,
        code,
        expiresAt: { gt: new Date() },
      },
    });

    return !!otpRecord;
  }
}
