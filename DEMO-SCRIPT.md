# WombTo18 School Module — Full Demo Script
### Manager Presentation Walkthrough
> Follow this script top to bottom. Each section tells you WHAT FEATURE you are demonstrating, WHO you are acting as, EXACTLY what to type/click, and WHAT you should see.

---

## PREREQUISITES

- Frontend running at: http://localhost:5173
- Backend running at: http://localhost:5000
- Have two browser windows open:
  - Window 1 (normal): for School Admin / Partner
  - Window 2 (incognito): for Parent Portal
- Have this document open on a second screen or printed

---

---

# PART 1 — PARTNER JOURNEY
## "I am a Channel Partner onboarding schools for WombTo18"

---

### SCENE 1.1 — Partner Registers a School via Referral Link

**FEATURE BEING TESTED:** Channel Partner referral flow, registration type dropdown, state/district cascade, registration number auto-generation, post-payment thank-you page.

**WHO YOU ARE:** A channel partner named Rahul Bose who sells WombTo18 subscriptions to schools.

**WHAT TO DO:**

1. Open Window 1 → go to: `http://localhost:5173/register-school?ref=PARTNER001`
   *(The `?ref=` in the URL is how the partner's referral is tracked)*

2. You will see the School Registration form. Fill in EXACTLY:

   | Field | Value to Enter |
   |---|---|
   | School Name | Sunrise Public School |
   | UDISE Code | 27150198765 |
   | School Type | Private |
   | Board Affiliation | CBSE |
   | Principal Name | Dr. Anita Sharma |
   | Principal Contact | 9876543210 |
   | School Email | sunrise.school.demo@gmail.com |
   | Student Strength | 620 |

3. **State field** → click dropdown → select **"Maharashtra"**
   - WATCH: District dropdown populates automatically with Maharashtra's districts
   - Select **"Pune"**
   - WATCH: State Code field auto-fills to **"MH"** (read-only, cannot be changed)

4. Fill address details:

   | Field | Value |
   |---|---|
   | Address | 45 Prabhat Road |
   | Pincode | 411004 |

5. **Registration Type** → click dropdown → select **"Channel Partner"**
   - WATCH: A partner reference field appears showing the partner code from the URL

6. POC (Point of Contact) details:

   | Field | Value |
   |---|---|
   | POC Name | Meera Joshi |
   | POC Mobile | 9123456780 |
   | POC Email | meera.joshi@sunrise.edu |

7. Click **"Proceed to Payment"**

8. Razorpay payment window opens. Use these test card details:
   - Card Number: `4111 1111 1111 1111`
   - Expiry: `12/26`
   - CVV: `123`
   - Name on Card: `Test User`
   - Click Pay

**WHAT YOU SHOULD SEE:**
- Redirected to a Thank You page at `/register-school/thank-you`
- Shows: "Registration Successful!"
- Displays Registration Number like: **MH-PU-20260322-000001**
- Shows school name, email, and a message saying credentials were sent

**POINT TO MENTION:** "The registration number is auto-generated using State Code + District Code + Date + Sequence. Every school gets a unique traceable ID."

---

---

# PART 2 — SCHOOL ADMIN JOURNEY
## "I am the School Admin who just registered. Now I log in and set up my school."

---

### SCENE 2.1 — School Admin Logs In

**FEATURE BEING TESTED:** OTP-based two-factor login, JWT session, role-based dashboard.

**WHO YOU ARE:** Dr. Anita Sharma, School Admin of Sunrise Public School.

**WHAT TO DO:**

1. Go to: `http://localhost:5173`
2. Click **"School Login"**
3. Enter Email: `sunrise.school.demo@gmail.com`
4. Click **"Send OTP"**
5. Check email inbox for OTP (or check backend terminal — OTP will be printed in console logs if email not configured)
6. Enter the 6-digit OTP
7. Click **"Verify & Login"**

**WHAT YOU SHOULD SEE:**
- Dashboard loads with: "Welcome, Dr. Anita Sharma"
- Role badge shows: **"School Admin"**
- Green badge: "Registered Institution"
- Stats area shows coverage circles (all 0% since no students yet)

**POINT TO MENTION:** "Login uses OTP sent to registered email — no plain passwords visible, two-factor by default."

---

### SCENE 2.2 — Setting Up School Leadership & Emergency Contacts

**FEATURE BEING TESTED:** School Details tab, leadership assignment, emergency contacts, health expert profiles.

**WHAT TO DO:**

1. In the left sidebar, click **"School Details"**
2. You will see the institutional profile with empty "Unassigned Slot" cards
3. Click **"Update Details"** button (top right)
4. A modal opens with 3 sections. Start with **"Core Leadership"** tab:

   | Role | Name | Contact |
   |---|---|---|
   | Principal | Dr. Anita Sharma | 9876543210 |
   | Vice Principal | Mr. Suresh Kulkarni | 9765432101 |

5. Click **"Emergency Responders"** tab in the modal:

   | Role | Name | Contact |
   |---|---|---|
   | Fire Department | Pune Fire Brigade | 101 |
   | Police Station | Prabhat Road Police | 100 |
   | NDRF Trainer | NDRF Unit 4 Pune | 9900112233 |

6. Click **"Medical Experts"** tab:

   | Role | Name | Contact |
   |---|---|---|
   | School Nurse | Ms. Priya Deshpande | 9988776655 |
   | Gynecologist | Dr. Sunita Rao | 9876512340 |
   | Pediatrician | Dr. Ravi Menon | 9123409876 |

7. Click **"Save All Changes"**

**WHAT YOU SHOULD SEE:**
- All six cards on the School Details page now show names and contacts
- Principal card shows Dr. Anita Sharma's photo placeholder and contact
- Emergency section shows Fire, Police, NDRF with colored icons
- Health section shows Nurse, Gynecologist, Pediatrician

**POINT TO MENTION:** "All emergency contacts are visible to parents in their portal too — parents can see who to call in an emergency at their child's school."

---

### SCENE 2.3 — Adding a Class Teacher (Staff Management)

**FEATURE BEING TESTED:** Staff creation, role assignment, class/section restriction.

**WHAT TO DO:**

1. Click **"Staff"** in the sidebar
2. Click **"Add Staff Member"**
3. Fill in:

   | Field | Value |
   |---|---|
   | Name | Ms. Kavita Desai |
   | Email | kavita.teacher.demo@gmail.com |
   | Phone | 9001122334 |
   | Role | Class Teacher |
   | Assigned Class | 10 |
   | Assigned Section | A |
   | Password | Teacher@123 |

4. Click **Save**

**WHAT YOU SHOULD SEE:**
- Ms. Kavita Desai appears in the staff list with role "Class Teacher" and "Class 10 - A" tag

---

### SCENE 2.4 — Registering a Student

**FEATURE BEING TESTED:** Child registration, auto registration number, student profile creation.

**WHAT TO DO:**

1. Click **"Records"** in the sidebar
2. Click **"Register New Student"**
3. Fill in:

   | Field | Value |
   |---|---|
   | Student Name | Arjun Mehta |
   | Class | 10 |
   | Section | A |
   | Gender | Male |
   | Date of Birth | 15/03/2010 |
   | Father's Name | Suresh Mehta |
   | Father's Mobile | 9312350305 |
   | Mother's Name | Kavita Mehta |
   | Mother's Mobile | 9312350306 |
   | Email (student) | arjun.mehta@gmail.com |
   | Blood Group | B+ |
   | Allergic To | Dust, Pollen |

4. Click **Save**

**WHAT YOU SHOULD SEE:**
- Arjun Mehta appears in the student list
- Auto-generated Registration Number assigned (e.g., SUN-10A-2026-001)

5. Register a second student:

   | Field | Value |
   |---|---|
   | Student Name | Priya Nair |
   | Class | 10 |
   | Section | A |
   | Gender | Female |
   | DOB | 22/07/2010 |
   | Father's Mobile | 9845001122 |
   | Blood Group | A+ |

**POINT TO MENTION:** "Each student gets a unique registration number. The system tracks which school, class, section, and year they belong to."

---

### SCENE 2.5 — Entering a Student's Health Record

**FEATURE BEING TESTED:** Health record form with BMI, eye vision, dental sections all visible by default.

**WHAT TO DO:**

1. In the Records tab, click on **Arjun Mehta**
2. Child Profile page opens — click **"Add Health Record"** (or go to the health form section)
3. The form opens. Notice that BMI, Eye Vision, and Dental sections are ALL visible by default (Status = Present for all three)
4. Fill in:

   **Basic Info:**
   | Field | Value |
   |---|---|
   | Academic Year | 2024-2025 |
   | Checkup Date | Today's date |

   **BMI Section:**
   | Field | Value |
   |---|---|
   | Height | 162 cm |
   | Weight | 54 kg |
   | BMI Status | Present |
   *(BMI auto-calculates to ~20.6 — "Normal" category)*

   **Eye Vision Section:**
   | Field | Value |
   |---|---|
   | Eye Status | Present |
   | Left Eye | 6/6 |
   | Right Eye | 6/9 |
   | Spectacles | No |
   | Vision Referral Needed | No |

   **Dental Section:**
   | Field | Value |
   |---|---|
   | Dental Status | Present |
   | Cavities | No |
   | Gum Issues | No |
   | Dental Referral Needed | No |

   **Other:**
   | Field | Value |
   |---|---|
   | Blood Pressure | 118/76 |
   | Haemoglobin | 13.2 |

5. Click **"Save Record"**

**WHAT YOU SHOULD SEE:**
- Record saved successfully
- Health Radar chart updates on the Overview tab showing BMI, Vision, Dental scores
- The record appears in the Health History tab

**POINT TO MENTION:** "Previously the eye vision and dental fields were hidden by default — we fixed that. Now all three sections show by default so nurses don't miss any data."

---

### SCENE 2.6 — Generating a Student Identity Card

**FEATURE BEING TESTED:** Token-based ID card generation, shareable link.

**WHAT TO DO:**

1. On Arjun Mehta's profile page
2. Click the **"Identity Card"** button in the left sidebar panel
3. A new tab opens

**WHAT YOU SHOULD SEE:**
- A digital ID card with:
  - Arjun Mehta's name and initials
  - Registration number
  - Class 10 - A
  - School name: Sunrise Public School
  - A QR code at the bottom
- The URL is something like `/card/abc123token...` — this is a permanent shareable link
- Copy this URL and open in incognito — it works without any login (public token)

**POINT TO MENTION:** "The ID card URL is permanent and can be printed or shared with parents. Scanning the QR shows the same card. No login needed to view it."

---

### SCENE 2.7 — Unlocking Events via Direct Payment

**FEATURE BEING TESTED:** Two activation options (Direct Pay vs QR), Razorpay payment, event calendar unlock.

**WHAT TO DO:**

1. Click **"Events"** in the sidebar
2. You see the **"Activate Health Programs"** locked screen with TWO cards:
   - Left card: **"Direct Payment"** — Pay ₹50,000 annual fee
   - Right card: **"Parent Self-Registration"** — Generate QR, no payment needed
3. Click **"Pay ₹50,000"** on the Direct Payment card
4. Razorpay opens → use test card:
   - Card: `4111 1111 1111 1111`, Expiry: `12/26`, CVV: `123`
   - Click Pay
5. Page refreshes automatically

**WHAT YOU SHOULD SEE:**
- Locked screen disappears
- Annual Program cards appear: Health Checkup, Mental Wellness, Nutrition Session, Fire Drill, CPR Training, Hygiene & Wellness, Immunization & Deworming
- Credit pool indicator in header shows: **100%** (green)

6. Click **"+ Schedule"** on **"Annual Health Check-up"**
7. A modal opens → pick a date 2 weeks from today → click **Schedule**

**WHAT YOU SHOULD SEE:**
- Event appears in the list with status "Scheduled"
- Calendar view also shows the event on that date

**POINT TO MENTION:** "After payment, the full health calendar is unlocked. The school can schedule all 7 program types across the academic year."

---

### SCENE 2.8 — Generating a Parent Registration QR Link

**FEATURE BEING TESTED:** QR mode activation, no-pool unlocking, shareable parent invite link.

**WHAT TO DO:**

*(Do this on a second test school, OR explain it as an alternative to Scene 2.7)*

1. If showing as alternative: go to Events tab on a new/locked school
2. In the locked screen, click **"Generate QR & Link"** on the right card
3. Wait 2 seconds

**WHAT YOU SHOULD SEE:**
- A link appears: `http://localhost:5173/join/abc123...`
- A "Copy Link" button appears below it
- The calendar IMMEDIATELY unlocks — no payment needed
- Events are now schedulable

4. Click **"Copy Link"**
5. Open the copied link in Window 2 (incognito)

**WHAT YOU SHOULD SEE (in incognito):**
- A clean landing page showing:
  - School name and logo: **Sunrise Public School**
  - Type and board (Private, CBSE)
  - Principal: Dr. Anita Sharma
  - City: Pune, Maharashtra
  - UDISE code
  - Blue info box: "Your school has invited you to register on the WombTo18 Parent Portal"
  - A large button: **"Register / Login via OTP"**

**POINT TO MENTION:** "Schools that don't want to pay ₹50,000 upfront can use the QR path. They share this link via WhatsApp groups, parents click it, register themselves. No pool needed — the calendar is still unlocked."

---

### SCENE 2.9 — UDISE Report

**FEATURE BEING TESTED:** Auto-filled UDISE report from school registration data.

**WHAT TO DO:**

1. In the Dashboard sidebar, click **"UDISE Report"**
   *(or navigate to `/dashboard/udise-report`)*

2. The form loads

**WHAT YOU SHOULD SEE:**
- Fields pre-filled from school data:
  - School Name: Sunrise Public School
  - UDISE Code: 27150198765
  - State: Maharashtra
  - District: Pune
  - Board: CBSE
  - Type: Private
  - Student Strength: 620

3. Review the numbers — edit any if needed
4. Click **"Generate Report"**

**WHAT YOU SHOULD SEE:**
- A downloadable UDISE-format report generates with school and health statistics

**POINT TO MENTION:** "UDISE reports are mandatory for government compliance. Instead of filling it manually every year, the system pulls all data from the existing school profile and health records."

---

---

# PART 3 — CLASS TEACHER JOURNEY
## "I am the Class Teacher assigned to Class 10-A. I log in to check my students."

---

### SCENE 3.1 — Class Teacher Login (Restricted Dashboard)

**FEATURE BEING TESTED:** Role-based access control, class-restricted data view, hidden filters.

**WHO YOU ARE:** Ms. Kavita Desai, Class Teacher of Class 10-A.

**WHAT TO DO:**

1. Logout from admin account (click Logout in sidebar)
2. Login with:
   - Email: `kavita.teacher.demo@gmail.com`
   - Password: `Teacher@123`
   - OTP: check email/console

**WHAT YOU SHOULD SEE:**
- Dashboard loads but with KEY DIFFERENCES from admin:
  - **Sidebar tabs visible:** Dashboard, School Details, Records only
  - **NO tabs for:** Events, Staff, Ambassadors, Certifications
  - **Instead of class/section dropdowns**, a blue badge shows: **"Class 10 – Section A"**
  - Stats show ONLY Class 10-A student data (2 students: Arjun, Priya)

**POINT TO MENTION:** "Class Teachers only see their assigned class. They cannot access other classes, manage staff, or view events. The system enforces this at both frontend and backend."

2. Click **"Records"** tab
   - Only Arjun Mehta and Priya Nair are visible (no students from other classes)

3. Click on Arjun Mehta → can view and edit his health record
   *(Class Teachers have health edit permission)*

---

---

# PART 4 — PARENT JOURNEY
## "I am a parent. I received a link from the school. I want to see my child's health records."

---

### SCENE 4.1 — Parent Logs In via OTP

**FEATURE BEING TESTED:** Parent OTP login, child selection, parent dashboard.

**WHO YOU ARE:** Suresh Mehta, father of Arjun Mehta.

**WHAT TO DO:**

1. Switch to **Window 2 (incognito)**
2. Go to: `http://localhost:5173/parent-login`
3. Enter mobile number: **9312350305** *(Arjun's father's number entered during registration)*
4. Click **"Send OTP"**
5. Check backend console for OTP (printed as `[SMS] To 9312350305: Your WombTo18 verification code is XXXXXX`)
6. Enter the OTP → click **"Verify"**

**WHAT YOU SHOULD SEE:**
- Child selection screen shows: **Arjun Mehta — Class 10-A — Sunrise Public School**
- Click on Arjun's card

---

### SCENE 4.2 — Parent Dashboard — Health Status Tab

**FEATURE BEING TESTED:** Parent view of child's health data, radar chart, notifications.

**WHAT YOU SHOULD SEE on Health Status tab:**
- Health Radar chart showing scores for BMI, Vision, Dental
- BMI value: **20.6** with category "Normal"
- Latest readings from the health record we entered
- Any referral alerts (none in this case since all were "No")

**POINT TO MENTION:** "Parents get a clean visual summary of their child's health. No medical jargon — just clear charts and alerts."

---

### SCENE 4.3 — Parent Dashboard — Safety & Programs Tab

**FEATURE BEING TESTED:** Parent view of scheduled school events.

**WHAT TO DO:**

1. Click **"Safety & Programs"** tab

**WHAT YOU SHOULD SEE:**
- The Annual Health Check-up event we scheduled shows here
- Date, type, and status visible

**POINT TO MENTION:** "Parents can see what health programs are scheduled at the school — transparency about what checkups their child will undergo."

---

### SCENE 4.4 — Parent Dashboard — School Info Tab

**FEATURE BEING TESTED:** Full school information visible to parents including all emergency contacts.

**WHAT TO DO:**

1. Click **"School Info"** tab

**WHAT YOU SHOULD SEE:**

**School Profile section:**
- Sunrise Public School
- Private • CBSE
- UDISE: 27150198765
- Academic Year: 2024-2025
- Total Strength: 620
- Address: 45 Prabhat Road, Pune, Maharashtra

**Institutional Leadership section:**
- Principal: Dr. Anita Sharma — 9876543210
- Vice Principal: Mr. Suresh Kulkarni — 9765432101

**Emergency Contacts section:**
- Fire Department: Pune Fire Brigade — 101
- Police Station: Prabhat Road Police — 100
- NDRF Trainer: NDRF Unit 4 Pune — 9900112233

**Health Experts section:**
- School Nurse: Ms. Priya Deshpande — 9988776655
- Gynecologist: Dr. Sunita Rao — 9876512340
- Pediatrician: Dr. Ravi Menon — 9123409876

**POINT TO MENTION:** "If there's an emergency at school, the parent immediately knows who to call — Fire, Police, NDRF, Nurse. All in one place. This is the differentiator vs any other school health platform."

---

### SCENE 4.5 — Parent Dashboard — Medical Reports Tab

**FEATURE BEING TESTED:** Parent access to medical reports, access history transparency.

**WHAT TO DO:**

1. Click **"Medical Reports"** tab
   - Shows downloadable health report for the academic year

2. Click **"Access History"** tab
   - Shows a log of who has accessed Arjun's data and when
   - Entry shows: "Health record created by school staff on [date]"

**POINT TO MENTION:** "Complete audit trail. Parents can see every time someone accessed their child's health data — full transparency and data privacy compliance."

---

---

# PART 5 — QUICK SUMMARY FOR MANAGER

| # | Feature | Where to Show |
|---|---|---|
| 1 | Channel Partner referral link tracking | URL `?ref=PARTNER001` on registration |
| 2 | State → District cascade dropdown | School registration form |
| 3 | Auto registration number (State+District+Date) | Thank-you page after registration |
| 4 | OTP-based two-factor login | Login page |
| 5 | Role-based dashboard (Admin vs Teacher) | Login as teacher vs admin |
| 6 | Class Teacher sees only their class | Teacher dashboard — no dropdowns, class badge |
| 7 | Full school details + emergency contacts | School Details tab |
| 8 | Child registration + auto ID | Records tab → Register Student |
| 9 | Health record (BMI + Eye + Dental all visible) | Child Profile → Add Health Record |
| 10 | Student Identity Card with QR | Child Profile → Identity Card button |
| 11 | Events: Direct Pay vs QR unlock (two options) | Events tab → locked state |
| 12 | QR → Parent landing page (no login) | /join/:token URL |
| 13 | Parent OTP login → child dashboard | Parent login with father's number |
| 14 | Parent sees emergency contacts | Parent Dashboard → School Info tab |
| 15 | UDISE Report auto-fill | Dashboard → UDISE Report |
| 16 | Access history / audit trail | Parent Dashboard → Access History tab |

---

## TEST DATA REFERENCE CARD

| Person | Role | Login | Password/OTP |
|---|---|---|---|
| Dr. Anita Sharma | School Admin | sunrise.school.demo@gmail.com | OTP on email |
| Ms. Kavita Desai | Class Teacher | kavita.teacher.demo@gmail.com | Teacher@123 + OTP |
| Suresh Mehta | Parent | Mobile: 9312350305 | OTP on SMS/console |
| Arjun Mehta | Student (Class 10-A) | — | — |
| Priya Nair | Student (Class 10-A) | — | — |

**Razorpay Test Card:** `4111 1111 1111 1111` | Expiry: `12/26` | CVV: `123`

---

*Total demo time estimate: 25–35 minutes at comfortable pace.*
