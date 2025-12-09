import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

// initialize Prisma Client
const prisma = new PrismaClient();

async function main() {
  const candidat = await prisma.candidat.upsert({
    where: { email: 'kantin.fagn@gmail.com' },
    update: {},
    create: {
      email: 'kantin.fagn@gmail.com',
      firstname: 'Kantin',
      lastname: 'Fagniart',
      dateBirth: new Date('1990-01-01'),
    },
  });

  console.log(candidat);
}

// execute the main function
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // close Prisma Client at the end
    await prisma.$disconnect();
  });
