/**
 * Add or update a school admin user.
 * Run from Backend: npx ts-node prisma/add-school-admin.ts
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const EMAIL = "guptajeet2506@gmail.com";
const PASSWORD = "Jeet@1947";
const NAME = "Jeet Gupta";

async function main() {
  const hashedPassword = await bcrypt.hash(PASSWORD, 10);

  // Link to first school if it exists (otherwise leave schoolId null)
  const firstSchool = await prisma.school.findFirst({ orderBy: { id: "asc" } });
  const schoolId = firstSchool?.id ?? null;

  const user = await prisma.user.upsert({
    where: { email: EMAIL },
    update: { password: hashedPassword, name: NAME, role: "SCHOOL_ADMIN", schoolId },
    create: {
      email: EMAIL,
      password: hashedPassword,
      name: NAME,
      role: "SCHOOL_ADMIN",
      schoolId,
    },
  });

  console.log("School admin ready:");
  console.log("  Email:", user.email);
  console.log("  Name:", user.name);
  console.log("  Role:", user.role);
  console.log("  School ID:", user.schoolId ?? "(none – register a school after login)");
  console.log("\nYou can log in with this email and password (OTP will be sent to this email).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
