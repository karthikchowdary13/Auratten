import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AttendanceService } from '../attendance/attendance.service';

@Injectable()
export class QrService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => AttendanceService))
    private readonly attendanceService: AttendanceService,
  ) {}

  async createSession(
    teacherId: string,
    institutionId: string,
    expiresInMinutes: number = 60,
    sectionId?: string,
  ) {
    console.log(
      `[QrService] Creating session for institution: ${institutionId}, section: ${sectionId || 'None'}`,
    );
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

    const session = await this.prisma.qRSession.create({
      data: {
        createdById: teacherId,
        institutionId,
        sectionId,
        expiresAt,
        isActive: true,
      },
      include: {
        section: {
          include: {
            users: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    const { token } = await this.generateRotatingToken(session.id);

    // Automatically mark absentees for the session
    await this.attendanceService.markAbsentees(session.id);

    return {
      session,
      token,
    };
  }

  async generateRotatingToken(sessionId: string) {
    const session = await this.prisma.qRSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) throw new NotFoundException('Session not found');
    if (!session.isActive)
      throw new ForbiddenException('Session is no longer active');
    if (session.expiresAt < new Date()) {
      await this.endSession(sessionId);
      throw new ForbiddenException('Session has expired globally');
    }

    const payload = {
      sub: sessionId,
      type: 'qr_attendance',
      iat: Math.floor(Date.now() / 1000),
    };

    // This token is strictly powerful but expires in 30 seconds
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwtSecret') as string,
      expiresIn: '30s',
    });

    return { token };
  }

  async getActiveSessions(institutionId: string) {
    return this.prisma.qRSession.findMany({
      where: { institutionId, isActive: true },
      include: {
        createdBy: { select: { id: true, name: true } },
        section: {
          include: {
            users: { select: { id: true, name: true, email: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getSessionHistory(institutionId: string) {
    return this.prisma.qRSession.findMany({
      where: { institutionId },
      include: {
        createdBy: { select: { id: true, name: true } },
        section: {
          select: {
            id: true,
            name: true,
            _count: { select: { users: true } },
          },
        },
        _count: { select: { attendanceRecords: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async endSession(sessionId: string) {
    const session = await this.prisma.qRSession.update({
      where: { id: sessionId },
      data: { isActive: false },
    });

    // Trigger automated absentee marking for the section
    await this.attendanceService.markAbsentees(sessionId);

    return session;
  }
}
