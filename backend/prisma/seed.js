import bcrypt from 'bcryptjs';
import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('admin1234', 10);

  await prisma.user.upsert({
    where: { email: 'admin@codcrm.ma' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@codcrm.ma',
      role: UserRole.ADMIN,
      passwordHash,
    },
  });

  const agentHash = await bcrypt.hash('agent1234', 10);
  await prisma.user.upsert({
    where: { email: 'agent@codcrm.ma' },
    update: {},
    create: {
      name: 'Agent One',
      email: 'agent@codcrm.ma',
      role: UserRole.AGENT,
      passwordHash: agentHash,
    },
  });

  console.log('Seed data ready');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
