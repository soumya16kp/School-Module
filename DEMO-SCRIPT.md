# WombTo18 School Module — Complete Demo Script
### Manager Presentation Walkthrough — All Features
> Follow this script top to bottom. Each section tells you WHAT FEATURE you are demonstrating, WHO you are acting as, EXACTLY what to type/click, and WHAT you should see.

---

## PREREQUISITES

- Frontend running at: `http://localhost:5173`
- Backend running at: `http://localhost:5000`
- Have two browser windows open:
  - **Window 1 (normal):** School Admin / Partner
  - **Window 2 (incognito):** Parent Portal / public pages
- Have this document open on a second screen or printed

---

# PART 1 — PARTNER JOURNEY
## "I am a Channel Partner who onboards schools and tracks their progress."

---

### SCENE 1.1 — Partner Registers a School via Referral Link

**FEATURE:** Channel Partner referral tracking, school registration form, state/district cascade, auto registration number, Razorpay payment, thank-you page.

**WHO YOU ARE:** Rahul Bose, a channel partner selling WombTo18 subscriptions to schools.

**WHAT TO DO:**

1. Open Window 1 → go to: `http://localhost:5173/register`
2. Create a school admin account:

   | Field | Value |
   |---|---|
   | Name | Dr. Anita Sharma |
   | Email | sunrise.school.demo@gmail.com |
   | Password | Admin@123 |

3. After registration you are redirected to `/register-school?ref=PARTNER001`
   *(The `?ref=` in the URL is how the partner's referral is tracked)*

4. Fill the School Registration form EXACTLY:

   | Field | Value |
   |---|---|
   | School Name | Sunrise Public School |
   | UDISE Code | 27150198765 |
   | School Type | Private |
   | Board Affiliation | CBSE |
   | Principal Name | Dr. Anita Sharma |
   | Principal Contact | 9876543210 |
   | School Email | sunrise.school.demo@gmail.com |
   | POC Mobile | 9123456780 |
   | Student Strength | 620 |
   | Address | 45 Prabhat Road |
   | Pincode | 411004 |
   | Academic Year | 2024-2025 |

5. **State field** → select **"Maharashtra"**
   - WATCH: District dropdown auto-populates with Maharashtra's districts
   - Select **"Pune"**
   - WATCH: State Code field auto-fills to **"MH"** (read-only)

6. **Registration Type** → select **"Channel Partner"**
   - WATCH: A partner reference field appears pre-filled with `PARTNER001`

7. Click **"Proceed to Payment"**

8. Razorpay payment window opens. Use test card:
   - Card Number: `4111 1111 1111 1111`
   - Expiry: `12/26`
   - CVV: `123`
   - Name: `Test User`

**WHAT YOU SHOULD SEE:**
- Redirected to `/register-school/thank-you`
- "Registration Successful!" message
- Auto-generated Registration Number: **MH-PU-20260322-000001** (State+District+Date+Sequence)
- School name, email, message saying credentials were sent

**POINT TO MENTION:** "Every school gets a unique traceable registration number. The partner referral is captured so commissions can be tracked."

---

### SCENE 1.2 — Partner Logs Into Their Own Portal

**FEATURE:** Partner login (email + password, no OTP), dedicated partner dashboard.

**WHO YOU ARE:** Rahul Bose, the channel partner.

**WHAT TO DO:**

1. Go to: `http://localhost:5173/partner-login`
2. Enter:
   - Email: *(partner's registered email — use a pre-existing partner account from your DB, e.g. `rahul.partner@wombto18.com`)*
   - Password: `Partner@123`
3. Click **"Login"**

**WHAT YOU SHOULD SEE:**
- Partner Dashboard loads — different from school dashboard
- Left sidebar has 4 tabs: **Impact Overview, Discover Schools, Transaction History, Event Invoices**
- Header shows partner name and rank badge (Silver / Gold / Platinum based on total contributed)

---

### SCENE 1.3 — Partner: Impact Overview Tab

**FEATURE:** Partner impact stats, invite link for onboarding schools.

**WHAT TO DO:**

1. You land on the **"Impact Overview"** tab by default

**WHAT YOU SHOULD SEE:**
- Total amount contributed (e.g., ₹0 if new partner)
- Number of donations made
- Rank badge: **Silver / Gold / Platinum** (Silver < ₹10k, Gold ₹10k–50k, Platinum > ₹50k)
- A unique **Invite Link** section showing a copyable URL like `http://localhost:5173/register-school?ref=RAHULBOSE001`
- "Copy Link" button

2. Click **"Copy Link"**
   - WATCH: Alert: "Invite link copied to clipboard! Share it with schools to onboard them."

**POINT TO MENTION:** "The partner shares this link with schools. When a school registers via this link, the partner gets credit. The system automatically tracks who brought in which school."

---

### SCENE 1.4 — Partner: Discover Schools Tab

**FEATURE:** Partner browses all registered schools, sees their health program status, can sponsor a school.

**WHAT TO DO:**

1. Click **"Discover Schools"** in the sidebar

**WHAT YOU SHOULD SEE:**
- List of all registered schools with:
  - School name, city, state
  - Credit pool progress bar
  - How much more is needed to unlock their events
- Each school has a **"Sponsor"** button

2. Click **"Sponsor"** on Sunrise Public School
3. Enter amount: **5000**
4. Click Pay → Razorpay test card → complete payment

**WHAT YOU SHOULD SEE:**
- Sunrise Public School's credit pool progress increases by ₹5,000
- Transaction recorded

---

### SCENE 1.5 — Partner: Transaction History Tab

**FEATURE:** Partner sees all their donations/sponsorships.

**WHAT TO DO:**

1. Click **"Transaction History"** in the sidebar

**WHAT YOU SHOULD SEE:**
- List of all past donations by this partner
- Each row shows: school name, amount, date, type

---

### SCENE 1.6 — Partner: Event Invoices Tab

**FEATURE:** Partners can download PDF invoices for completed events at schools they've sponsored.

**WHAT TO DO:**

1. Click **"Event Invoices"** in the sidebar

**WHAT YOU SHOULD SEE (once events exist):**
- Cards for each completed event across schools
- Each card shows: event title, school name, completion date, attendance count, ambassador name
- **"Download"** button → downloads a PDF invoice

*(If no events completed yet, an empty state shows: "Invoices are generated automatically when events are marked as completed.")*

**POINT TO MENTION:** "Partners get financial documentation for every health event their sponsorship funded — useful for CSR reporting."

---

---

# PART 2 — SCHOOL ADMIN JOURNEY
## "I am the School Admin. I log in and fully set up my school."

---

### SCENE 2.1 — School Admin Logs In (OTP Two-Factor)

**FEATURE:** OTP-based two-factor login, JWT session, role-based redirect.

**WHO YOU ARE:** Dr. Anita Sharma, School Admin of Sunrise Public School.

**WHAT TO DO:**

1. Go to: `http://localhost:5173`
2. Enter Email: `sunrise.school.demo@gmail.com`
3. Enter Password: `Admin@123`
4. Click **"Send OTP"**
5. Check email inbox or backend terminal for the 6-digit OTP
   *(Backend console prints: `[EMAIL OTP] To sunrise.school.demo@gmail.com: Your code is XXXXXX`)*
6. Enter the OTP → Click **"Verify & Login"**

**WHAT YOU SHOULD SEE:**
- Dashboard loads
- "Welcome, Dr. Anita Sharma" in the header
- Role badge: **"School Admin"**
- Green "Registered Institution" badge
- Overview stats (all 0% — no students yet)

**POINT TO MENTION:** "Login requires both password AND OTP sent to registered email. No plain password login — two-factor by default."

---

### SCENE 2.2 — Dashboard Overview

**FEATURE:** Real-time school health statistics, charts, coverage metrics, class/section filtering.

**WHAT TO DO:**

1. You are on the **Dashboard** tab by default
2. Notice the stat cards at the top (will show 0 since no students yet — come back after adding students)
3. Use the **Class** and **Section** dropdowns to filter data by class

**WHAT YOU SHOULD SEE (after students are added):**
- Total Students, Health Checkups completed, Screening Coverage %
- Bar charts showing health coverage by class
- Pie chart showing attendance distribution
- Coverage rings for Dental, Eye, BMI, Immunization

---

### SCENE 2.3 — Setting Up School Leadership & Emergency Contacts

**FEATURE:** School Details tab — leadership, emergency contacts, health experts, photo upload.

**WHAT TO DO:**

1. Click **"School Details"** in the sidebar
2. You see empty "Unassigned Slot" cards for all roles
3. Click **"Update Details"** button (top right)
4. A modal opens with 3 tabs. Fill **"Core Leadership"** first:

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

7. *(Optional)* Click the camera icon on any slot to upload a photo
8. Click **"Save All Changes"**

**WHAT YOU SHOULD SEE:**
- All six cards now show names and contacts
- Emergency section: Fire (red), Police (blue), NDRF (orange) icons
- Health section: Nurse, Gynecologist, Pediatrician with avatars

**POINT TO MENTION:** "These contacts are visible to parents in their portal — if there's a fire or emergency, parents instantly know who to call."

---

### SCENE 2.4 — Adding Staff Members

**FEATURE:** Staff management — add with roles, class/section assignment, access control.

**WHAT TO DO:**

1. Click **"Staff"** in the sidebar
2. Click **"Add Staff Member"**
3. Fill in for Class Teacher:

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
5. Add a second staff member (Nurse):

   | Field | Value |
   |---|---|
   | Name | Ms. Priya Deshpande |
   | Email | priya.nurse.demo@gmail.com |
   | Phone | 9988776655 |
   | Role | Nurse / Counsellor |
   | Password | Nurse@123 |

6. Click **Save**

**WHAT YOU SHOULD SEE:**
- Both appear in the staff list with role tags
- Ms. Kavita Desai shows "Class 10 – A" badge
- Edit and Remove buttons on each row

---

### SCENE 2.5 — Adding Ambassadors (Institutional Benefactors)

**FEATURE:** Ambassadors tab — track individuals/organizations who support the school's health programs.

**WHAT TO DO:**

1. Click **"Ambassadors"** in the sidebar
   *(Tab is visible only to SCHOOL_ADMIN, PRINCIPAL, WOMBTO18_OPS)*
2. Click **"Add Ambassador"**
3. Fill in:

   | Field | Value |
   |---|---|
   | Name | Mr. Vikram Patel |
   | Type | Individual |
   | Contact | 9876500001 |
   | Organization | Patel Enterprises |
   | Notes | Sponsoring annual health checkup 2024-25 |

4. Click **Save**

**WHAT YOU SHOULD SEE:**
- Ambassador card appears: "Mr. Vikram Patel — Individual — Patel Enterprises"
- Displayed on a recognition wall as "Institutional Benefactors"

**POINT TO MENTION:** "Schools can publicly acknowledge who funds their health programs — creates a CSR loop between local businesses and the school community."

---

### SCENE 2.6 — Certifications

**FEATURE:** Certifications tab — track school-level certifications and compliance badges.

**WHAT TO DO:**

1. Click **"Certifications"** in the sidebar
2. Click **"Add Certification"**
3. Fill in:

   | Field | Value |
   |---|---|
   | Title | Fire Safety Certified |
   | Issued By | Maharashtra Fire Department |
   | Issue Date | 01/01/2025 |
   | Expiry Date | 31/12/2025 |
   | Status | Active |

4. Click **Save**

**WHAT YOU SHOULD SEE:**
- Certification card with status badge (Active = green, Expiring Soon = amber, Revoked = grey)
- Expiry date tracked — approaching expiry shows a warning

---

### SCENE 2.7 — Registering Students

**FEATURE:** Child registration, auto registration number, parent contact linking.

**WHAT TO DO:**

1. Click **"Records"** in the sidebar
2. Click **"Register New Student"**
3. Fill in for Student 1:

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
   | Email | arjun.mehta@gmail.com |
   | Blood Group | B+ |
   | Allergic To | Dust, Pollen |

4. Click **Save**

5. Register Student 2:

   | Field | Value |
   |---|---|
   | Student Name | Priya Nair |
   | Class | 10 |
   | Section | A |
   | Gender | Female |
   | Date of Birth | 22/07/2010 |
   | Father's Mobile | 9845001122 |
   | Blood Group | A+ |

**WHAT YOU SHOULD SEE:**
- Both students appear in the list with auto-generated registration numbers
- Search bar at top — try typing "Arjun" to filter

**POINT TO MENTION:** "Father's and mother's mobile numbers are linked directly to the student record. When a parent logs in via OTP with that number, they see this child in their portal automatically."

---

### SCENE 2.8 — Entering a Student's Health Record

**FEATURE:** Health record form — BMI, eye vision, dental all visible by default. Auto BMI calculation.

**WHAT TO DO:**

1. In the Records list, click on **Arjun Mehta**
2. Child Profile page opens — observe the 4 tabs: Overview, Health Metrics, History, Edit Log
3. Click **"New Session"** button (top right)
4. The health record form opens. Fill in:

   **Basic Info:**
   | Field | Value |
   |---|---|
   | Academic Year | 2024-2025 |
   | Checkup Date | Today's date |

   **BMI Section:**
   | Field | Value |
   |---|---|
   | BMI Status | Present |
   | Height | 162 cm |
   | Weight | 54 kg |
   *(BMI auto-calculates to ~20.6 — "Normal" category)*

   **Eye Vision Section:**
   | Field | Value |
   |---|---|
   | Eye Status | Present |
   | Left Eye | 6/6 |
   | Right Eye | 6/9 |
   | Vision Referral Needed | No |

   **Dental Section:**
   | Field | Value |
   |---|---|
   | Dental Status | Present |
   | Dental Overall Health | Healthy |
   | Dental Referral Needed | No |

5. Click **"Save Record"**

**WHAT YOU SHOULD SEE:**
- Record saved — Health Radar chart updates on Overview tab
- BMI gauge shows 20.6 in the Normal range (green)
- Dental and Eye metric cards update

---

### SCENE 2.9 — Editing a Record and Viewing Edit Log

**FEATURE:** Edit history — every change to a student record is tracked with who changed what and when.

**WHAT TO DO:**

1. On Arjun Mehta's profile, click **"Edit"** button (top right)
2. Change Weight from `54` to `55`
3. Click **"Save Record"**
4. Now click the **"Edit Log"** tab (4th tab in child profile)

**WHAT YOU SHOULD SEE:**
- A log entry appears: **"Dr. Anita Sharma (School Admin) — [today's date/time]"**
- Expand the entry → shows exactly what changed: `weight: 54 → 55`
- Every field change is listed with before/after values

**POINT TO MENTION:** "Complete audit trail on every student record. If a record is disputed, you can see exactly who changed what and when."

---

### SCENE 2.10 — Completing (Finalizing) a Health Record

**FEATURE:** Complete Record button — locks the record permanently, triggers annual health report to parent.

**WHAT TO DO:**

1. Still on Arjun Mehta's profile
2. Look at the top-right button area — there is a green **"Complete Record"** button
   *(Visible only to SCHOOL_ADMIN and PRINCIPAL)*
3. Click **"Complete Record"**
4. A confirmation dialog appears: *"Finalizing this record will lock it permanently and send the annual health report to the parent. Continue?"*
5. Click **"OK"**

**WHAT YOU SHOULD SEE:**
- Green **"Record Locked"** badge appears in the header
- The **"Edit"** button disappears — record is now read-only
- Alert: "Record finalized successfully. Annual report sent to parent."

**POINT TO MENTION:** "Once the school year's checkup is complete, the admin finalizes the record. It gets locked — no one can edit it — and the annual health summary goes to the parent automatically."

---

### SCENE 2.11 — Student Identity Card

**FEATURE:** Token-based digital health ID card with QR code, shareable public link.

**WHAT TO DO:**

1. On Arjun Mehta's profile, look for the **"Identity Card"** button (or CreditCard icon in the top actions)
2. Click it — a new browser tab opens

**WHAT YOU SHOULD SEE:**
- A digital ID card with:
  - Arjun Mehta's name and initials avatar
  - Registration number
  - Class 10 - A
  - School name: Sunrise Public School
  - Blood group: B+
  - A QR code at the bottom
- URL looks like: `/card/abc123tokenXXXX`

3. Copy this URL → open in Window 2 (incognito)
   - It loads without any login — fully public token-based access

**POINT TO MENTION:** "The ID card URL is permanent. Parents can save it, print it, or show it in an emergency. The QR code on a physical ID card opens the same page."

---

### SCENE 2.12 — Bulk ID Card Export (PDF)

**FEATURE:** Export all student ID cards as a single PDF — for printing physical cards.

**WHAT TO DO:**

1. Go to **"Records"** tab (the student list)
2. Look for **"Export ID Cards"** or **"Bulk Export"** button
3. Optionally filter by Class: 10, Section: A
4. Click **"Export ID Cards (PDF)"**

**WHAT YOU SHOULD SEE:**
- A PDF downloads: `id-cards-bulk.pdf`
- Contains one ID card per page for every student in Class 10-A
- Each card has QR code and student details

**POINT TO MENTION:** "Print the entire class's ID cards in one click. The school prints them, laminates them, and students carry them. Any doctor or first responder can scan the QR."

---

### SCENE 2.13 — Wellness Attendance in Child Profile

**FEATURE:** Overview tab shows wellness program attendance cards — click to toggle a student's attendance status.

**WHAT TO DO:**

1. Go back to Arjun Mehta's profile
2. Click the **"Overview"** tab
3. Scroll down to the **"Wellness Overview"** section — 4 program cards: Immunization, Hygiene, Nutrition, Mental Wellness
4. Each card shows current status: Not Scheduled / Scheduled / Attended / Absent
5. Click on the **Immunization** card

**WHAT YOU SHOULD SEE:**
- Status toggles (Not Scheduled → Present, or Present → Absent, cycling)
- Color changes: green = Attended, blue = Scheduled, red = Absent, amber = Pending
- The card shows the last event date if available

**POINT TO MENTION:** "Teachers or nurses can update individual student attendance for each health program directly from the student profile."

---

### SCENE 2.14 — Activating Events: Two Paths

**FEATURE:** Two completely separate activation models for health programs — Direct Payment (annual pool) vs QR/Link (no pool at all).

**WHAT TO DO:**

1. Click **"Events"** in the sidebar
2. You see the **"Activate Health Programs"** locked screen with TWO cards side by side

> **EXPLAIN BEFORE CLICKING:**
> "There are two business models. Direct Payment — the school pays ₹50,000 and their annual event calendar unlocks. QR/Link — the school generates a shareable invite link, parents self-register via OTP, the calendar unlocks immediately with no payment and no annual pool."

---

#### PATH A — Direct Payment

3. Click **"Pay ₹50,000"** on the left card
4. Razorpay test card: `4111 1111 1111 1111` | Expiry: `12/26` | CVV: `123`
5. Complete payment

**WHAT YOU SHOULD SEE:**
- Locked screen disappears
- 7 program cards appear: Health Checkup, Mental Wellness, Nutrition Session, Fire Drill, CPR Training, Hygiene & Wellness, Immunization & Deworming
- Credit pool indicator shows 100% (green)

6. Click **"+ Schedule"** on **"Annual Health Check-up"**
7. Pick a date 2 weeks from today → click **Schedule**

**WHAT YOU SHOULD SEE:**
- Event listed with status "Scheduled" and the chosen date
- Calendar view shows the event on that date

---

#### PATH B — QR / Link (No Pool, No Payment)

*(Show on a different/fresh school or explain while pointing at the right card)*

3. Click **"Generate QR & Link"** on the right card

**WHAT YOU SHOULD SEE:**
- A unique invite link appears instantly: `http://localhost:5173/join/abc123...`
- "Copy Link" button below it
- The calendar **immediately unlocks** — no payment, no pool, no goal
- All 7 program cards are schedulable

4. Copy the link → open in Window 2 (incognito)

**WHAT YOU SHOULD SEE (incognito — Parent Join page):**
- Clean landing page: school name, type, board, principal, city, UDISE
- Blue info box: "Your school has invited you to register on the WombTo18 Parent Portal"
- Large CTA button: **"Register / Login via OTP"**

**POINT TO MENTION:** "No pool, no ₹50,000, no contribution tracking in QR mode. The school just shares the link — WhatsApp group, notice board, email — and each parent clicks it and registers with their mobile number."

---

### SCENE 2.15 — UDISE Report

**FEATURE:** Auto-generated UDISE compliance report pre-filled from school registration data.

**WHAT TO DO:**

1. In the Dashboard sidebar, click **"UDISE Report"**
   *(or go to `/dashboard/udise-report`)*

**WHAT YOU SHOULD SEE:**
- Fields pre-filled:
  - School Name: Sunrise Public School
  - UDISE Code: 27150198765
  - State: Maharashtra | District: Pune
  - Board: CBSE | Type: Private | Strength: 620

2. Review the pre-filled data
3. Click **"Generate Report"**

**WHAT YOU SHOULD SEE:**
- A downloadable UDISE-format report with school and health statistics

**POINT TO MENTION:** "UDISE reports are mandatory for government compliance. Instead of filling them manually every year, the system pulls everything from the existing school profile."

---

---

# PART 3 — WOMBTO18 OPS JOURNEY
## "I am a WombTo18 internal staff member. I monitor all schools and approve event requests."

---

### SCENE 3.1 — WOMBTO18_OPS Login

**FEATURE:** Internal WombTo18 operations role — cross-school visibility, event request approvals, full access to Events/Ambassadors/Certifications/Records across every registered school.

**WHO YOU ARE:** Riya Kapoor, WombTo18 Operations staff.

**WHAT TO DO:**

1. Log out from any current session
2. Go to: `http://localhost:5173`
3. Login with a WOMBTO18_OPS account:
   - Email: `ops.wombto18.demo@gmail.com`
   - Password: `Ops@123`
   - OTP: check email or backend console

**WHAT YOU SHOULD SEE:**
- Dashboard loads showing stats across ALL registered schools (not just one school)
- Sidebar has more tabs than a school admin: **Dashboard, School Details, Events, Certifications, Ambassadors, Records, Available Schools, Requests**
- The "Requests" tab — exclusive to WOMBTO18_OPS — is visible

---

### SCENE 3.2 — WOMBTO18_OPS: Event Approval Requests

**FEATURE:** Schools can submit event requests (e.g., requesting an expert or ambassador for a health program). WOMBTO18_OPS staff review and approve/reject with official notes.

**WHAT TO DO:**

1. Click **"Requests"** in the sidebar
   *(This tab is invisible to all other roles)*

**WHAT YOU SHOULD SEE:**
- Page titled: **"Event Approval Requests"**
- Subtitle: "WOMBTO18 Officials monitor these requests to assign or approve event personnel."
- List of pending requests from schools (if any exist)
- Each request card shows:
  - School name
  - Event type requested
  - Contact person name and phone
  - Additional details
  - Status: Pending / Approved / Rejected

2. On a pending request, type in **Official Notes**: `Approved — Dr. Menon assigned for this event`
3. Click **"Approve"**

**WHAT YOU SHOULD SEE:**
- Request status updates to **"Approved"** (green badge)
- The school sees their request has been approved when they log in

4. On another request, click **"Reject"**
   - Add notes: `Capacity full for this date — please reschedule`

**WHAT YOU SHOULD SEE:**
- Status updates to **"Rejected"** (red badge)
- Official notes are stored and visible

**POINT TO MENTION:** "WombTo18 ops staff act as coordinators — schools don't just schedule events independently, they can formally request support (ambassadors, medical experts, equipment) and ops staff manage the logistics centrally."

---

### SCENE 3.3 — WOMBTO18_OPS: Cross-School Visibility

**FEATURE:** WOMBTO18_OPS can view records, events, certifications, and ambassadors for any registered school — not scoped to one school.

**WHAT TO DO:**

1. Click **"Available Schools"** in the sidebar
   - Sees all registered schools (same view as the Partner's Discover Schools)

2. Click **"Records"** — sees students across all schools
   *(In contrast, a School Admin only sees their own school's students)*

3. Click **"Events"** — can schedule and manage events for any school

**POINT TO MENTION:** "The WombTo18 ops team has a bird's-eye view. They can step in to manage any school's events or records — useful for onboarding support or audit purposes."

---

---

# PART 4 — DISTRICT VIEWER JOURNEY
## "I am a government/district official. I have read-only access to health statistics across all schools in the district."

---

### SCENE 4.1 — District Viewer Login

**FEATURE:** DISTRICT_VIEWER role — read-only dashboard showing aggregated health data across all schools, specifically designed for government oversight.

**WHO YOU ARE:** Mr. Ashok Rane, District Education Officer, Pune.

**WHAT TO DO:**

1. Log out from the ops account
2. Login with a DISTRICT_VIEWER account:
   - Email: `district.viewer.demo@gmail.com`
   - Password: `District@123`
   - OTP: check email or console

**WHAT YOU SHOULD SEE:**
- Dashboard loads with a **District Overview** table — completely different from the school admin view
- Sidebar shows: **Dashboard, School Details, Records** (read-only tabs only)
- No Events, Staff, Certifications, Ambassadors tabs — no write access at all

---

### SCENE 4.2 — District Viewer: District Overview Table

**FEATURE:** Aggregated district-level health report — all schools in one table with key metrics.

**WHAT YOU SHOULD SEE:**

A table with one row per school (only schools with ≥ 10 students), showing:

| Column | Example |
|---|---|
| School | Sunrise Public School |
| Location | Pune, Maharashtra |
| Students | 620 |
| Coverage | 72% (446/620) |
| Drill Completion | 85% (5/6) |
| High-risk Flags | No major flags / or list of flags |

**POINT TO MENTION:** "District officials don't need to log into each school individually — they see a consolidated district health report in one table. Coverage %, drill completion, and any high-risk health flags all in one place. This is the government compliance dashboard."

---

---

# PART 5 — CLASS TEACHER JOURNEY
## "I am a Class Teacher. I log in and see only my assigned class."

---

### SCENE 5.1 — Class Teacher Login (Restricted Dashboard)

**FEATURE:** Role-based access control — Class Teachers see only their class. No irrelevant tabs, no class/section filter dropdowns.

**WHO YOU ARE:** Ms. Kavita Desai, Class Teacher of Class 10-A.

**WHAT TO DO:**

1. Log out from admin (Logout button in sidebar)
2. Go to: `http://localhost:5173`
3. Login:
   - Email: `kavita.teacher.demo@gmail.com`
   - Password: `Teacher@123`
   - OTP: check email or backend console

**WHAT YOU SHOULD SEE — KEY DIFFERENCES from Admin:**
- Sidebar shows: Dashboard, School Details, Records only
- **No tabs for:** Events, Staff, Ambassadors, Certifications
- **No class/section dropdown** — instead a fixed blue badge: **"Class 10 – Section A"**
- Dashboard stats show ONLY Class 10-A data (2 students)

**POINT TO MENTION:** "The system enforces class restriction at both frontend and backend. A Class Teacher literally cannot access another class's data — even with a direct URL."

---

### SCENE 5.2 — Class Teacher Views and Edits a Record

**WHAT TO DO:**

1. Click **"Records"** — only Arjun Mehta and Priya Nair are visible
2. Click on **Arjun Mehta**
   - Can view the full profile, health metrics, history, edit log
3. Since Arjun's record is now **finalized/locked** → the Edit button is hidden
4. Click on **Priya Nair** → Edit button IS available (no record finalized yet)
5. Click **"Edit"** → can update Priya's health data

**POINT TO MENTION:** "Class Teachers have edit access to their students' health data — but finalized records are locked for everyone."

---

---

# PART 6 — PARENT JOURNEY
## "I am a parent. I received a link from the school. I want to see my child's health profile."

---

### SCENE 4.1 — Parent Arrives via QR/Invite Link

**FEATURE:** Parent Join landing page — school info shown before registration, no login required.

**WHAT TO DO:**

1. Switch to **Window 2 (incognito)**
2. Open the invite link generated in Scene 2.14 Path B:
   `http://localhost:5173/join/<token>`

**WHAT YOU SHOULD SEE:**
- School card: Sunrise Public School — Private • CBSE
- Principal: Dr. Anita Sharma
- Location: 45 Prabhat Road, Pune, Maharashtra
- UDISE: 27150198765
- Blue info box explaining the Parent Portal
- Button: **"Register / Login via OTP"**

3. Click **"Register / Login via OTP"**
   - Navigates to `/parent-login`

---

### SCENE 4.2 — Parent Logs In via OTP

**FEATURE:** Parent OTP login using registered mobile number — no password, phone-based identity.

**WHO YOU ARE:** Suresh Mehta, father of Arjun Mehta.

**WHAT TO DO:**

1. On the Parent Login page, enter mobile: **9312350305**
   *(This is Arjun's father's number entered during registration)*
2. Click **"Send OTP"**
3. Check backend console: `[SMS] To 9312350305: Your WombTo18 verification code is XXXXXX`
4. Enter the OTP → click **"Verify"**

**WHAT YOU SHOULD SEE:**
- Child selection screen: **Arjun Mehta — Class 10-A — Sunrise Public School**
- (If a parent has multiple children at the school, all would appear here)
- Click on Arjun's card

---

### SCENE 4.3 — Parent Dashboard: Health Status Tab

**FEATURE:** Parent's view of child's health data — visual, jargon-free, actionable.

**WHAT YOU SHOULD SEE:**
- Health Radar chart: BMI, Vision, Dental, Hygiene, Growth
- BMI card: **20.6 — Normal**
- Latest Eye reading: L 6/6, R 6/9
- Dental: Healthy
- Any referral alerts (none here — all "No")
- Finalized record badge: **"Annual Record Locked"** (since we finalized in Scene 2.10)

**POINT TO MENTION:** "Parents see a visual health summary of their child — no medical jargon. Red alerts appear for referrals. Everything in plain language."

---

### SCENE 4.4 — Parent Dashboard: Safety & Programs Tab

**FEATURE:** Parent sees all scheduled health programs at the school and their child's attendance status.

**WHAT TO DO:**

1. Click **"Safety & Programs"** tab

**WHAT YOU SHOULD SEE:**
- The Annual Health Check-up event we scheduled: date, type, status
- Attendance status for Arjun (whatever was toggled in Scene 2.13)
- Other programs listed with "Not Scheduled" / "Scheduled" / "Attended" / "Absent" status

**POINT TO MENTION:** "Parents know exactly what health programs are happening at school, on what dates, and whether their child attended."

---

### SCENE 4.5 — Parent Dashboard: Medical Reports Tab

**FEATURE:** Parent can request and download Arjun's health report. Access request workflow.

**WHAT TO DO:**

1. Click **"Medical Reports"** tab

**WHAT YOU SHOULD SEE:**
- Downloadable annual health report for 2024-2025 (since we finalized the record)
- An **"Request Access"** option if a third party (e.g., a doctor) needs access

**POINT TO MENTION:** "The annual report was automatically triggered when the school finalized the record. Parents download it for doctor visits, insurance claims, etc."

---

### SCENE 4.6 — Parent Dashboard: Access History Tab

**FEATURE:** Full audit trail — parent sees every time anyone accessed their child's health data.

**WHAT TO DO:**

1. Click **"Access History"** tab

**WHAT YOU SHOULD SEE:**
- Log entries like:
  - "Health record created by Dr. Anita Sharma (School Admin) — [date]"
  - "Health record updated by Dr. Anita Sharma — weight: 54 → 55 — [date]"
  - "Record finalized — Annual report generated — [date]"

**POINT TO MENTION:** "Complete transparency. Parents can see every single access event on their child's data. This is a legal-grade audit trail."

---

### SCENE 4.7 — Parent Dashboard: School Info Tab

**FEATURE:** Full school details visible to parents — same information as the school's own profile.

**WHAT TO DO:**

1. Click **"School Info"** tab

**WHAT YOU SHOULD SEE:**

**School Profile:**
- Sunrise Public School — Private • CBSE
- UDISE: 27150198765 | Academic Year: 2024-2025
- Students: 620 | Address: 45 Prabhat Road, Pune, Maharashtra

**Institutional Leadership:**
- Principal: Dr. Anita Sharma — 9876543210
- Vice Principal: Mr. Suresh Kulkarni — 9765432101

**Emergency Contacts:**
- Fire Department: Pune Fire Brigade — 101
- Police Station: Prabhat Road Police — 100
- NDRF Trainer: NDRF Unit 4 Pune — 9900112233

**Health Experts:**
- School Nurse: Ms. Priya Deshpande — 9988776655
- Gynecologist: Dr. Sunita Rao — 9876512340
- Pediatrician: Dr. Ravi Menon — 9123409876

**POINT TO MENTION:** "This tab is the single most important feature for parents in an emergency. They don't need to search for numbers — fire dept, police, ambulance, school nurse — all one tap away, directly from a school they trust."

---

---

# PART 7 — EMERGENCY ACCESS FLOW
## "A first responder or nurse needs emergency access to a student's health record without the parent being present."

---

### SCENE 5.1 — Emergency Access via QR Scan

**FEATURE:** Emergency health access — QR on student's ID card triggers a parent-approval flow. Health data shown only after parent approves.

**WHAT TO DO:**

1. In Window 2 (incognito), go to: `http://localhost:5173/emergency-access/<childId>`
   *(Replace `<childId>` with Arjun's numeric ID — visible in the URL when you open his profile)*

**WHAT YOU SHOULD SEE:**
- A screen titled: **"Emergency Health Access — WombTo18 — Secure Parent-Approved Access"**
- An approval request is sent to the parent's phone
- The screen shows: **"Waiting for Parent Approval"** — polls every 5 seconds

2. Switch to Window 1 → log in as parent (Suresh Mehta) → a notification appears asking to approve emergency access
3. Parent approves

**WHAT YOU SHOULD SEE (after approval):**
- The emergency screen updates to show Arjun's critical health data:
  - Blood group, allergies, doctor's name
  - Recent health readings

**POINT TO MENTION:** "No one can access a child's health data without the parent's real-time consent. Even in an emergency the parent is alerted and must approve. This is PDPA/DPDPA compliant by design."

---

---

# PART 8 — PUBLIC FEATURES (No Login Required)

---

### SCENE 6.1 — Health ID Card (Public Token Link)

**FEATURE:** Token-based public health ID card — works without any login. Anyone who has the link or scans the QR can view basic health info.

**WHAT TO DO:**

1. Open the ID card URL from Scene 2.11 in incognito:
   `http://localhost:5173/card/<token>`

**WHAT YOU SHOULD SEE:**
- Full health ID card for Arjun Mehta — no login required
- Name, class, school, blood group, registration number
- QR code

---

---

# PART 9 — QUICK SUMMARY TABLE

| # | Feature | Who | Where to Show |
|---|---|---|---|
| 1 | User registration (email + password) | School Admin | `/register` |
| 2 | School registration + partner referral tracking | School Admin | `/register-school?ref=PARTNER001` |
| 3 | State → District cascade + auto registration number | School Admin | Registration form |
| 4 | OTP two-factor login | School Admin | `/` login page |
| 5 | Dashboard overview stats + charts + class/section filter | School Admin | Dashboard tab |
| 6 | School details — leadership, emergency contacts, health experts | School Admin | School Details tab |
| 7 | Staff management — roles, class restrictions | School Admin | Staff tab |
| 8 | Ambassadors (Institutional Benefactors wall) | School Admin | Ambassadors tab |
| 9 | Certifications tracking | School Admin | Certifications tab |
| 10 | Student registration + auto ID number | School Admin | Records tab |
| 11 | Health record entry — BMI + Eye + Dental all visible | School/Nurse | Child Profile → New Session |
| 12 | BMI auto-calculation from height + weight | School/Nurse | Health record form |
| 13 | Wellness attendance cards — click to toggle | School/Nurse | Child Profile → Overview tab |
| 14 | Edit Log — who changed what and when | School Admin | Child Profile → Edit Log tab |
| 15 | Complete Record — lock + send annual report to parent | School Admin / Principal | Child Profile → Complete Record button |
| 16 | Health Radar chart + BMI gauge + Metric cards | Any role | Child Profile → Overview / Metrics tabs |
| 17 | Student Identity Card with QR (public link) | School Admin | Child Profile → Identity Card button |
| 18 | Bulk ID card export to PDF | School Admin | Records tab → Bulk Export |
| 19 | Events: Direct Payment (₹50k pool) — no pool in QR mode | School Admin | Events tab → locked state |
| 20 | Events: QR/Link — no pool, instant unlock, invite link | School Admin | Events tab → Generate QR |
| 21 | Parent Join landing page (no login, school info preview) | Public | `/join/:token` |
| 22 | Schedule + log attendance for health events | School Admin | Events tab |
| 23 | UDISE Report auto-fill + download | School Admin | Dashboard → UDISE Report |
| 24 | Class Teacher restricted view — class badge, no dropdowns | Class Teacher | Login as teacher |
| 25 | Class Teacher can only see their class at backend too | Class Teacher | Try accessing other class via URL |
| 26 | Partner login (email + password, no OTP) | Partner | `/partner-login` |
| 27 | Partner: Impact Overview + rank + invite link | Partner | Partner Dashboard → Home tab |
| 28 | Partner: Discover Schools + sponsor a school | Partner | Partner Dashboard → Discover Schools |
| 29 | Partner: Transaction History | Partner | Partner Dashboard → Transaction History |
| 30 | Partner: Event Invoices (PDF download) | Partner | Partner Dashboard → Event Invoices |
| 31 | Parent OTP login via mobile number | Parent | `/parent-login` |
| 32 | Parent child selection screen | Parent | After login |
| 33 | Parent: Health Status tab (radar, BMI, vitals) | Parent | Parent Dashboard |
| 34 | Parent: Safety & Programs tab (event schedule + attendance) | Parent | Parent Dashboard |
| 35 | Parent: Medical Reports + download annual report | Parent | Parent Dashboard |
| 36 | Parent: Access History (full audit trail) | Parent | Parent Dashboard |
| 37 | Parent: School Info tab (emergency contacts, experts) | Parent | Parent Dashboard |
| 38 | Emergency Access — QR scan → parent approval → health data | Public / Medical | `/emergency-access/:childId` |
| 39 | Health ID Card — public token link, no login | Public | `/card/:token` |
| 40 | WOMBTO18_OPS login — cross-school visibility, all tabs accessible | WOMBTO18_OPS | Login as ops user |
| 41 | Event Approval Requests — schools request support, ops approves/rejects with notes | WOMBTO18_OPS | Requests tab (ops-only) |
| 42 | DISTRICT_VIEWER login — read-only, district-level overview table | DISTRICT_VIEWER | Login as district viewer |
| 43 | District Overview table — all schools: coverage %, drill %, high-risk flags | DISTRICT_VIEWER | Dashboard tab |

---

## TEST DATA REFERENCE CARD

| Person | Role | Login | Credential |
|---|---|---|---|
| Dr. Anita Sharma | School Admin | sunrise.school.demo@gmail.com | Admin@123 + OTP on email |
| Ms. Kavita Desai | Class Teacher | kavita.teacher.demo@gmail.com | Teacher@123 + OTP |
| Ms. Priya Deshpande | Nurse/Counsellor | priya.nurse.demo@gmail.com | Nurse@123 + OTP |
| Rahul Bose | Partner | rahul.partner@wombto18.com | Partner@123 (no OTP) |
| Riya Kapoor | WOMBTO18 Ops | ops.wombto18.demo@gmail.com | Ops@123 + OTP |
| Mr. Ashok Rane | District Viewer | district.viewer.demo@gmail.com | District@123 + OTP |
| Suresh Mehta | Parent | Mobile: 9312350305 | OTP on SMS / backend console |
| Arjun Mehta | Student — Class 10-A | — | — |
| Priya Nair | Student — Class 10-A | — | — |

**Razorpay Test Card:** `4111 1111 1111 1111` | Expiry: `12/26` | CVV: `123`

**OTP not received via SMS?** Check the backend terminal — OTP is always printed:
`[SMS] To 9312350305: Your WombTo18 verification code is 482910`

---

*Total demo time estimate: 60–75 minutes for full walkthrough. 25–30 minutes for highlights-only run (skip WOMBTO18_OPS, District Viewer, and Emergency Access scenes).*
