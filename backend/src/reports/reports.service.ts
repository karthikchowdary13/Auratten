import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AttendanceService } from '../attendance/attendance.service';
const PDFDocument = require('pdfkit');

@Injectable()
export class ReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly attendanceService: AttendanceService,
  ) {}

  async generateStudentReport(
    userId: string,
    startDate?: string,
    endDate?: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, institutionId: true },
    });
    if (!user) throw new NotFoundException('User not found');

    const { records, percentage, totalCount } =
      await this.attendanceService.getStudentAttendance(userId, {
        startDate,
        endDate,
      });

    const presentCount = (records as any[]).filter((r: any) => r.status === 'PRESENT').length;
    const absentCount = (records as any[]).filter((r: any) => r.status === 'ABSENT').length;
    const lateCount = (records as any[]).filter((r: any) => r.status === 'LATE').length;

    return {
      studentName: user.name,
      email: user.email,
      startDate,
      endDate,
      totalClasses: totalCount,
      presentCount,
      absentCount,
      lateCount,
      attendancePercentage: percentage,
      records: records.map((r) => ({
        date: r.markedAt,
        status: r.status,
        session: r.qrSession?.id,
      })),
    };
  }

  async generateInstitutionReport(
    institutionId: string,
    startDate?: string,
    endDate?: string,
    sectionId?: string,
  ) {
    const institution = await this.prisma.institution.findUnique({
      where: { id: institutionId },
    });
    if (!institution) throw new NotFoundException('Institution not found');

    const sectionIdSanitized =
      sectionId === 'undefined' ||
      sectionId === 'null' ||
      sectionId === 'All Sections' ||
      !sectionId
        ? undefined
        : sectionId;

    let sectionName = undefined;
    if (sectionIdSanitized) {
      const section = await this.prisma.section.findUnique({
        where: { id: sectionIdSanitized },
        select: { name: true },
      });
      sectionName = section?.name;
    }

    const studentWhere: any = {
      institutionId,
      role: 'STUDENT',
      isActive: true,
    };
    if (sectionIdSanitized) studentWhere.sectionId = sectionIdSanitized;

    const students = await this.prisma.user.findMany({
      where: studentWhere,
    });

    const reportData = await Promise.all(
      students.map(async (student) => {
        const stats = await this.attendanceService.getStudentAttendance(
          student.id,
          { startDate, endDate, institutionId },
        );
        return {
          id: student.id,
          name: student.name,
          email: student.email,
          present: stats.presentCount,
          absent: stats.absentCount,
          percentage: stats.percentage,
          isAtRisk: stats.percentage < 75,
        };
      }),
    );

    return {
      institutionName: institution.name,
      sectionName,
      startDate,
      endDate,
      students: reportData,
    };
  }

  async generatePDF(
    reportData: any,
    type: 'STUDENT' | 'INSTITUTION',
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new (PDFDocument.default || PDFDocument)({
          margin: 50,
        });
        const chunks: Buffer[] = [];

        doc.on('data', (chunk: Buffer) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', (err: any) => reject(err));

        // Header
        doc
          .fontSize(25)
          .text('Auratten Attendance Report', { align: 'center' });
        doc.moveDown();

        if (type === 'STUDENT') {
          doc.fontSize(16).text(`Student: ${reportData.studentName}`);
          doc.fontSize(12).text(`Email: ${reportData.email}`);
        } else {
          doc.fontSize(16).text(`Institution: ${reportData.institutionName}`);
          if (reportData.sectionName) {
            doc.fontSize(14).text(`Section: ${reportData.sectionName}`);
          }
        }

        doc
          .fontSize(12)
          .text(
            `Period: ${reportData.startDate || 'Beginning'} to ${reportData.endDate || 'Present'}`,
          );
        doc.moveDown();

        if (type === 'STUDENT') {
          doc.fontSize(14).text('Summary', { underline: true });
          doc.fontSize(12).text(`Total Classes: ${reportData.totalClasses}`);
          doc.text(`Present: ${reportData.presentCount}`);
          doc.text(`Absent: ${reportData.absentCount}`);
          doc.text(`Attendance Rate: ${reportData.attendancePercentage}%`);
          doc.moveDown();

          doc.fontSize(14).text('Detailed Records', { underline: true });
          reportData.records.forEach((r: any) => {
            doc
              .fontSize(10)
              .text(`${new Date(r.date).toLocaleDateString()} - ${r.status}`);
          });
        } else {
          doc.fontSize(14).text('Student Overview', { underline: true });
          doc.moveDown();

          // Internal helper for repeating headers on new pages
          const drawHeader = (y: number) => {
            doc.fontSize(10).font('Helvetica-Bold');
            doc.text('S.No', 50, y, { continued: true });
            doc.text('Name', 100, y, { continued: true });
            doc.text('Present', 250, y, { continued: true });
            doc.text('Absent', 350, y, { continued: true });
            doc.text('Rate (%)', 450, y);
            doc
              .moveTo(50, y + 12)
              .lineTo(550, y + 12)
              .stroke();
            doc.font('Helvetica');
            return y + 20;
          };

          let currentY = drawHeader(doc.y);

          reportData.students.forEach((s: any, index: number) => {
            if (currentY > 700) {
              doc.addPage();
              currentY = drawHeader(50);
            }

            doc.text(s.name, 50, currentY, { continued: true });
            doc.text(s.present.toString(), 250, currentY, { continued: true });
            doc.text(s.absent.toString(), 350, currentY, { continued: true });
            doc.text(
              `${s.percentage}% ${s.isAtRisk ? '(At Risk)' : ''}`,
              450,
              currentY,
            );

            currentY += 20;
          });
        }

        doc.end();
      } catch (err: any) {
        reject(err);
      }
    });
  }
}
