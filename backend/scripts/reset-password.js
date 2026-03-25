const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function main() {
  const connectionString = process.env.DATABASE_URL;
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const hashedPassword = await bcrypt.hash('password123', 12);
    const user = await prisma.user.update({
      where: { email: 'karthikmb77@gmail.com' },
      data: { password: hashedPassword }
    });
    console.log('Password reset successfully for:', user.email);
    process.exit(0);
  } catch (error) {
    console.error('Failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
