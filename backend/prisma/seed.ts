import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL as string,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const informatique = await prisma.filiere.upsert({
    where: { label: 'Informatique' },
    update: {},
    create: { label: 'Informatique' },
  });

  const iaData = await prisma.filiere.upsert({
    where: { label: 'IA & Data' },
    update: {},
    create: { label: 'IA & Data' },
  });

  const cybersecurite = await prisma.filiere.upsert({
    where: { label: 'Cybersécurité' },
    update: {},
    create: { label: 'Cybersécurité' },
  });

  console.log('✅ Filieres:', { informatique, iaData, cybersecurite });

  // Créer les ateliers
  const atelier1 = await prisma.atelier.upsert({
    where: { label: 'Introduction à Docker' },
    update: {},
    create: {
      label: 'Introduction à Docker',
      date: new Date('2024-01-15T10:00:00'),
      dockerfilelink: 'https://github.com/example/docker-intro',
    },
  });

  const atelier2 = await prisma.atelier.upsert({
    where: { label: 'DevOps avancé' },
    update: {},
    create: {
      label: 'DevOps avancé',
      date: new Date('2024-01-20T14:00:00'),
      dockerfilelink: 'https://github.com/example/devops-advanced',
    },
  });

  const atelier3 = await prisma.atelier.upsert({
    where: { label: 'Machine Learning avec Python' },
    update: {},
    create: {
      label: 'Machine Learning avec Python',
      date: new Date('2024-01-25T09:30:00'),
      dockerfilelink: 'https://github.com/example/ml-python',
    },
  });

  const atelier4 = await prisma.atelier.upsert({
    where: { label: 'Sécurité Web OWASP' },
    update: {},
    create: {
      label: 'Sécurité Web OWASP',
      date: new Date('2024-02-01T13:00:00'),
      dockerfilelink: 'https://github.com/example/owasp-security',
    },
  });

  console.log('✅ Ateliers:', { atelier1, atelier2, atelier3, atelier4 });

  const candidat = await prisma.candidat.upsert({
    where: { email: 'kantin.fagn@gmail.com' },
    update: {},
    create: {
      email: 'kantin.fagn@gmail.com',
      firstname: 'Kantin',
      appointment: false,
      consentement: true,
      lastname: 'Fagniart',
      dateBirth: new Date('1990-01-01'),
    },
  });

  console.log('✅ Candidat:', candidat);

  const candidatFiliere = await prisma.candidat_Filiere.upsert({
    where: {
      candidatId_filiereId: {
        candidatId: candidat.uid,
        filiereId: informatique.uid,
      },
    },
    update: {},
    create: {
      candidatId: candidat.uid,
      filiereId: informatique.uid,
    },
  });

  console.log('✅ Candidat-Filière:', candidatFiliere);

  // Lier le candidat aux ateliers
  const atelierCandidat1 = await prisma.atelier_Candidat.upsert({
    where: {
      atelierId_candidatId: {
        atelierId: atelier1.uid,
        candidatId: candidat.uid,
      },
    },
    update: {},
    create: {
      atelierId: atelier1.uid,
      candidatId: candidat.uid,
    },
  });

  const atelierCandidat2 = await prisma.atelier_Candidat.upsert({
    where: {
      atelierId_candidatId: {
        atelierId: atelier2.uid,
        candidatId: candidat.uid,
      },
    },
    update: {},
    create: {
      atelierId: atelier2.uid,
      candidatId: candidat.uid,
    },
  });

  const atelierCandidat3 = await prisma.atelier_Candidat.upsert({
    where: {
      atelierId_candidatId: {
        atelierId: atelier3.uid,
        candidatId: candidat.uid,
      },
    },
    update: {},
    create: {
      atelierId: atelier3.uid,
      candidatId: candidat.uid,
    },
  });

  console.log('✅ Candidat-Ateliers:', {
    atelierCandidat1,
    atelierCandidat2,
    atelierCandidat3,
  });
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
