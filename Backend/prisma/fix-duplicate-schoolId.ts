/**
 * One-time fix: resolves duplicate schoolId in User table.
 * Run before prisma db push if you get P2002 on schoolId.
 *
 * Keeps one user per school (prefers SCHOOL_ADMIN) and sets schoolId=null for the rest.
 *
 * Usage: npx ts-node prisma/fix-duplicate-schoolId.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Find users with schoolId, grouped by schoolId
  const usersWithSchool = await prisma.user.findMany({
    where: { schoolId: { not: null } },
  });

  const bySchool = new Map<number, typeof usersWithSchool>();
  for (const u of usersWithSchool) {
    if (u.schoolId == null) continue;
    if (!bySchool.has(u.schoolId)) bySchool.set(u.schoolId, []);
    bySchool.get(u.schoolId)!.push(u);
  }

  let updated = 0;
  for (const [schoolId, users] of bySchool) {
    if (users.length <= 1) continue;
    // Prefer SCHOOL_ADMIN; otherwise keep lowest id
    users.sort((a, b) => {
      if (a.role === "SCHOOL_ADMIN" && b.role !== "SCHOOL_ADMIN") return -1;
      if (a.role !== "SCHOOL_ADMIN" && b.role === "SCHOOL_ADMIN") return 1;
      return a.id - b.id;
    });
    // Keep first, null out the rest
    const toNull = users.slice(1);
    for (const u of toNull) {
      await prisma.user.update({
        where: { id: u.id },
        data: { schoolId: null },
      });
      updated++;
      console.log(`Unlinked user ${u.email} (id=${u.id}) from school ${schoolId}`);
    }
  }

  console.log(`Done. Unlinked ${updated} user(s) to fix duplicate schoolId.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
