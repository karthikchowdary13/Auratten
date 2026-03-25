import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as path from 'path';

// Explicitly load .env from the parent directory if needed
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Seeding KL University data...');
    console.log('Database URL:', process.env.DATABASE_URL ? 'FOUND' : 'MISSING');

    // 1. Create/Find KL University
    const klu = await prisma.institution.upsert({
        where: { code: 'KLU' },
        update: {},
        create: {
            name: 'KL University',
            code: 'KLU',
            address: 'Vaddeswaram, Andhra Pradesh',
        },
    });

    // 2. Create Sections
    // Clean up existing sections for this institution to avoid duplicates in this run
    try {
        await prisma.section.deleteMany({ where: { institutionId: klu.id } });
    } catch (e) {
        console.log('No existing sections to delete or first run.');
    }

    const section1 = await prisma.section.create({
        data: {
            name: 'Section 1',
            institutionId: klu.id,
        },
    });

    const section2 = await prisma.section.create({
        data: {
            name: 'Section 2',
            institutionId: klu.id,
        },
    });

    const sections = [section1, section2];
    const password = await bcrypt.hash('Password123', 12);

    // 3. Create 40 Students per Section
    for (let s = 0; s < sections.length; s++) {
        const section = sections[s];
        const sectionNum = s + 1;
        console.log(`📦 Creating 40 students for ${section.name}...`);

        for (let i = 1; i <= 40; i++) {
            const studentNum = i.toString().padStart(2, '0');
            const email = `student.s${sectionNum}.${studentNum}@klu.edu`;
            const rollNumber = `${26 - sectionNum}${studentNum}`; // Example: 2501, 2401

            await (prisma.user as any).upsert({
                where: { email },
                update: {
                    sectionId: section.id,
                    institutionId: klu.id,
                    rollNumber,
                },
                create: {
                    email,
                    password,
                    name: `Student ${sectionNum}-${studentNum}`,
                    role: 'STUDENT',
                    institutionId: klu.id,
                    sectionId: section.id,
                },
            });
        }
    }

    console.log('✅ Seeding complete! Created KL University with 2 sections and 80 students.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
