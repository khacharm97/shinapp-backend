import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL || 'postgresql://root:password@localhost:5432/shinapp?schema=public';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

const defaultSkills = [
  { key: 'shinarar', nameEn: 'Builder', nameAm: 'Շինարար', nameRu: 'Строитель', approved: true },
  { key: 'nerkarar', nameEn: 'Painter', nameAm: 'Ներկարար', nameRu: 'Маляр', approved: true },
  { key: 'plumber', nameEn: 'Plumber', nameAm: 'Սանտեխնիկ', nameRu: 'Сантехник', approved: true },
  { key: 'electrician', nameEn: 'Electrician', nameAm: 'Էլեկտրիկ', nameRu: 'Электрик', approved: true },
];

async function main() {
  console.log('Seeding skills...');
  for (const skill of defaultSkills) {
    await prisma.skill.upsert({
      where: { key: skill.key },
      update: skill,
      create: skill,
    });
  }
  console.log('Skills seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
