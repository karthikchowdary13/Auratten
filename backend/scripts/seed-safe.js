const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Seeding KL University data (JS)...');

    // 1. KLU
    const klu = await prisma.institution.upsert({
        where: { code: 'KLU' },
        update: {},
        create: { name: 'KL University', code: 'KLU' }
    });
    console.log('KLU ID:', klu.id);

    // 2. Sections
    const s1 = await prisma.section.upsert({
        where: { id: 's1-klu' },
        update: { institutionId: klu.id },
        create: { id: 's1-klu', name: 'Section 1', institutionId: klu.id }
    });
    const s2 = await prisma.section.upsert({
        where: { id: 's2-klu' },
        update: { institutionId: klu.id },
        create: { id: 's2-klu', name: 'Section 2', institutionId: klu.id }
    });

    // 3. Students (40 in each)
    for (let sNum of [1, 2]) {
        const section = sNum === 1 ? s1 : s2;
        for (let i = 1; i <= 40; i++) {
            const num = i.toString().padStart(2, '0');
            const email = `student.s${sNum}.${num}@klu.edu`;
            const rollNumber = `${26 - sNum}${num}`;
            await prisma.user.upsert({
                where: { email },
                update: { sectionId: section.id, institutionId: klu.id, rollNumber },
                create: {
                    email,
                    name: `Student ${sNum}-${num}`,
                    password: 'password123',
                    role: 'STUDENT',
                    institutionId: klu.id,
                    sectionId: section.id,
                    rollNumber
                }
            });
        }
    }

    // 4. Update the teacher to match
    await prisma.user.updateMany({
        where: { email: 'karthikchowdary1315@gmail.com' },
        data: { institutionId: klu.id }
    });

    console.log('✅ Seeded 80 students and updated teacher!');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
