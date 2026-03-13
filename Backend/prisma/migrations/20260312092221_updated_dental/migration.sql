-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'SCHOOL_ADMIN',
    "schoolId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "User_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "School" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "registrationNo" TEXT NOT NULL,
    "schoolName" TEXT NOT NULL,
    "udiseCode" TEXT,
    "schoolType" TEXT NOT NULL,
    "boardAffiliation" TEXT NOT NULL,
    "principalName" TEXT NOT NULL,
    "principalContact" TEXT NOT NULL,
    "schoolEmail" TEXT NOT NULL,
    "studentStrength" INTEGER NOT NULL,
    "address" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "pincode" TEXT NOT NULL,
    "pocName" TEXT,
    "pocDesignation" TEXT,
    "pocMobile" TEXT,
    "pocEmail" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Child" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "registrationNo" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "class" INTEGER NOT NULL,
    "section" TEXT NOT NULL,
    "fatherNumber" TEXT NOT NULL,
    "motherNumber" TEXT NOT NULL,
    "emailId" TEXT,
    "mobile" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "notes" TEXT,
    "schoolId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Child_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HealthRecord" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "academicYear" TEXT NOT NULL,
    "checkupDate" DATETIME,
    "height" REAL,
    "weight" REAL,
    "bmi" REAL,
    "bmiPercentile" REAL,
    "bmiCategory" TEXT,
    "dentalCariesIndex" REAL,
    "dentalHygieneScore" TEXT,
    "dentalOverallHealth" TEXT,
    "dentalReferralNeeded" BOOLEAN DEFAULT false,
    "dentalReferralReason" TEXT,
    "dentalNotes" TEXT,
    "eyeCheckup" TEXT,
    "eyeVisionLeft" TEXT,
    "eyeVisionRight" TEXT,
    "visionOverall" TEXT,
    "visionReferralNeeded" BOOLEAN DEFAULT false,
    "visionNotes" TEXT,
    "immunization" BOOLEAN NOT NULL DEFAULT false,
    "mentalWellness" BOOLEAN NOT NULL DEFAULT false,
    "nutrition" BOOLEAN NOT NULL DEFAULT false,
    "menstrualHygiene" BOOLEAN NOT NULL DEFAULT false,
    "reportFile" TEXT,
    "childId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "HealthRecord_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_schoolId_key" ON "User"("schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "School_registrationNo_key" ON "School"("registrationNo");

-- CreateIndex
CREATE UNIQUE INDEX "School_schoolEmail_key" ON "School"("schoolEmail");

-- CreateIndex
CREATE UNIQUE INDEX "Child_registrationNo_key" ON "Child"("registrationNo");
