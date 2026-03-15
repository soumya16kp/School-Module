/**
 * Re-link previously unlinked staff/teachers to school 1.
 * Run after removing the unique constraint on User.schoolId.
 *
 * Usage: npx ts-node prisma/relink-school-users.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const EMAILS_TO_RELINK = [
  "sarah.teacher@school.com",
  "michael.teacher@school.com",
  "anita.staff@school.com",
  "robert.teacher@school.com",
  "priya.teacher@school.com",
  "david.staff@school.com",
  "vikram.teacher@school.com",
];

async function main() {
  const schoolId = 1;

  const result = await prisma.user.updateMany({
    where: { email: { in: EMAILS_TO_RELINK } },
    data: { schoolId },
  });

  console.log(`Linked ${result.count} user(s) to school ${schoolId}:`);
  EMAILS_TO_RELINK.forEach((e) => console.log("  -", e));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
