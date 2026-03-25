import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SectionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(institutionId: string) {
    const sections = await this.prisma.section.findMany({
      where: { institutionId },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    const sectionsWithStats = await Promise.all(
      sections.map(async (section) => {
        const now = new Date();
        const thirtyDaysAgo = new Date(
          now.getTime() - 30 * 24 * 60 * 60 * 1000,
        );

        // Get last 7 sessions for this section
        const lastSessions = await this.prisma.qRSession.findMany({
          where: { sectionId: section.id },
          orderBy: { createdAt: 'desc' },
          take: 7,
          include: {
            _count: {
              select: { attendanceRecords: true },
            },
          },
        });

        // Get 30-day average
        const last30DaysSessions = await this.prisma.qRSession.findMany({
          where: {
            sectionId: section.id,
            createdAt: { gte: thirtyDaysAgo },
          },
          include: {
            _count: {
              select: { attendanceRecords: true },
            },
          },
        });

        const lastSessionAt = lastSessions[0]?.createdAt || null;
        const studentCount = (section as any)._count?.users || 0;
        const safeStudentCount = Math.max(studentCount, 1);

        const avgAttendance30Days =
          last30DaysSessions.length > 0
            ? Math.round(
                (last30DaysSessions.reduce(
                  (acc, s) =>
                    acc +
                    ((s as any)._count?.attendanceRecords || 0) /
                      safeStudentCount,
                  0,
                ) /
                  last30DaysSessions.length) *
                  100,
              )
            : 0;

        const avgAttendanceLast3 =
          lastSessions.length > 0
            ? Math.round(
                (lastSessions
                  .slice(0, 3)
                  .reduce(
                    (acc, s) =>
                      acc +
                      ((s as any)._count?.attendanceRecords || 0) /
                        safeStudentCount,
                    0,
                  ) /
                  Math.min(lastSessions.length, 3)) *
                  100,
              )
            : 0;

        const last7History = lastSessions
          .map((s) =>
            Math.round(
              (((s as any)._count?.attendanceRecords || 0) / safeStudentCount) *
                100,
            ),
          )
          .reverse(); // Oldest first for sparkline

        return {
          ...section,
          lastSessionAt,
          avgAttendance30Days,
          avgAttendanceLast3,
          last7History,
          studentCount, // Explicitly return studentCount for frontend convenience if needed
        };
      }),
    );

    return sectionsWithStats;
  }

  async create(institutionId: string, name: string) {
    return this.prisma.section.create({
      data: {
        name,
        institutionId,
      },
    });
  }

  async assignStudents(sectionId: string, studentIds: string[]) {
    // Disconnect students from their current section first, then connect to new one
    await this.prisma.user.updateMany({
      where: { id: { in: studentIds } },
      data: { sectionId },
    });
    return { success: true };
  }

  async removeStudent(sectionId: string, studentId: string) {
    return this.prisma.user.update({
      where: { id: studentId, sectionId },
      data: { sectionId: null },
    });
  }

  async delete(id: string) {
    // Unassign all users first
    await this.prisma.user.updateMany({
      where: { sectionId: id },
      data: { sectionId: null },
    });

    return this.prisma.section.delete({
      where: { id },
    });
  }

  async autoAssignStudents(institutionId: string) {
    const sections = await this.prisma.section.findMany({
      where: { institutionId },
      orderBy: { name: 'asc' },
    });
    const students = await this.prisma.user.findMany({
      where: { institutionId, role: 'STUDENT' },
    });

    console.log(
      `[AutoAssign] Inst: ${institutionId}, Sections: ${sections.length}, Students: ${students.length}`,
    );

    // 1. RESET ALL STUDENTS IN THIS INSTITUTION FIRST TO ENSURE CLEAN SLATE
    await this.prisma.user.updateMany({
      where: { institutionId, role: 'STUDENT' },
      data: { sectionId: null },
    });

    let assignedCount = 0;
    for (const student of students) {
      const uName = student.name.toLowerCase();

      // ID mapping logic: Extract numeric ID from name
      const studentMatch = uName.match(/(\d+)/);
      const studentDigit = studentMatch ? studentMatch[1] : null;

      const match = sections.find((section) => {
        const sName = section.name.toLowerCase();
        const sMatch = sName.match(/(\d+)/);
        const sectionDigit = sMatch ? sMatch[1] : null;

        // Primary Match: Numeric ID match
        if (studentDigit && sectionDigit && studentDigit === sectionDigit)
          return true;

        // Secondary Match: Substring fallback (e.g. "Section 1")
        const sectionLabel = sName.replace('section', '').trim();
        if (
          sectionLabel &&
          (uName.includes(` ${sectionLabel}`) ||
            uName.includes(`${sectionLabel}-`))
        )
          return true;

        return false;
      });

      if (match) {
        await this.prisma.user.update({
          where: { id: student.id },
          data: { sectionId: match.id },
        });
        assignedCount++;
      }
    }
    return { success: true, count: assignedCount };
  }
}
