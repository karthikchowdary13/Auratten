const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const connectionString = "postgresql://postgres:srikar1315@localhost:5432/auratten_db";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('📝 Assigning Roll Numbers to Students...');

    const students = await prisma.user.findMany({
        where: { role: 'STUDENT' },
        orderBy: { name: 'asc' }
    });

    for (let i = 0; i < students.length; i++) {
        const student = students[i];
        const rollNumber = (25001 + i).toString();

        await prisma.user.update({
            where: { id: student.id },
            data: { rollNumber }
        });

        if (i % 10 === 0) console.log(`Updated ${i}/${students.length} students...`);
    }

    console.log(`✅ Successfully assigned roll numbers to ${students.length} students.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
