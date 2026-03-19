import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Adding columns to School table...');
  try {
    const cols = [
      'fireDeptName', 'fireDeptContact', 'fireDeptImage',
      'policeName', 'policeContact', 'policeImage',
      'ndrfName', 'ndrfContact', 'ndrfImage',
      'nurseName', 'nurseContact', 'nurseImage',
      'gynecologistName', 'gynecologistContact', 'gynecologistImage',
      'pediatricianName', 'pediatricianContact', 'pediatricianImage'
    ];

    for (const col of cols) {
      console.log(`Adding ${col}...`);
      await prisma.$executeRawUnsafe(`ALTER TABLE "School" ADD COLUMN IF NOT EXISTS "${col}" TEXT;`);
    }
    
    const enums = ['NURSE', 'GYNECOLOGIST', 'PEDIATRICIAN'];
    for (const val of enums) {
      console.log(`Adding enum value ${val}...`);
      try {
        await prisma.$executeRawUnsafe(`ALTER TYPE "AmbassadorType" ADD VALUE '${val}';`);
      } catch (e: any) {
        if (e.message.includes('already exists')) {
          console.log(`${val} already exists.`);
        } else {
          console.warn(`Could not add enum value ${val}:`, e.message);
        }
      }
    }
    
    console.log('Database manual fixes completed.');
  } catch (err) {
    console.error('Error fixing database:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
