require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcrypt');

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🚀 Seeding KL University data (with PG Adapter)...');

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
    try {
        await prisma.section.deleteMany({ where: { institutionId: klu.id } });
        console.log('🧹 Cleaned up existing sections.');
    } catch (e) {
        console.log('First run or no sections to clean.');
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

            await prisma.user.upsert({
                where: { email },
                update: {
                    sectionId: section.id,
                    institutionId: klu.id,
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
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
