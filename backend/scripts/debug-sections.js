require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('--- USER DEBUG ---');

    // 1. All Users
    const users = await prisma.user.findMany({
        include: { institution: true, section: true }
    });

    console.log('\nUsers found:', users.length);
    const nonStudents = users.filter(u => u.role !== 'STUDENT');

    console.log('\nNon-Student Users:');
    nonStudents.forEach(u => {
        console.log(`- ${u.name} (${u.email}) | Role: ${u.role} | Inst: ${u.institution?.name || 'NONE'} (${u.institutionId})`);
    });

    // 2. Institutions
    const institutions = await prisma.institution.findMany();
    console.log('\nAvailable Institutions:');
    institutions.forEach(i => {
        console.log(`- ${i.name} [${i.code}] ID: ${i.id}`);
    });

    await prisma.$disconnect();
    await pool.end();
}

main().catch(console.error);
