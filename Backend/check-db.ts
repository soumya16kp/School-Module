import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const children = await prisma.child.findMany({
    take: 5,
    include: {
      healthRecords: true,
      school: true
    }
  });
  console.log(JSON.stringify(children, null, 2));
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
