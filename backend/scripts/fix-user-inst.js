require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🚀 Fixing user-institution mapping...');

    // 1. Find the official KLU institution (one with sections)
    const officialKlu = await prisma.institution.findUnique({ where: { code: 'KLU' } });
    if (!officialKlu) {
        throw new Error('Official KLU institution with code "KLU" not found!');
    }
    console.log('Found official KLU:', officialKlu.id);

    // 2. Find the teacher karthikmb77@gmail.com
    const teacherEmail = 'karthikmb77@gmail.com';
    const teacher = await prisma.user.findUnique({ where: { email: teacherEmail } });

    if (teacher) {
        console.log(`Current teacher inst: ${teacher.institutionId}`);

        // 3. Update the teacher to KLU
        const updatedTeacher = await prisma.user.update({
            where: { email: teacherEmail },
            data: { institutionId: officialKlu.id }
        });
        console.log(`✅ Success: ${teacherEmail} is now mapped to ${officialKlu.name} (${officialKlu.id})`);
    } else {
        console.log(`❌ Teacher ${teacherEmail} not found!`);
    }

    await prisma.$disconnect();
    await pool.end();
}

main().catch(console.error);
