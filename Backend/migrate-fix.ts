import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  // Add missing enum values to AmbassadorType in Postgres
  // Postgres allows ALTER TYPE ... ADD VALUE safely (idempotent with IF NOT EXISTS)
  const values = ['FIRE_DEPT', 'POLICE', 'NDRF', 'CPR_TRAINER', 'FIRST_AID_TRAINER', 'HEALTH_PARTNER', 'OTHER', 'NURSE', 'GYNECOLOGIST', 'PEDIATRICIAN'];
  for (const v of values) {
    await prisma.$executeRawUnsafe(`ALTER TYPE "AmbassadorType" ADD VALUE IF NOT EXISTS '${v}';`);
    console.log(`Ensured: ${v}`);
  }
  console.log('All enum values synced!');
}
main().catch(console.error).finally(() => prisma.$disconnect());
