import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log("Cleaning up old health records...");
  await prisma.healthRecord.deleteMany({});
  console.log("Deleted all health records.");
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
