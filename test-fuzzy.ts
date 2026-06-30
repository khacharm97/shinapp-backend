import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.$queryRaw`CREATE EXTENSION IF NOT EXISTS pg_trgm;`;
  console.log('pg_trgm extension enabled.');

  const search = 'plamber'; // typo for plumber
  
  const results = await prisma.$queryRaw`
    SELECT u.id, u.name, ui.skills
    FROM "User" u
    LEFT JOIN "UserInfo" ui ON u.id = ui."userId"
    WHERE 
      similarity(u.name, ${search}) > 0.3 
      OR similarity(array_to_string(ui.skills, ' '), ${search}) > 0.3
  `;
  
  console.log('Results:', results);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
