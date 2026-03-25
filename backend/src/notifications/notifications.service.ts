import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  private sesClient: SESClient;
  private snsClient: SNSClient;
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const region = this.configService.get<string>('AWS_REGION') || 'ap-south-1';
    const accessKeyId =
      this.configService.get<string>('AWS_ACCESS_KEY_ID') || '';
    const secretAccessKey =
      this.configService.get<string>('AWS_SECRET_ACCESS_KEY') || '';

    const credentials = { accessKeyId, secretAccessKey };

    this.sesClient = new SESClient({ region, credentials });
    this.snsClient = new SNSClient({ region, credentials });
  }

  async sendAbsenceAlertToParent(
    studentName: string,
    parentEmail: string,
    className: string,
    date: string,
  ) {
    const fromEmail = this.configService.get<string>('SES_FROM_EMAIL');
    const viewReportLink = `${this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001'}/dashboard/reports`;

    const command = new SendEmailCommand({
      Destination: { ToAddresses: [parentEmail] },
      Message: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: `
                            <h2>Attendance Alert</h2>
                            <p>Dear Parent,</p>
                            <p>This is to inform you that <strong>${studentName}</strong> was absent today for the class <strong>${className}</strong> on <strong>${date}</strong>.</p>
                            <p>You can view the full attendance report here: <a href="${viewReportLink}">${viewReportLink}</a></p>
                            <p>Regards,<br>Auratten Team</p>
                        `,
          },
          Text: {
            Charset: 'UTF-8',
            Data: `Attendance Alert: ${studentName} was absent today for the class ${className} on ${date}. View report: ${viewReportLink}`,
          },
        },
        Subject: {
          Charset: 'UTF-8',
          Data: `Attendance Alert — ${studentName} was absent today`,
        },
      },
      Source: fromEmail,
    });

    try {
      const result = await this.sesClient.send(command);
      this.logger.log(
        `Absence alert sent to ${parentEmail}. MessageId: ${result.MessageId}`,
      );
      return result.MessageId;
    } catch (error) {
      this.logger.error(
        `Failed to send absence alert to ${parentEmail}`,
        error.stack,
      );
      return null;
    }
  }

  async sendAttendanceConfirmation(
    studentEmail: string,
    className: string,
    markedAt: Date,
  ) {
    const fromEmail = this.configService.get<string>('SES_FROM_EMAIL');
    const timestamp = markedAt.toLocaleString();

    const command = new SendEmailCommand({
      Destination: { ToAddresses: [studentEmail] },
      Message: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: `
                            <h2>Attendance Marked</h2>
                            <p>Hi,</p>
                            <p>Your attendance for <strong>${className}</strong> has been marked successfully.</p>
                            <p><strong>Time:</strong> ${timestamp}</p>
                            <p>Regards,<br>Auratten Team</p>
                        `,
          },
          Text: {
            Charset: 'UTF-8',
            Data: `Attendance Marked: Your attendance for ${className} was marked successfully at ${timestamp}.`,
          },
        },
        Subject: {
          Charset: 'UTF-8',
          Data: `Attendance Marked — ${className}`,
        },
      },
      Source: fromEmail,
    });

    try {
      const result = await this.sesClient.send(command);
      this.logger.log(
        `Attendance confirmation sent to ${studentEmail}. MessageId: ${result.MessageId}`,
      );
      return result.MessageId;
    } catch (error) {
      this.logger.error(
        `Failed to send attendance confirmation to ${studentEmail}`,
        error.stack,
      );
      return null;
    }
  }

  async sendLowAttendanceWarning(
    studentEmail: string,
    parentEmail: string,
    percentage: number,
    studentName: string,
  ) {
    const fromEmail = this.configService.get<string>('SES_FROM_EMAIL');
    const recipients = [studentEmail, parentEmail].filter(Boolean);

    if (recipients.length === 0) return null;

    const command = new SendEmailCommand({
      Destination: { ToAddresses: recipients },
      Message: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: `
                            <h2>Low Attendance Warning</h2>
                            <p>Dear ${studentName} and Parent,</p>
                            <p>This is a warning that the current attendance percentage has dropped to <strong>${percentage}%</strong>, which is below the required 75%.</p>
                            <p>Please ensure regular attendance in upcoming classes to recover the percentage.</p>
                            <p>Regards,<br>Auratten Team</p>
                        `,
          },
          Text: {
            Charset: 'UTF-8',
            Data: `Low Attendance Warning: ${studentName}'s attendance is at ${percentage}%. Please attend more classes to recover.`,
          },
        },
        Subject: {
          Charset: 'UTF-8',
          Data: `Low Attendance Warning — ${studentName}`,
        },
      },
      Source: fromEmail,
    });

    try {
      const result = await this.sesClient.send(command);
      this.logger.log(
        `Low attendance warning sent to ${recipients.join(', ')}. MessageId: ${result.MessageId}`,
      );
      return result.MessageId;
    } catch (error) {
      this.logger.error(
        `Failed to send low attendance warning to ${recipients.join(', ')}`,
        error.stack,
      );
      return null;
    }
  }

  async triggerNotificationAfterScan(attendanceRecord: any) {
    try {
      const record = await this.prisma.attendanceRecord.findUnique({
        where: { id: attendanceRecord.id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              institutionId: true,
              sectionId: true,
            },
          },
          qrSession: {
            include: {
              section: { select: { name: true } },
            },
          },
        },
      });

      if (!record || !record.user) return;

      const student = record.user;
      const className = record.qrSession.section?.name || 'General Session';

      // 1. Send Confirmation Email
      await this.sendAttendanceConfirmation(
        student.email,
        className,
        record.markedAt,
      );

      // 2. Check for Low Attendance Warning
      // Logic: Count total sessions for this student's context and their present count
      const sessionWhere: any = {
        institutionId: student.institutionId,
        isActive: false,
      };
      if (student.sectionId) {
        sessionWhere.OR = [
          { sectionId: student.sectionId },
          { sectionId: null },
        ];
      }

      const [totalSessions, presentCount] = await Promise.all([
        this.prisma.qRSession.count({ where: sessionWhere }),
        this.prisma.attendanceRecord.count({
          where: { userId: student.id, status: 'PRESENT' },
        }),
      ]);

      const percentage =
        totalSessions > 0 ? (presentCount / totalSessions) * 100 : 0;

      if (percentage < 75) {
        // Use parentEmail if available, otherwise fallback to student email
        const parentEmail = (student as any).parentEmail || null; // Placeholder

        await this.sendLowAttendanceWarning(
          student.email,
          parentEmail,
          Math.round(percentage),
          student.name,
        );
      }
    } catch (error) {
      this.logger.error('Error in triggerNotificationAfterScan', error.stack);
    }
  }

  async triggerManualParentAlert(studentId: string) {
    try {
      const student = await (this.prisma.user as any).findUnique({
        where: { id: studentId },
        select: {
          id: true,
          name: true,
          email: true,
          institutionId: true,
          sectionId: true,
          parentEmail: true,
        },
      });

      if (!student) throw new Error('Student not found');

      // 1. Calculate current attendance percentage
      const sessionWhere: any = {
        institutionId: student.institutionId,
        records: { some: {} }, // Only sessions with records
      };
      if (student.sectionId) {
        sessionWhere.OR = [
          { sectionId: student.sectionId },
          { sectionId: null },
        ];
      }

      const [totalSessions, presentCount] = await Promise.all([
        this.prisma.qRSession.count({ where: sessionWhere }),
        this.prisma.attendanceRecord.count({
          where: { userId: student.id, status: 'PRESENT' },
        }),
      ]);

      const percentage =
        totalSessions > 0 ? (presentCount / totalSessions) * 100 : 0;
      const parentEmail = student.parentEmail || student.email; // Fallback to student email if no parent specified

      await this.sendLowAttendanceWarning(
        student.email,
        parentEmail,
        Math.round(percentage),
        student.name,
      );
      return { success: true, message: 'Notification sent successfully' };
    } catch (error) {
      this.logger.error(
        `Manual alert failed for student ${studentId}: ${error.message}`,
      );
      throw error;
    }
  }

  async sendEmailOtp(email: string, otp: string) {
    const fromEmail = this.configService.get<string>('SES_FROM_EMAIL');
    const command = new SendEmailCommand({
      Destination: { ToAddresses: [email] },
      Message: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: `
                            <div style="font-family: sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
                                <h2 style="color: #6366f1; margin-bottom: 24px;">Verify your Email</h2>
                                <p style="color: #4b5563; font-size: 16px; line-height: 24px;">Your verification code for Auratten is:</p>
                                <div style="background: #f8fafc; padding: 16px; border-radius: 8px; text-align: center; margin: 24px 0;">
                                    <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1e1b4b;">${otp}</span>
                                </div>
                                <p style="color: #9ca3af; font-size: 14px;">This code will expire in 10 minutes. If you did not request this code, please ignore this email.</p>
                                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
                                <p style="color: #9ca3af; font-size: 12px; text-align: center;">Auratten — The Modern Attendance Platform</p>
                            </div>
                        `,
          },
        },
        Subject: { Charset: 'UTF-8', Data: `${otp} is your verification code` },
      },
      Source: fromEmail,
    });

    try {
      await this.sesClient.send(command);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email OTP to ${email}`, error.stack);
      return false;
    }
  }

  async sendSMSOtp(mobileNumber: string, otp: string) {
    const command = new PublishCommand({
      PhoneNumber: mobileNumber,
      Message: `Your Auratten verification code is: ${otp}. Valid for 10 minutes.`,
      MessageAttributes: {
        'AWS.SNS.SMS.SMSType': {
          DataType: 'String',
          StringValue: 'Transactional',
        },
      },
    });

    try {
      await this.snsClient.send(command);
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send SMS OTP to ${mobileNumber}`,
        error.stack,
      );
      return false;
    }
  }
}
