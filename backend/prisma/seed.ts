import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL as string,
});

const prisma = new PrismaClient({ adapter });

const roundsOfHashing = 10;

async function main() {
  // ----------------------------
  // Filieres
  // ----------------------------
  const informatique = await prisma.filiere.upsert({
    where: { label: 'informatique' },
    update: {},
    create: { label: 'informatique' },
  });

  const iaData = await prisma.filiere.upsert({
    where: { label: 'ia-&-data' },
    update: {},
    create: { label: 'ia-&-data' },
  });

  const cybersecurite = await prisma.filiere.upsert({
    where: { label: 'cybersecurite' },
    update: {},
    create: { label: 'cybersecurite' },
  });

  console.log('✅ Filieres:', {
    informatique: informatique.uid,
    iaData: iaData.uid,
    cybersecurite: cybersecurite.uid,
  });

  // ----------------------------
  // Ateliers + scores par filiere (Atelier_Filiere)
  // ----------------------------
  const atelier1 = await prisma.atelier.upsert({
    where: { label: 'Introduction à Docker' },
    update: {
      description: "cool le description de l'atelier 1 :D",
      imageUrl: 'https://example.com/docker-intro.png',
      draft: false,
      dockerfilelink: 'https://github.com/example/docker-intro',
    },
    create: {
      label: 'Introduction à Docker',
      description: "cool le description de l'atelier 1 :D",
      imageUrl: 'https://example.com/docker-intro.png',
      draft: false,
      dockerfilelink: 'https://github.com/example/docker-intro',
    },
  });

  const atelier2 = await prisma.atelier.upsert({
    where: { label: 'DevOps avancé' },
    update: {
      description: "cool le description de l'atelier 2 :D",
      imageUrl: 'https://example.com/devops-advanced.png',
      draft: false,
      dockerfilelink: 'https://github.com/example/devops-advanced',
    },
    create: {
      label: 'DevOps avancé',
      description: "cool le description de l'atelier 2 :D",
      imageUrl: 'https://example.com/devops-advanced.png',
      draft: false,
      dockerfilelink: 'https://github.com/example/devops-advanced',
    },
  });

  const atelier3 = await prisma.atelier.upsert({
    where: { label: 'Machine Learning avec Python' },
    update: {
      description: "cool le description de l'atelier 3 :D",
      imageUrl: 'https://example.com/ml-python.png',
      draft: false,
      dockerfilelink: 'https://github.com/example/ml-python',
    },
    create: {
      label: 'Machine Learning avec Python',
      description: "cool le description de l'atelier 3 :D",
      imageUrl: 'https://example.com/ml-python.png',
      draft: false,
      dockerfilelink: 'https://github.com/example/ml-python',
    },
  });

  const atelier4 = await prisma.atelier.upsert({
    where: { label: 'Sécurité Web OWASP' },
    update: {
      description: "cool le description de l'atelier 4 :D",
      imageUrl: 'https://example.com/owasp-security.png',
      draft: false,
      dockerfilelink: 'https://github.com/example/owasp-security',
    },
    create: {
      label: 'Sécurité Web OWASP',
      description: "cool le description de l'atelier 4 :D",
      imageUrl: 'https://example.com/owasp-security.png',
      draft: false,
      dockerfilelink: 'https://github.com/example/owasp-security',
    },
  });

  console.log('✅ Ateliers:', {
    atelier1: atelier1.uid,
    atelier2: atelier2.uid,
    atelier3: atelier3.uid,
    atelier4: atelier4.uid,
  });

  // Helper: upsert du lien Atelier_Filiere (avec score)
  async function upsertAtelierFiliere(params: {
    atelierId: string;
    filiereId: string;
    score: number;
  }) {
    const { atelierId, filiereId, score } = params;
    return prisma.atelier_Filiere.upsert({
      where: { atelierId_filiereId: { atelierId, filiereId } },
      update: { score },
      create: { atelierId, filiereId, score },
    });
  }

  // Atelier 1 : Docker
  await upsertAtelierFiliere({
    atelierId: atelier1.uid,
    filiereId: informatique.uid,
    score: 8,
  });
  await upsertAtelierFiliere({
    atelierId: atelier1.uid,
    filiereId: iaData.uid,
    score: 3,
  });
  await upsertAtelierFiliere({
    atelierId: atelier1.uid,
    filiereId: cybersecurite.uid,
    score: 4,
  });

  // Atelier 2 : DevOps
  await upsertAtelierFiliere({
    atelierId: atelier2.uid,
    filiereId: informatique.uid,
    score: 6,
  });
  await upsertAtelierFiliere({
    atelierId: atelier2.uid,
    filiereId: iaData.uid,
    score: 2,
  });
  await upsertAtelierFiliere({
    atelierId: atelier2.uid,
    filiereId: cybersecurite.uid,
    score: 5,
  });

  // Atelier 3 : ML Python
  await upsertAtelierFiliere({
    atelierId: atelier3.uid,
    filiereId: informatique.uid,
    score: 4,
  });
  await upsertAtelierFiliere({
    atelierId: atelier3.uid,
    filiereId: iaData.uid,
    score: 10,
  });
  await upsertAtelierFiliere({
    atelierId: atelier3.uid,
    filiereId: cybersecurite.uid,
    score: 1,
  });

  // Atelier 4 : OWASP
  await upsertAtelierFiliere({
    atelierId: atelier4.uid,
    filiereId: informatique.uid,
    score: 3,
  });
  await upsertAtelierFiliere({
    atelierId: atelier4.uid,
    filiereId: iaData.uid,
    score: 1,
  });
  await upsertAtelierFiliere({
    atelierId: atelier4.uid,
    filiereId: cybersecurite.uid,
    score: 10,
  });

  console.log('✅ Atelier_Filiere: scores seeded');

  // ----------------------------
  // Candidat + liaisons (optionnel, comme ton seed)
  // ----------------------------
  const candidat = await prisma.candidat.upsert({
    where: { email: 'kantin.fagn@gmail.com' },
    update: {},
    create: {
      email: 'kantin.fagn@gmail.com',
      firstname: 'Kantin',
      appointment: false,
      consentement: true,
      lastname: 'Fagniart',
      ageRange: '26-35',
    },
  });

  await prisma.candidat_Filiere.upsert({
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
      score: 10,
    },
  });

  await prisma.atelier_Candidat.upsert({
    where: {
      atelierId_candidatId: {
        atelierId: atelier1.uid,
        candidatId: candidat.uid,
      },
    },
    update: {},
    create: { atelierId: atelier1.uid, candidatId: candidat.uid },
  });

  await prisma.atelier_Candidat.upsert({
    where: {
      atelierId_candidatId: {
        atelierId: atelier2.uid,
        candidatId: candidat.uid,
      },
    },
    update: {},
    create: { atelierId: atelier2.uid, candidatId: candidat.uid },
  });

  await prisma.atelier_Candidat.upsert({
    where: {
      atelierId_candidatId: {
        atelierId: atelier3.uid,
        candidatId: candidat.uid,
      },
    },
    update: {},
    create: { atelierId: atelier3.uid, candidatId: candidat.uid },
  });

  const candidat2 = await prisma.candidat.upsert({
    where: { email: 'firas.bouchira@ynov.com' },
    update: {},
    create: {
      email: 'firas.bouchira@ynov.com',
      firstname: 'firas',
      appointment: false,
      consentement: true,
      lastname: 'bouchira',
      ageRange: '26-35',
    },
  });

  await prisma.atelier_Candidat.upsert({
    where: {
      atelierId_candidatId: {
        atelierId: atelier2.uid,
        candidatId: candidat2.uid,
      },
    },
    update: {},
    create: { atelierId: atelier2.uid, candidatId: candidat2.uid },
  });

  console.log('✅ Candidat + liens seeded');

  await prisma.question.upsert({
    where: {
      label:
        "Quelle est la commande pour lister les conteneurs Docker en cours d'exécution ?",
    },
    update: {},
    create: {
      label:
        "Quelle est la commande pour lister les conteneurs Docker en cours d'exécution ?",
      multiple: true,
    },
  });

  await prisma.question.upsert({
    where: {
      label:
        'Quelle commande permet de voir toutes les images Docker locales ?',
    },
    update: {},
    create: {
      label:
        'Quelle commande permet de voir toutes les images Docker locales ?',
      multiple: false,
    },
  });

  await prisma.question.upsert({
    where: {
      label:
        "Quelle commande permet de lancer un conteneur Docker à partir d'une image ?",
    },
    update: {},
    create: {
      label:
        "Quelle commande permet de lancer un conteneur Docker à partir d'une image ?",
      multiple: false,
    },
  });

  await prisma.question.upsert({
    where: {
      label:
        "Quelle commande permet d'arrêter un conteneur Docker en cours d'exécution ?",
    },
    update: {},
    create: {
      label:
        "Quelle commande permet d'arrêter un conteneur Docker en cours d'exécution ?",
      multiple: false,
    },
  });

  await prisma.question.upsert({
    where: {
      label: 'Quelle commande permet de supprimer un conteneur Docker ?',
    },
    update: {},
    create: {
      label: 'Quelle commande permet de supprimer un conteneur Docker ?',
      multiple: false,
    },
  });

  await prisma.question.upsert({
    where: {
      label: 'À quoi sert un Dockerfile ?',
    },
    update: {},
    create: {
      label: 'À quoi sert un Dockerfile ?',
      multiple: true,
    },
  });

  await prisma.question.upsert({
    where: {
      label:
        'Quelle est la différence entre une image Docker et un conteneur Docker ?',
    },
    update: {},
    create: {
      label:
        'Quelle est la différence entre une image Docker et un conteneur Docker ?',
      multiple: true,
    },
  });

  console.log('✅ Questions seeded');

  const password = await bcrypt.hash('securepassword123', roundsOfHashing);

  const admin = await prisma.admin.upsert({
    where: { email: 'kantin.fagniart@ynov.com' },
    update: {
      password: password,
    },
    create: {
      email: 'kantin.fagniart@ynov.com',
      firstname: 'Kantin',
      lastname: 'Fagniart',
      password: password,
      role: 'ADMIN',
    },
  });

  console.log('✅ Questions seeded', admin);

  await prisma.globalStats.create({
    data: {
      candidats: 0,
      appointment: 0,
    },
  });

  console.log('✅ GlobalStats initialisé');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
