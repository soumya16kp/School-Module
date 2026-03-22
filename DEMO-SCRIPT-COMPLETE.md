# WombTo18 School Module — Detailed Demo Script

**Purpose:** Complete end-to-end testing of all features from a user perspective. Use for manager presentations, QA testing, or onboarding.

**Last Updated:** March 2025  
**Project:** School-Module (WombTo18 School Edition)

---

## Table of Contents
1. [Prerequisites & Setup](#1-prerequisites--setup)
2. [Mock Data & Test Accounts](#2-mock-data--test-accounts)
3. [PART 1 — Partner Journey](#3-part-1--partner-journey)
4. [PART 2 — School Admin Journey](#4-part-2--school-admin-journey)
5. [PART 3 — WOMBTO18 Ops Journey](#5-part-3--wombto18-ops-journey)
6. [PART 4 — District Viewer Journey](#6-part-4--district-viewer-journey)
7. [PART 5 — Class Teacher Journey](#7-part-5--class-teacher-journey)
8. [PART 6 — Parent Journey](#8-part-6--parent-journey)
9. [PART 7 — Emergency Access](#9-part-7--emergency-access)
10. [PART 8 — Public Features](#10-part-8--public-features)
11. [Troubleshooting](#11-troubleshooting)
12. [Feature Checklist](#12-feature-checklist)

---

## 1. Prerequisites & Setup

### 1.1 Services Must Be Running

| Service | URL | Command | Verification |
|---------|-----|---------|---------------|
| Frontend | `http://localhost:5173` | `cd Frontend && npm run dev` | Page loads; no blank screen |
| Backend | `http://localhost:5000` | `cd Backend && npm run dev` | Console shows "Server running" or similar |
| Database | PostgreSQL | — | Backend connects without error |

**Quick check:** Open `http://localhost:5173` — you should see the login page with "WombTo18" branding, email/password fields, and "Send OTP" button.

### 1.2 Browser Setup

- **Window 1 (normal/regular):** Use for School Admin, Partner, Ops, District Viewer, Class Teacher. Keep one session logged in.
- **Window 2 (incognito/private):** Use for Parent Portal, public pages (ID card, join link), Emergency Access. Simulates a different user/device.

**Why two windows:** Parent login uses a different token (`parent_token`) than school login (`school_token`). Incognito ensures no token conflict.

### 1.3 Environment Variables

Ensure `Backend/.env` has:
- `DATABASE_URL` — PostgreSQL connection string
- `DIRECT_URL` — Direct connection for migrations
- `JWT_SECRET` — For auth tokens
- `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` — For payments (test mode)
- `FRONTEND_URL` — Usually `http://localhost:5173` for dev
- Email/SMS config for OTP (or OTP prints to console in dev)

### 1.4 Database Sync

```bash
cd Backend
npx prisma db push
npx prisma generate
```

**If `prisma generate` fails with EPERM:** Close Prisma Studio and any running backend; the query engine file is locked. Then retry.

---

## 2. Mock Data & Test Accounts

### 2.1 User Accounts Reference

| Person | Role | Email | Password | How to Create |
|--------|------|-------|----------|---------------|
| Dr. Anita Sharma | SCHOOL_ADMIN | sunrise.school.demo@gmail.com | Admin@123 | `/register` → select "School Administrator" |
| Ms. Kavita Desai | CLASS_TEACHER | kavita.teacher.demo@gmail.com | Teacher@123 | Add via Staff tab (Scene 2.5) |
| Ms. Priya Deshpande | NURSE_COUNSELLOR | priya.nurse.demo@gmail.com | Nurse@123 | Add via Staff tab |
| Rahul Bose | PARTNER | rahul.partner@wombto18.com | Partner@123 | `/register` → select "Partner / Sponsor" |
| Riya Kapoor | WOMBTO18_OPS | ops.wombto18.demo@gmail.com | Ops@123 | Manual DB/Prisma Studio (see below) |
| Mr. Ashok Rane | DISTRICT_VIEWER | district.viewer.demo@gmail.com | District@123 | Manual DB/Prisma Studio (see below) |

**Parent (no account):** Suresh Mehta — uses mobile `9312350305` (entered as Arjun's father's number). OTP sent to this number; check backend console.

### 2.2 Creating WOMBTO18_OPS and DISTRICT_VIEWER

These roles cannot self-register. Options:

**Option A — Prisma Studio**
1. Run `npx prisma studio` from `Backend/`
2. Open **User** model → **Add record**
3. Fill: `email`, `password` (bcrypt hash — see below), `name`, `role` = `WOMBTO18_OPS` or `DISTRICT_VIEWER`
4. Save

**Option B — Adapt add-school-admin.ts**

Copy `Backend/prisma/add-school-admin.ts`, change:
```ts
const EMAIL = "ops.wombto18.demo@gmail.com";
const PASSWORD = "Ops@123";
const NAME = "Riya Kapoor";
// In upsert: role: "WOMBTO18_OPS"
```

Run: `npx ts-node prisma/add-school-admin.ts`

**Password hashing:** Use bcrypt. In Node: `require('bcrypt').hashSync('Ops@123', 10)`.

### 2.3 Razorpay Test Card

| Field | Value |
|-------|-------|
| Card Number | 4111 1111 1111 1111 |
| Expiry | 12/26 |
| CVV | 123 |
| Name | Test User |

### 2.4 OTP in Development

OTP is printed in the **backend terminal**:

- **School/Staff login:** `[EMAIL OTP] To sunrise.school.demo@gmail.com: Your code is 482910`
- **Parent login:** `[SMS] To 9312350305: Your WombTo18 verification code is 482910`

Copy the 6-digit code and paste into the OTP field. OTP typically expires in 10 minutes.

---

## 3. PART 1 — Partner Journey

**Who you are:** Rahul Bose, a channel partner who onboard schools and track commissions.

---

### 1.1 — Partner Registers (if new)

1. Go to `http://localhost:5173/register`
2. **Full Name:** type `Rahul Bose`
3. **Email Address:** type `rahul.partner@wombto18.com`
4. **Password:** type `Admin@123` (or any strong password; use `Partner@123` for consistency)
5. **Registration Role:** select **Partner / Sponsor** from the dropdown
6. Click **Create Account**

**What you should see:** Alert "Account created! Please login." — redirected to `/` (login page).

**If "email already registered":** User exists; proceed to 1.2.

---

### 1.2 — Partner Logs In

1. Go to `http://localhost:5173/partner-login`
   - *Partners use a separate login URL; they do NOT use the main school login.*
2. Enter **Email:** `rahul.partner@wombto18.com`
3. Enter **Password:** `Partner@123`
4. Click **Login**

**What you should see:**
- **No OTP step** — Partners log in with email + password only.
- Redirect to Partner Dashboard at `/partner/dashboard`.
- Left sidebar with 4 items: **Impact Overview**, **Discover Schools**, **Transaction History**, **Event Invoices**.
- Header shows "WombTo18" and "Partner Network".
- User profile area at bottom of sidebar with name and rank (Silver/Gold/Platinum).

**Demo point:** "Partners have a dedicated portal separate from schools. No OTP — streamlined for external partners."

---

### 1.3 — Impact Overview: Invite Link & Onboarded Schools

1. You land on **Impact Overview** (first tab).
2. **Stats cards:** Total Contributions (₹), Successful Orders count, Current Rank (Silver/Gold/Platinum).
3. Scroll to **"Your Invite Link"** (or similar section).
4. A URL is shown, e.g. `http://localhost:5173/register-school?ref=a1b2c3d4e5f6...` (the `ref` is a long hex token).
5. Click **Copy Link** (or copy manually).

**What you should see:** Alert "Invite link copied to clipboard! Share it with schools to onboard them."

6. Look for **"Schools You've Onboarded"** — list of schools that registered via this partner's link. Initially empty.

**Demo point:** "When a school registers using this link, they appear in 'Schools You've Onboarded' and the partner gets commission credit."

---

### 1.4 — Discover Schools & Sponsor

1. Click **Discover Schools** in the sidebar.
2. **What you should see:** Grid/list of all registered schools. Each card shows:
   - School name, city, state
   - Credit pool progress (e.g. bar showing collected vs goal)
   - **Sponsor** or **View Stats** button
3. Click **Sponsor** on "Sunrise Public School" (or any school).
4. **Sponsor modal:**
   - Type: General (or event-specific)
   - Amount: enter `5000` (or number of students × 500)
   - Description (optional)
5. Click **Proceed to Payment** or **Pay**.
6. Razorpay checkout opens. Use test card: `4111 1111 1111 1111` | `12/26` | `123`.
7. Complete payment.

**What you should see:** Payment success; modal closes; school's credit pool increases. Transaction appears in Transaction History.

---

### 1.5 — Transaction History

1. Click **Transaction History** in the sidebar.
2. **What you should see:** Table/list of all donations by this partner. Columns: school name, amount, date, type.

---

### 1.6 — Event Invoices

1. Click **Event Invoices** in the sidebar.
2. **What you should see:**
   - If events are completed: Cards for each event with **Download** button (PDF invoice).
   - If none: Empty state — "Invoices are generated automatically when events are marked as completed."

**Demo point:** "Partners get financial documentation for CSR reporting."

---

## 4. PART 2 — School Admin Journey

**Who you are:** Dr. Anita Sharma, School Admin of Sunrise Public School.

---

### 2.1 — School Admin Registers

1. Go to `http://localhost:5173/register`
2. **Full Name:** `Dr. Anita Sharma`
3. **Email:** `sunrise.school.demo@gmail.com`
4. **Password:** `Admin@123`
5. **Registration Role:** **School Administrator**
6. Click **Create Account**

**What you should see:** "Account created! Please login." — redirect to `/`.

---

### 2.2 — School Admin Logs In (OTP Two-Factor)

1. On `http://localhost:5173`, enter:
   - **Email:** `sunrise.school.demo@gmail.com`
   - **Password:** `Admin@123`
2. Click **Send OTP**
3. **Check backend terminal** for line: `[EMAIL OTP] To sunrise.school.demo@gmail.com: Your code is XXXXXX`
4. Enter the 6-digit OTP in the input field.
5. Click **Verify & Login**

**What you should see:**
- Redirect to `/dashboard`.
- Header: "Welcome, Dr. Anita Sharma".
- Role badge: "School Admin" (or "School administrator").
- Green badge: "Registered Institution" or "Registration Pending" (if no school yet).
- Left sidebar: Dashboard, School Details, Events, Certifications, Ambassadors, Records, Staff (role-dependent).
- If no school: A prompt or button to **Register your school**.

**Demo point:** "Two-factor by default — password + OTP to email. No plain password login."

---

### 2.3 — Register School (Full Form Walkthrough)

**Before starting:** If demonstrating partner referral, have the partner's invite link ready. After login, open that link in the same tab (e.g. `http://localhost:5173/register-school?ref=<token>`). The form will show a banner: "Registering through **Rahul Bose** (commission-based partnership)" and Registration Type will be locked to "Via Partner (invite link)".

**If going direct:** Click **Register your school** from the dashboard (or navigate to `/register-school`).

**Form sections and exact values:**

#### Basic Information
| Field | Value to Enter |
|-------|----------------|
| Registration Type | Direct or Channel Partner (auto if ref in URL) |
| School Name | Sunrise Public School |
| UDISE+ Code | 27150198765 |
| School Type | Private (from dropdown) |
| Board Affiliation | CBSE |

#### Principal Details
| Field | Value |
|-------|-------|
| Principal's Full Name | Dr. Anita Sharma |
| Principal's Contact | 9876543210 |

#### Location & Capacity
| Field | Value |
|-------|-------|
| Complete Address | 45 Prabhat Road, Pune |
| **State** | Select **Maharashtra** — district dropdown populates |
| **City/District** | Select **Pune** |
| Pincode | 411004 |
| Student Strength | 620 |
| Academic Year | 2024-2025 |

#### POC & PTA (optional)
| Field | Value |
|-------|-------|
| POC Name | — |
| POC Mobile | 9123456780 |
| POC Email | — |
| PTA Name | — |

5. Click **Proceed to Payment**.
6. Razorpay modal opens. Use test card.
7. Complete payment.

**What you should see:**
- Redirect to `/register-school/thank-you?regNo=...&school=...&email=...`
- "Registration Successful!" or similar.
- **Registration Number** in format `SCH-MH-20250312-123456` (State code + date + random).
- School name, email, message that credentials were sent.

**Demo point:** "Every school gets a unique traceable registration number. State–district cascade ensures correct location data."

---

### 2.4 — School Details (Leadership & Emergency Contacts)

1. Click **School Details** in the sidebar.
2. **What you should see:** Cards for Principal, Vice Principal, Fire Dept, Police, NDRF, Nurse, Gynecologist, Pediatrician. Initially "Unassigned" or empty.
3. Click **Update Details** (top right).
4. **Modal with 3 tabs:**

**Tab 1 — Core Leadership**
| Slot | Name | Contact |
|------|------|---------|
| Principal | Dr. Anita Sharma | 9876543210 |
| Vice Principal | Mr. Suresh Kulkarni | 9765432101 |

**Tab 2 — Emergency Responders**
| Slot | Name | Contact |
|------|------|---------|
| Fire Department | Pune Fire Brigade | 101 |
| Police Station | Prabhat Road Police | 100 |
| NDRF Trainer | NDRF Unit 4 Pune | 9900112233 |

**Tab 3 — Medical Experts**
| Slot | Name | Contact |
|------|------|---------|
| School Nurse | Ms. Priya Deshpande | 9988776655 |
| Gynecologist | Dr. Sunita Rao | 9876512340 |
| Pediatrician | Dr. Ravi Menon | 9123409876 |

5. Optional: Click camera icon on any slot to upload a photo.
6. Click **Save All Changes**.

**What you should see:** Modal closes; all cards now show names and contacts. Emergency section has red/blue/orange icons; Health section has avatars.

**Demo point:** "Parents see these contacts in their portal — fire, police, nurse — one tap away in an emergency."

---

### 2.5 — Add Staff Members

1. Click **Staff** in the sidebar.
2. Click **Add Staff Member**.
3. **Staff 1 — Class Teacher:**
   - Name: `Ms. Kavita Desai`
   - Email: `kavita.teacher.demo@gmail.com`
   - Phone: `9001122334`
   - Role: **Class Teacher**
   - Assigned Class: `10`
   - Assigned Section: `A`
   - Password: `Teacher@123`
4. Click **Save**.
5. **Staff 2 — Nurse:**
   - Name: `Ms. Priya Deshpande`
   - Email: `priya.nurse.demo@gmail.com`
   - Phone: `9988776655`
   - Role: **Nurse / Counsellor**
   - Password: `Nurse@123`
   - (No class/section for nurse)
6. Click **Save**.

**What you should see:** Both appear in staff list with role badges. Ms. Kavita Desai shows "Class 10 – A". Edit and Remove buttons on each row.

---

### 2.6 — Add Ambassador

1. Click **Ambassadors** in the sidebar (visible to Admin/Principal/Ops).
2. Click **Add Ambassador**.
3. Fill:
   - Name: `Mr. Vikram Patel`
   - Type: Individual (or Organization)
   - Organization: `Patel Enterprises`
   - Contact: `9876500001`
   - Notes: `Sponsoring annual health checkup 2024-25`
4. Click **Save**.

**What you should see:** Ambassador card appears in the "Institutional Benefactors" wall.

---

### 2.7 — Add Certification

1. Click **Certifications**.
2. Click **Add Certification**.
3. Fill:
   - Title: `Fire Safety Certified`
   - Issued By: `Maharashtra Fire Department`
   - Type: FIRE_SAFETY_DRILL or OTHER (if dropdown)
   - Status: Active
   - Issue Date: 01/01/2025
   - Expiry Date: 31/12/2025
4. Click **Save**.

**What you should see:** Certification card with green "Active" badge. Expiry tracked.

---

### 2.8 — Register Students

1. Click **Records** in the sidebar.
2. Click **Add New Student** (or **Register New Student**).
3. **Student 1 — Arjun Mehta:**

| Field | Value |
|-------|-------|
| Full Name | Arjun Mehta |
| Class | 10 |
| Section | A |
| Father's Name | Suresh Mehta |
| Father's number (for parent login) | 9312350305 |
| Mother's Name | Kavita Mehta |
| Mother's number | 9312350306 |
| Student Email | arjun.mehta@gmail.com |
| Primary Mobile No | 9312350305 |
| Gender | Male |
| State (Migration ID) | Maharashtra |

4. Click **Register Record**.
5. **Student 2 — Priya Nair:**

| Field | Value |
|-------|-------|
| Full Name | Priya Nair |
| Class | 10 |
| Section | A |
| Father's number | 9845001122 |
| Mother's number | 9845001123 |
| Primary Mobile No | 9845001122 |
| Gender | Female |

6. Click **Register Record**.

**What you should see:** Both students appear in the list with auto-generated registration numbers (e.g. `CHD-MH-20250312-1-0001`). Search bar at top — type "Arjun" to filter.

**Note:** Blood group and allergies can be added via **Edit** on the student row if the Edit form includes those fields. They appear on the ID card and in Emergency Access.

---

### 2.9 — Enter Health Record (Child Profile)

1. In Records list, click on **Arjun Mehta** (the row is clickable).
2. Child Profile page opens. Tabs: **Overview**, **Health Metrics**, **History**, **Edit Log**.
3. Click **New Session** (top right).
4. Health record form appears. Fill:

**Basic**
- Academic Year: `2024-2025`
- Checkup Date: Today's date

**BMI Section**
- Height: `162` cm
- Weight: `54` kg  
  *(BMI auto-calculates to ~20.6 — "Normal" category)*

**Eye/Vision Section**
- Left Eye: `6/6`
- Right Eye: `6/9`
- Vision Referral Needed: No

**Dental Section**
- Dental Overall Health: Healthy
- Dental Referral Needed: No

5. Click **Save Record**.

**What you should see:** Record saved. Overview tab shows Health Radar, BMI gauge (20.6, Normal), Dental and Eye cards updated.

---

### 2.10 — Edit Record & View Edit Log

1. On Arjun's profile, click **Edit** (top right).
2. Change **Weight** from `54` to `55`.
3. Click **Save Record**.
4. Click the **Edit Log** tab (or "Edit History").

**What you should see:** Log entry: "Dr. Anita Sharma (School Admin) — [date/time]". Expand to see `weight: 54 → 55`. Every change tracked.

**Demo point:** "Complete audit trail. If a record is disputed, we see exactly who changed what and when."

---

### 2.11 — Complete (Finalize) Record

1. On Arjun's profile, find **Complete Record** button (green, top right — Admin/Principal only).
2. Click it.
3. Confirmation: "Finalizing this record will lock it permanently and send the annual health report to the parent. Continue?"
4. Click **OK**.

**What you should see:** "Record Locked" badge. Edit button disappears. Record is read-only. Alert: "Record finalized successfully. Annual report sent to parent."

**Demo point:** "Once the school year's checkup is complete, the admin finalizes. Record is locked; annual summary goes to the parent."

---

### 2.12 — Student Identity Card

1. On Arjun's profile, find **Identity Card** button (or CreditCard icon).
2. Click it — new tab opens.

**What you should see:**
- Digital ID card: name, initials avatar, registration number, Class 10-A, school name, blood group (if set), QR code.
- URL: `http://localhost:5173/card/<long-token>`
- **No login required** — fully public.

3. Copy URL, open in Window 2 (incognito) — loads without login.

**Demo point:** "Parents can save, print, or show this in an emergency. QR on physical card opens the same page."

---

### 2.13 — Bulk ID Card Export

1. Go back to **Records** tab (student list).
2. Find **Download All ID Cards** (or **Bulk Export**) button.
3. Optionally filter by Class: 10, Section: A.
4. Click the button.

**What you should see:** PDF downloads — one ID card per page for each student in the selection.

---

### 2.14 — Events: Two Activation Paths

1. Click **Events** in the sidebar.
2. **If locked:** Screen shows two cards — **Pay ₹50,000** (Direct) and **Generate QR & Link** (no payment).

#### Path A — Direct Payment
1. Click **Pay ₹50,000** (or "Pay Gap" if partial amount).
2. Razorpay → test card → complete.
3. Locked screen disappears. Seven program cards appear: Health Checkup, Mental Wellness, Nutrition, Fire Drill, CPR, Hygiene, Immunization.
4. Click **+ Schedule** on "Annual Health Check-up".
5. Pick date (e.g. 2 weeks from today) → Schedule.

**What you should see:** Event listed with status "Scheduled", date shown. Calendar view updates.

#### Path B — QR / Link (No Payment)
1. Click **Generate QR & Link**.
2. Unique invite URL appears: `http://localhost:5173/join/<token>`.
3. **Copy Link** — calendar unlocks immediately. No payment.
4. Use this URL for Parent Join (Scene 6.1).

**Demo point:** "Two models. Direct: school pays ₹50k, pool unlocks. QR: school shares link, parents self-register, no payment — instant unlock."

---

### 2.15 — UDISE Report

1. Click **UDISE Report** in sidebar (or go to `/dashboard/udise-report`).
2. **What you should see:** Form pre-filled: School Name, UDISE Code, State, District, Board, Type, Strength from school profile.
3. Health Check-up Summary table: 6 parameters (General Medical, Eye, Dental, BMI, Menstrual Wellness, First-Aid).
4. Medical Team section: add/remove doctor records.
5. Follow-up checklist, Attachments, Declaration.
6. Toggle **Edit** / **Save**. Click **Generate Report** or **Download**.

**Demo point:** "UDISE compliance — all data pulled from existing school profile. No manual re-entry."

---

## 5. PART 3 — WOMBTO18 Ops Journey

**Who you are:** Riya Kapoor, WombTo18 internal operations staff.

---

### 3.1 — Ops Login

1. Logout from any current session (click Logout in sidebar).
2. Go to `http://localhost:5173`
3. Email: `ops.wombto18.demo@gmail.com`
4. Password: `Ops@123`
5. **Send OTP** → check backend console for code.
6. Enter OTP → **Verify & Login**.

**What you should see:**
- Dashboard with stats **across all schools** (not just one).
- Sidebar includes **Event Requests** tab (Ops-only).
- Tabs: Dashboard, School Details, Events, Certifications, Ambassadors, Records, **Available Schools**, **Event Requests**.

---

### 3.2 — Event Approval Requests

1. Click **Event Requests** in the sidebar.
2. **What you should see:** Page "Event Approval Requests" — "WOMBTO18 Officials monitor these requests to assign or approve event personnel."
3. List of pending requests from schools. Each card shows:
   - Event type and title
   - School name
   - Proposed personnel (name, contact, details)
   - Status: Pending / Approved / Rejected
4. For a **PENDING** request:
   - Type in **Official Notes**: e.g. "Approved — Dr. Menon assigned."
   - Click **Approve**.
5. For another, click **Reject** — add notes: "Capacity full — please reschedule."

**What you should see:** Status updates. Approved (green), Rejected (red). Notes stored and visible.

**Demo point:** "Schools submit requests for support; ops staff coordinate and approve centrally."

---

### 3.3 — Cross-School Visibility

1. Click **Available Schools** — see all registered schools.
2. Click **Records** — students from **all** schools (not scoped to one).
3. Click **Events** — manage events for any school.

**Demo point:** "Ops has bird's-eye view — can step in for onboarding, audits, or support."

---

## 6. PART 4 — District Viewer Journey

**Who you are:** Mr. Ashok Rane, District Education Officer.

---

### 4.1 — District Viewer Login

1. Logout.
2. Email: `district.viewer.demo@gmail.com`
3. Password: `District@123`
4. OTP → Verify.

**What you should see:**
- **Read-only** dashboard.
- **District Overview** table — one row per school.
- **No** Events, Staff, Ambassadors, Certifications — no write access.
- Columns: School, Location, Students, Coverage %, Drill Completion, High-risk flags.

**Demo point:** "Government oversight — aggregated district health report, no edit access."

---

## 7. PART 5 — Class Teacher Journey

**Who you are:** Ms. Kavita Desai, Class Teacher of Class 10-A.

---

### 5.1 — Class Teacher Login

1. Logout.
2. Email: `kavita.teacher.demo@gmail.com`
3. Password: `Teacher@123`
4. OTP → Verify.

**What you should see:**
- Fixed badge: **"Class 10 – Section A"** (no class dropdown).
- Only tabs: Dashboard, School Details, Records.
- **No** Events, Staff, Ambassadors, Certifications.
- Dashboard stats show **only** Class 10-A data (e.g. 2 students).

---

### 5.2 — View & Edit Records

1. Click **Records** — only Arjun Mehta and Priya Nair visible.
2. Click **Arjun Mehta** — full profile, health metrics, history, edit log. If record finalized, **Edit** button hidden.
3. Click **Priya Nair** — Edit available (not finalized).
4. Edit → update health data → Save.

**Demo point:** "Class Teacher sees only their class. Backend enforces — cannot access other classes via URL."

---

## 8. PART 6 — Parent Journey

**Who you are:** Suresh Mehta, father of Arjun Mehta.

---

### 6.1 — Parent Join (via Invite Link)

1. **Window 2 (incognito).**
2. Paste invite link: `http://localhost:5173/join/<token>` (from Events → Generate QR & Link).
3. **What you should see:**
   - School card: Sunrise Public School — Private • CBSE
   - Principal: Dr. Anita Sharma
   - Location: 45 Prabhat Road, Pune, Maharashtra
   - UDISE: 27150198765
   - Blue info: "Your school has invited you to register on the WombTo18 Parent Portal"
   - Button: **Register / Login via OTP**
4. Click **Register / Login via OTP** → navigates to `/parent-login`.

---

### 6.2 — Parent OTP Login

1. On Parent Login page, enter **Mobile:** `9312350305` (Arjun's father's number).
2. Click **Send OTP**.
3. **Backend console:** `[SMS] To 9312350305: Your WombTo18 verification code is XXXXXX`
4. Enter OTP → Click **Verify**.

**What you should see:**
- Child selection screen: **Arjun Mehta — Class 10-A — Sunrise Public School**.
- Click Arjun's card → Parent Dashboard opens.

---

### 6.3 — Parent Dashboard Tabs (Detailed)

#### Tab: Health Status
- Health Radar chart: BMI, Vision, Dental, Hygiene, Growth.
- BMI card: 20.6 — Normal.
- Eye: L 6/6, R 6/9.
- Dental: Healthy.
- Referral alerts (if any).
- "Annual Record Locked" badge if finalized.

#### Tab: Safety & Programs
- Scheduled events (e.g. Annual Health Check-up) with date and status.
- Child's attendance: Attended / Absent / Pending per program.

#### Tab: Medical Reports
- Download annual health report (if record finalized).
- Access Requests section — approve/deny third-party access.

#### Tab: Access History
- Log: "Health record created by Dr. Anita Sharma — [date]"
- "Health record updated — weight: 54 → 55 — [date]"
- "Record finalized — Annual report generated — [date]"

#### Tab: School Info
- School profile, leadership (Principal, Vice Principal).
- Emergency contacts: Fire, Police, NDRF.
- Health experts: Nurse, Gynecologist, Pediatrician.
- All with names and phone numbers.

**Demo point:** "Parents have full transparency — health summary, event attendance, audit trail, and emergency contacts in one place."

---

## 9. PART 7 — Emergency Access

**Scenario:** A first responder scans the QR on a student's ID card and needs health data. Parent must approve.

### 7.1 — Emergency Access Flow

1. **Get child ID:** From school Records, open Arjun's profile. Note the numeric `id` in the URL (e.g. `/child/5` → childId = 5).
2. **Window 2 (incognito):** Open `http://localhost:5173/emergency-access/5` (replace 5 with actual childId).
3. **What you should see:** "Emergency Health Access — WombTo18 — Secure Parent-Approved Access" and "Waiting for Parent Approval" (polls every few seconds).
4. **Window 1:** Log in as Parent (Suresh Mehta) — mobile 9312350305, OTP. Go to child dashboard → **Access Requests** or similar.
5. Approve the pending emergency access request.
6. **Back to Window 2:** Screen updates to show Arjun's critical health data — blood group, allergies, recent readings.

**Demo point:** "No one accesses child health data without parent's real-time consent. PDPA/DPDPA compliant."

---

## 10. PART 8 — Public Features

### 8.1 — Health ID Card (Public)

1. From Arjun's profile, open Identity Card → copy URL: `http://localhost:5173/card/<token>`.
2. Open in incognito (or another browser).
3. **What you should see:** Full ID card — name, class, school, blood group, QR — **no login**.

---

## 11. Troubleshooting

| Issue | Possible Cause | Fix |
|-------|----------------|-----|
| "Column does not exist" in Prisma Studio | Schema out of sync | `npx prisma db push` then `npx prisma generate` (stop Studio first) |
| OTP not received | Email/SMS not configured | Check backend console — OTP is printed in dev |
| "dispatchNotification is not a function" | Notification service not implemented | Check `notificationService.ts` — may need stub |
| Partner invite link 404 or invalid | Partner has no `partnerInviteToken` | Ensure schema has `partnerInviteToken` on User; run db push |
| School not showing for Admin | User not linked to school | After school registration, user is auto-linked. Or link via Prisma/DB. |
| Parent sees no children | Father/Mother number mismatch | Parent logs in with number stored in child record. Must match exactly. |
| Razorpay fails | Missing/invalid keys | Check `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in `.env` |

---

## 12. Feature Checklist

| # | Feature | Route/Where |
|---|---------|-------------|
| 1 | User registration (Admin/Partner) | `/register` |
| 2 | School registration + partner ref | `/register-school?ref=` |
| 3 | State → District cascade | Registration form |
| 4 | OTP two-factor login | `/` |
| 5 | Dashboard stats, charts, filters | Dashboard tab |
| 6 | School Details — leadership, emergency, health | School Details tab |
| 7 | Staff management | Staff tab |
| 8 | Ambassadors | Ambassadors tab |
| 9 | Certifications | Certifications tab |
| 10 | Student registration + auto ID | Records tab |
| 11 | Health record — BMI, Eye, Dental | Child Profile → New Session |
| 12 | Edit Log | Child Profile → Edit Log tab |
| 13 | Complete Record | Child Profile |
| 14 | Identity Card with QR | Child Profile |
| 15 | Bulk ID card export | Records tab |
| 16 | Events: Direct Payment / QR Link | Events tab |
| 17 | UDISE Report | Dashboard → UDISE Report |
| 18 | Class Teacher restricted view | Login as teacher |
| 19 | Partner invite link + onboarded schools | Partner Dashboard |
| 20 | Partner: Discover Schools, Sponsor | Partner Dashboard |
| 21 | Partner: Transaction History, Event Invoices | Partner Dashboard |
| 22 | Parent OTP login | `/parent-login` |
| 23 | Parent Join landing | `/join/:token` |
| 24 | Parent: Health, Programs, Reports, History, School Info | Parent Dashboard |
| 25 | Emergency Access | `/emergency-access/:childId` |
| 26 | Public ID Card | `/card/:token` |
| 27 | WOMBTO18_OPS: Event Requests, cross-school | Ops login |
| 28 | DISTRICT_VIEWER: read-only overview | District Viewer login |

---

## Quick Reference Card

| Person | Role | Login | Password |
|--------|------|-------|----------|
| Dr. Anita Sharma | School Admin | sunrise.school.demo@gmail.com | Admin@123 + OTP |
| Ms. Kavita Desai | Class Teacher | kavita.teacher.demo@gmail.com | Teacher@123 + OTP |
| Ms. Priya Deshpande | Nurse | priya.nurse.demo@gmail.com | Nurse@123 + OTP |
| Rahul Bose | Partner | rahul.partner@wombto18.com | Partner@123 (no OTP) |
| Riya Kapoor | WOMBTO18 Ops | ops.wombto18.demo@gmail.com | Ops@123 + OTP |
| Mr. Ashok Rane | District Viewer | district.viewer.demo@gmail.com | District@123 + OTP |
| Suresh Mehta (Parent) | — | Mobile: 9312350305 | OTP on SMS/console |

**Razorpay:** `4111 1111 1111 1111` | `12/26` | `123`

---

*Estimated full walkthrough: 60–75 minutes. Highlights-only: 25–30 minutes (skip Ops, District, Emergency).*
