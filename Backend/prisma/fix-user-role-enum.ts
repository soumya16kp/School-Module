/**
 * One-time fix: migrate UserRole from STAFF to NURSE_COUNSELLOR
 * so prisma db push can alter the enum without failing.
 *
 * Run: npx ts-node prisma/fix-user-role-enum.ts
 * Then: npx prisma db push
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // 1. Add NURSE_COUNSELLOR to enum (so we can set role to it)
  try {
    await prisma.$executeRawUnsafe(
      `ALTER TYPE "UserRole" ADD VALUE 'NURSE_COUNSELLOR'`
    );
    console.log("Added NURSE_COUNSELLOR to UserRole enum.");
  } catch (e: any) {
    if (e?.message?.includes("already exists") || e?.code === "42710") {
      console.log("NURSE_COUNSELLOR already in enum.");
    } else throw e;
  }

  // 2. Update any users with old STAFF role to NURSE_COUNSELLOR
  const result = await prisma.$executeRawUnsafe(
    `UPDATE "User" SET role = 'NURSE_COUNSELLOR' WHERE role = 'STAFF'`
  );
  console.log("Updated", result, "user(s) from STAFF to NURSE_COUNSELLOR.");

  console.log("\nDone. You can now run: npx prisma db push");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
