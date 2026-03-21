require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const record = await prisma.healthRecord.findFirst({
      select: { 
        colorBlindness: true,
        pigeonChest: true,
        enlargedTonsils: true,
        bloodPressure: true
      }
    });
    console.log("Columns verified successfully!");
  } catch (err) {
    console.error("Verification failed:", err.message);
  }
}

check().catch(console.error).finally(() => prisma.$disconnect());
