import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'mohammedchirah2002@gmail.com';
  const password = 'Vibio@Admin2024';

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      role: 'ADMIN',
      passwordHash,
      name: 'Mohammed Chirah',
      emailVerified: new Date(),
    },
    create: {
      email,
      name: 'Mohammed Chirah',
      passwordHash,
      role: 'ADMIN',
      emailVerified: new Date(),
    },
  });

  console.log('');
  console.log('✓ Admin user ready');
  console.log(`  Email   : ${user.email}`);
  console.log(`  Password: ${password}`);
  console.log(`  Role    : ${user.role}`);
  console.log(`  ID      : ${user.id}`);
  console.log('');
  console.log('Change your password after first login.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
