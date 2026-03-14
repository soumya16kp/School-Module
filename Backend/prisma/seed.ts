/**
 * Demo seed – populates database with sample data for stakeholder demos.
 * Run: npx prisma db seed
 * Or after reset: npx prisma migrate reset
 *
 * Demo accounts (password for all: Demo@1234):
 *   admin@demo-school.com  – School Admin
 *   partner@demo.com       – Partner
 *   district@demo.com      – District Viewer
 * Parent OTP: use phone +919876500000 (linked to Arjun Sharma)
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const DEMO_PASSWORD = "Demo@1234";
const PARENT_PHONE = "7984060375";
const ACADEMIC_YEAR = "2024-2025";

async function main() {
  const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);

  console.log("=== Seeding demo data ===\n");

  // --- 1. School ---
  const school = await prisma.school.upsert({
    where: { registrationNo: "SCH-WB-2024-DEMO01" },
    update: {},
    create: {
      registrationNo: "SCH-WB-2024-DEMO01",
      schoolName: "Sunrise International School",
      udiseCode: "07220300101",
      schoolType: "Private",
      boardAffiliation: "CBSE",
      principalName: "Dr. Suresh Nair",
      principalContact: "+91 98100 00000",
      schoolEmail: "admin@sunrise.edu.in",
      studentStrength: 1200,
      address: "Sector 10, Dwarka",
      state: "Delhi",
      city: "New Delhi",
      pincode: "110075",
      pocName: "Ms. Anjali Singh",
      pocDesignation: "Vice Principal",
      pocMobile: "+91 98100 00001",
      pocEmail: "anjali@sunrise.edu.in",
      academicYear: ACADEMIC_YEAR,
      channel: "Direct",
    },
  });
  console.log("School:", school.schoolName);

  // --- 2. Users ---
  // Free schoolId if another user has it (unique constraint: one user per school)
  await prisma.user.updateMany({
    where: { schoolId: school.id, email: { not: "admin@demo-school.com" } },
    data: { schoolId: null },
  });

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@demo-school.com" },
    update: { schoolId: school.id, password: hashedPassword, name: "Priya Sharma", role: "SCHOOL_ADMIN" },
    create: {
      email: "admin@demo-school.com",
      password: hashedPassword,
      name: "Priya Sharma",
      schoolId: school.id,
      role: "SCHOOL_ADMIN",
    },
  });
  console.log("Admin:", adminUser.email);

  const partnerUser = await prisma.user.upsert({
    where: { email: "partner@demo.com" },
    update: {},
    create: {
      email: "partner@demo.com",
      password: hashedPassword,
      name: "CSR Partner",
      role: "PARTNER",
    },
  });
  console.log("Partner:", partnerUser.email);

  const districtUser = await prisma.user.upsert({
    where: { email: "district@demo.com" },
    update: {},
    create: {
      email: "district@demo.com",
      password: hashedPassword,
      name: "District Officer",
      role: "DISTRICT_VIEWER",
    },
  });
  console.log("District:", districtUser.email);

  // --- 3. Children (varied classes, one for parent demo) ---
  const childData = [
    {
      registrationNo: "SUN-2024-00001",
      name: "Arjun Sharma",
      class: 7,
      section: "B",
      fatherNumber: PARENT_PHONE,
      motherNumber: "+919876500001",
      gender: "Male",
      bloodGroup: "B+",
      allergicTo: "None",
    },
    {
      registrationNo: "SUN-2024-00002",
      name: "Kavya Reddy",
      class: 6,
      section: "A",
      fatherNumber: "+919876500002",
      motherNumber: "+919876500003",
      gender: "Female",
      bloodGroup: "O+",
      allergicTo: "Dust",
    },
    {
      registrationNo: "SUN-2024-00003",
      name: "Rohan Mehta",
      class: 8,
      section: "C",
      fatherNumber: "+919876500004",
      motherNumber: "+919876500005",
      gender: "Male",
      bloodGroup: "A+",
      allergicTo: "Peanuts",
    },
    {
      registrationNo: "SUN-2024-00004",
      name: "Aisha Khan",
      class: 5,
      section: "A",
      fatherNumber: "+919876500006",
      motherNumber: "+919876500007",
      gender: "Female",
      bloodGroup: "AB+",
      allergicTo: null,
    },
    {
      registrationNo: "SUN-2024-00005",
      name: "Vikram Singh",
      class: 7,
      section: "B",
      fatherNumber: "+919876500008",
      motherNumber: "+919876500009",
      gender: "Male",
      bloodGroup: "B-",
      allergicTo: "Shellfish",
    },
  ];

  const children: { id: number; registrationNo: string; name: string }[] = [];
  for (const c of childData) {
    const child = await prisma.child.upsert({
      where: { registrationNo: c.registrationNo },
      update: { fatherNumber: c.fatherNumber, motherNumber: c.motherNumber },
      create: {
        ...c,
        emailId: `${c.name.toLowerCase().replace(/\s/g, ".")}@email.com`,
        mobile: c.fatherNumber,
        schoolId: school.id,
      },
    });
    children.push(child);
  }
  console.log("Children:", children.length);

  // --- 4. Health records (all fields populated for export & dashboard) ---
  const healthRecords = [
    {
      childId: children[0].id,
      academicYear: ACADEMIC_YEAR,
      height: 142,
      weight: 38,
      bmi: 18.8,
      bmiCategory: "Normal",
      bmiPercentile: 52,
      dentalOverallHealth: "Good",
      dentalCariesIndex: 1.2,
      dentalHygieneScore: "3",
      dentalNotes: "Minor plaque, recommend regular brushing",
      dentalReferralNeeded: true,
      dentalReferralReason: "Caries index above threshold",
      eyeCheckup: "Done",
      eyeVisionLeft: "6/6",
      eyeVisionRight: "6/9",
      visionOverall: "Mild myopia left",
      visionNotes: "Recommend follow-up in 6 months",
      visionReferralNeeded: true,
      immunization: true,
      mentalWellness: true,
      nutrition: true,
      menstrualHygiene: false,
      checkupDate: new Date("2025-02-10"),
    },
    {
      childId: children[1].id,
      academicYear: ACADEMIC_YEAR,
      height: 128,
      weight: 28,
      bmi: 17.1,
      bmiCategory: "Normal",
      bmiPercentile: 45,
      dentalOverallHealth: "Excellent",
      dentalCariesIndex: 0,
      dentalHygieneScore: "1",
      dentalReferralNeeded: false,
      eyeCheckup: "Done",
      eyeVisionLeft: "6/6",
      eyeVisionRight: "6/6",
      visionOverall: "Normal",
      visionReferralNeeded: false,
      immunization: true,
      mentalWellness: true,
      nutrition: true,
      menstrualHygiene: false,
      checkupDate: new Date("2025-01-15"),
    },
    {
      childId: children[2].id,
      academicYear: ACADEMIC_YEAR,
      height: 152,
      weight: 68,
      bmi: 29.4,
      bmiCategory: "At Risk",
      bmiPercentile: 92,
      dentalOverallHealth: "Fair",
      dentalCariesIndex: 2.1,
      dentalHygieneScore: "4",
      dentalReferralNeeded: true,
      dentalReferralReason: "Multiple caries",
      eyeCheckup: "Done",
      eyeVisionLeft: "6/12",
      eyeVisionRight: "6/12",
      visionOverall: "Myopia both eyes",
      visionReferralNeeded: true,
      immunization: true,
      mentalWellness: true,
      nutrition: true,
      menstrualHygiene: false,
      checkupDate: new Date("2025-02-05"),
    },
    {
      childId: children[3].id,
      academicYear: ACADEMIC_YEAR,
      height: 112,
      weight: 20,
      bmi: 15.9,
      bmiCategory: "Underweight",
      bmiPercentile: 12,
      dentalOverallHealth: "Good",
      dentalCariesIndex: 0.5,
      dentalHygieneScore: "2",
      dentalReferralNeeded: false,
      eyeCheckup: "Done",
      eyeVisionLeft: "6/6",
      eyeVisionRight: "6/6",
      visionOverall: "Normal",
      visionReferralNeeded: false,
      immunization: true,
      mentalWellness: true,
      nutrition: true,
      menstrualHygiene: true,
      checkupDate: new Date("2025-01-20"),
    },
    {
      childId: children[4].id,
      academicYear: ACADEMIC_YEAR,
      height: 145,
      weight: 42,
      bmi: 20.0,
      bmiCategory: "Normal",
      bmiPercentile: 55,
      dentalOverallHealth: "Good",
      dentalCariesIndex: 0.8,
      dentalHygieneScore: "2",
      dentalReferralNeeded: false,
      eyeCheckup: "Done",
      eyeVisionLeft: "6/6",
      eyeVisionRight: "6/9",
      visionOverall: "Mild myopia right",
      visionReferralNeeded: false,
      immunization: true,
      mentalWellness: true,
      nutrition: true,
      menstrualHygiene: false,
      checkupDate: new Date("2025-02-12"),
    },
  ];

  await prisma.healthRecord.deleteMany({
    where: {
      childId: { in: children.map((c) => c.id) },
      academicYear: ACADEMIC_YEAR,
    },
  });
  for (const hr of healthRecords) {
    await prisma.healthRecord.create({ data: hr as any });
  }
  console.log("Health records:", healthRecords.length);

  // --- 5. Ensure card tokens for ID card demo ---
  for (const child of children) {
    const existing = await prisma.child.findUnique({
      where: { id: child.id },
      select: { cardToken: true },
    });
    if (!existing?.cardToken) {
      const token =
        "card-" +
        child.id +
        "-" +
        Buffer.from(child.registrationNo + Date.now()).toString("base64url").slice(0, 24);
      await prisma.child.update({
        where: { id: child.id },
        data: { cardToken: token },
      });
    }
  }
  console.log("Card tokens ensured");

  // --- 6. Events ---
  const existingEvents = await prisma.event.count({ where: { schoolId: school.id } });
  if (existingEvents === 0) {
    const eventData = [
      {
        schoolId: school.id,
        type: "VISION_SCREENING" as const,
        title: "Annual Vision Screening",
        academicYear: ACADEMIC_YEAR,
        scheduledAt: new Date("2025-02-15"),
        completedAt: new Date("2025-02-15"),
        description: "Class 6-8 vision screening camp",
        attendanceJson: { totalPresent: 280, totalExpected: 300 },
      },
      {
        schoolId: school.id,
        type: "FIRE_DRILL" as const,
        title: "Fire Safety Drill",
        academicYear: ACADEMIC_YEAR,
        scheduledAt: new Date("2024-11-10"),
        completedAt: new Date("2024-11-10"),
        description: "Annual fire evacuation drill",
        attendanceJson: { totalPresent: 1128, totalExpected: 1200 },
      },
      {
        schoolId: school.id,
        type: "DENTAL_SCREENING" as const,
        title: "Dental Screening Camp",
        academicYear: ACADEMIC_YEAR,
        scheduledAt: new Date("2025-03-01"),
        description: "Dental check for classes 5-8",
      },
    ];
    for (const ev of eventData) {
      await prisma.event.create({ data: ev });
    }
  }
  console.log("Events created");

  // --- 7. Ambassadors ---
  const ambassadorData = [
    { name: "Capt. Rajesh Kumar", org: "City Fire Services", type: "FIRE_DEPT" as const },
    { name: "Insp. Meera Singh", org: "District Police", type: "POLICE" as const },
    { name: "Dr. Sameer Ahmed", org: "HeartSave Foundation", type: "CPR_TRAINER" as const },
  ];
  const existingAmb = await prisma.ambassadorDirectory.count({
    where: { schoolId: school.id },
  });
  if (existingAmb === 0) {
    for (const a of ambassadorData) {
      await prisma.ambassadorDirectory.create({
        data: {
          schoolId: school.id,
          type: a.type,
          name: a.name,
          organization: a.org,
          phone: "9876543210",
          serviceArea: "Delhi NCR",
          active: true,
        },
      });
    }
  }
  console.log("Ambassadors created");

  // --- 8. Certifications ---
  const certCount = await prisma.certification.count({ where: { schoolId: school.id } });
  if (certCount === 0) {
    await prisma.certification.createMany({
      data: [
        {
          schoolId: school.id,
          type: "UDISE_COMPLIANCE",
          status: "ACTIVE",
          academicYear: ACADEMIC_YEAR,
          issuedAt: new Date("2024-04-01"),
          validUntil: new Date("2025-03-31"),
        },
        {
          schoolId: school.id,
          type: "FIRE_SAFETY_DRILL",
          status: "ACTIVE",
          academicYear: ACADEMIC_YEAR,
          issuedAt: new Date("2024-11-10"),
          validUntil: new Date("2025-11-09"),
        },
        {
          schoolId: school.id,
          type: "HEALTH_PROGRAM",
          status: "PENDING",
          academicYear: ACADEMIC_YEAR,
        },
      ],
    });
  }
  console.log("Certifications created");

  // --- 9. Donations (for Partner demo & Institutional Benefactors) ---
  const visionEvent = await prisma.event.findFirst({
    where: { schoolId: school.id, type: "VISION_SCREENING" },
  });
  const donationCount = await prisma.donation.count({ where: { partnerId: partnerUser.id } });
  if (donationCount === 0) {
    await prisma.donation.create({
      data: {
        partnerId: partnerUser.id,
        schoolId: school.id,
        eventId: visionEvent?.id ?? null,
        amount: 15000,
        type: "GENERAL",
        status: "COMPLETED",
        description: "Health checkup support for 30 students",
      },
    });
    await prisma.donation.create({
      data: {
        partnerId: partnerUser.id,
        schoolId: school.id,
        eventId: null,
        amount: 5000,
        type: "GENERAL",
        status: "COMPLETED",
        description: "General wellness program",
      },
    });
  }
  console.log("Donations created");

  // --- 10. Optional: another school for district overview ---
  const school2 = await prisma.school.upsert({
    where: { registrationNo: "SCH-WB-2024-DEMO02" },
    update: {},
    create: {
      registrationNo: "SCH-WB-2024-DEMO02",
      schoolName: "Ryan International, Dwarka",
      udiseCode: "07220300102",
      schoolType: "Private",
      boardAffiliation: "CBSE",
      principalName: "Ms. Rekha Verma",
      principalContact: "+91 98100 00010",
      schoolEmail: "admin@ryan-dwarka.edu.in",
      studentStrength: 980,
      address: "Sector 8, Dwarka",
      state: "Delhi",
      city: "New Delhi",
      pincode: "110078",
      academicYear: ACADEMIC_YEAR,
      channel: "Healthcare Partner",
    },
  });

  const admin2 = await prisma.user.upsert({
    where: { email: "admin2@demo-school.com" },
    update: {},
    create: {
      email: "admin2@demo-school.com",
      password: hashedPassword,
      name: "Admin Ryan",
      schoolId: school2.id,
      role: "SCHOOL_ADMIN",
    },
  });

  const child2 = await prisma.child.upsert({
    where: { registrationNo: "RYAN-2024-00001" },
    update: {},
    create: {
      registrationNo: "RYAN-2024-00001",
      name: "Demo Student",
      class: 6,
      section: "A",
      fatherNumber: "+919999999999",
      motherNumber: "+919999999998",
      gender: "Male",
      bloodGroup: "O+",
      allergicTo: null,
      mobile: "+919999999999",
      schoolId: school2.id,
    },
  });

  const hasChild2Record = await prisma.healthRecord.count({
    where: { childId: child2.id, academicYear: ACADEMIC_YEAR },
  });
  if (hasChild2Record === 0) {
    await prisma.healthRecord.create({
      data: {
        childId: child2.id,
        academicYear: ACADEMIC_YEAR,
        height: 130,
        weight: 30,
        bmi: 17.7,
        bmiCategory: "Normal",
        dentalOverallHealth: "Good",
        dentalReferralNeeded: false,
        eyeVisionLeft: "6/6",
        eyeVisionRight: "6/6",
        visionReferralNeeded: false,
        immunization: true,
        mentalWellness: true,
        nutrition: true,
        menstrualHygiene: false,
        checkupDate: new Date("2025-01-10"),
      },
    });
  }
  console.log("Second school + child for district overview");

  console.log("\n=== Demo seed complete ===");
  console.log("\nDemo accounts (password: Demo@1234):");
  console.log("  admin@demo-school.com  - School Admin");
  console.log("  partner@demo.com       - Partner");
  console.log("  district@demo.com      - District Viewer");
  console.log("\nParent OTP: use phone", PARENT_PHONE, "or +91" + PARENT_PHONE, "(Arjun Sharma)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
