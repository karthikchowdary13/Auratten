import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInstitutionDto } from './dto/create-institution.dto';
import { UpdateInstitutionDto } from './dto/update-institution.dto';

@Injectable()
export class InstitutionsService {
  constructor(private readonly prisma: PrismaService) {}

  async createInstitution(dto: CreateInstitutionDto) {
    const existing = await this.prisma.institution.findUnique({
      where: { code: dto.code.toUpperCase() },
    });

    if (existing) {
      throw new ConflictException(
        `Institution with code ${dto.code} already exists`,
      );
    }

    return this.prisma.institution.create({
      data: {
        name: dto.name,
        code: dto.code.toUpperCase(),
        address: dto.address,
      },
    });
  }

  async findAll() {
    return this.prisma.institution.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const institution = await this.prisma.institution.findUnique({
      where: { id },
    });

    if (!institution) {
      throw new NotFoundException(`Institution with id ${id} not found`);
    }

    return institution;
  }

  async findByCode(code: string) {
    const institution = await this.prisma.institution.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!institution) {
      throw new NotFoundException(`Institution with code ${code} not found`);
    }

    return institution;
  }

  async updateInstitution(id: string, dto: UpdateInstitutionDto) {
    await this.findById(id);

    return this.prisma.institution.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.code && { code: dto.code.toUpperCase() }),
      },
    });
  }

  async deactivateInstitution(id: string) {
    await this.findById(id);

    return this.prisma.institution.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
