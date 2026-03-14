# WombTo18 School Edition – Detailed User Flow Document

> Written from the user's perspective. Describes exactly what a user sees, what they do, what happens next, and what errors they may encounter at every step.

---

## Who uses this app

| Who | Their role | How they log in |
|-----|-----------|----------------|
| School Admin / Principal | Manages the entire school's health and safety data | Email + password |
| Class Teacher | Views their class's health records; exports class reports | Email + password |
| Nurse / Counsellor | Adds and edits student health records | Email + password |
| District / Board Viewer | Views aggregated health data across multiple schools | Email + password |
| WombTo18 Ops Staff | Full platform access; manages all schools | Email + password |
| Parent / Guardian | Views their child's health data, downloads reports, manages emergency access | Mobile phone + OTP |
| Emergency Responder | Third party (doctor, ambulance) who scans a child's QR card to request health info | No account needed |
| General Public | Anyone with a child's QR card URL | No account needed |

---

## Flow 1 – School Admin: First-Time Setup

### What the user wants to do
A school principal or admin is setting up their school on the platform for the first time.

---

### Step 1.1 – Landing on the app

**What the user sees:**  
A sign-in page with two fields: Email and Password, a **Sign In to Dashboard** button, and a **Register School** link below it.

**What the user does:**  
They notice they don't have an account yet, so they click **Register School**.

---

### Step 1.2 – Creating an account

**What the user sees:**  
A registration form with: Full name, Email address, Password, Confirm Password.

**What the user does:**  
- Fills in their name (e.g. "Priya Sharma")
- Enters their school email (e.g. "priya@dpsdelhi.edu.in")
- Sets a strong password and confirms it
- Clicks **Create Account**

**What happens:**  
- The system creates their user account
- They are redirected to the **Login** page
- A success message appears: "Account created. Please sign in."

**If something goes wrong:**
- If the email is already registered → toast error: "An account with this email already exists."
- If passwords don't match → inline error below the confirm password field
- If any required field is empty → the field is highlighted in red

---

### Step 1.3 – Logging in for the first time

**What the user sees:**  
The sign-in page again.

**What the user does:**  
Enters their email and password, clicks **Sign In to Dashboard**.

**What happens:**  
- A loading spinner appears briefly
- The system authenticates them, returns a JWT token, and stores it in the browser
- They are redirected to `/dashboard`

**What they see next:**  
A prompt or empty dashboard that says something like "No school registered yet – set up your school to get started." with a link to register their school.

**If credentials are wrong:**  
Toast error: "Invalid email or password."

---

### Step 1.4 – Registering the school

**What the user sees:**  
The school registration form at `/register-school` with the following fields:

| Field | Example |
|-------|---------|
| School name | Delhi Public School, Dwarka |
| UDISE+ Code | 07220300101 |
| School type | Government / Private / Aided |
| Board affiliation | CBSE / ICSE / State Board |
| Principal name | Dr. Suresh Nair |
| Principal contact | +91 98100 00000 |
| School email | admin@dpsdelhi.edu.in |
| Total student strength | 1200 |
| State / City / Pincode | Delhi / New Delhi / 110075 |
| Full address | Sector 10, Dwarka, New Delhi |
| Point of contact (optional) | Ms. Anjali Singh |
| Academic year | 2024-2025 |
| Registration channel | Direct / Healthcare Partner / CSR |

**What the user does:**  
Fills in all fields carefully (UDISE+ is important for compliance), then clicks **Complete Registration**.

**What happens:**  
- The school is created and linked to their account
- They are redirected to the full **Dashboard**
- Their role ("Admin") is shown in the header

**If UDISE+ code is already registered:**  
Toast error: "This UDISE+ code is already registered on the platform."

---

## Flow 2 – School Admin: Day-to-Day Dashboard Use

### What the user wants to do
The admin logs in on a typical working day to check on their school's health program status.

---

### Step 2.1 – Viewing the Dashboard

**What the user sees after logging in:**  
The dashboard opens with a set of summary cards:

- **Checkup Coverage** – e.g. "68% (816 / 1200 students have at least one checkup this year)"
- **Drill Completion** – e.g. "3 / 5 drill types completed this academic year"
- **Active Certifications** – e.g. "2 active, 1 pending renewal"
- **High-risk Flags** – e.g. "14% dental prevalence · 8% vision referrals · 3 students with obesity flag"
- **Upcoming Events** – e.g. "Annual Vision Checkup – Class 6–8 · Scheduled 15 Feb 2025"

**What the user does:**  
They scan the cards to get a quick read on school health status. If they see a flag they want to investigate, they click into it.

---

### Step 2.2 – Viewing School Details

**What the user sees:**  
A **School Details** tab or section in the sidebar.

**What they do:**  
Click on **School Details**.

**What they see:**  
A clean, read-only layout showing all the fields that were entered during registration. No edit controls are visible. Fields are displayed as label–value pairs (e.g. "UDISE+ Code: 07220300101").

**Why this matters to the user:**  
They can quickly share or confirm registration details with WombTo18 ops or a district auditor without navigating away.

---

## Flow 3 – School Admin: Managing Student Records

### Step 3.1 – Opening the Records section

**What the user does:**  
Clicks **Records** in the sidebar.

**What they see:**  
A list of all registered students. Each row shows:
- Student name
- Class and section (e.g. "7-B")
- Contact info (parent phone)
- Last health record date (or "No records yet")
- Buttons: **View Profile**, **ID Card**

A **search bar** at the top lets them search by name or class. There may also be a class / section filter dropdown.

---

### Step 3.2 – Adding a new student

**What they do:**  
Click **Add New Student** (a button at the top of the records list).

**What they see:**  
A modal or form with:

| Field | Notes |
|-------|-------|
| First name, Last name | Required |
| Class (1–12) | Required |
| Section (A, B, C…) | Required |
| Gender | Required |
| Date of birth | Optional |
| Father's phone | Used for parent login |
| Mother's phone | Used for parent login |
| State | Used for age-band and protocol alignment |
| Blood group | Optional |
| Known allergies | Optional |

**What they do:**  
Fill in the form and click **Register Record**.

**What happens:**  
- A loading spinner appears briefly
- The new student appears at the top of the list
- A toast notification: "Student registered successfully."

**If a required field is missing:**  
The form highlights the empty field and does not submit.

---

### Step 3.3 – Opening a student's profile

**What they do:**  
Click **View Profile** on a student row (or click the student's name).

**What they see:**  
The **Child Profile** page, which has:
- Student details card at the top (name, class, section, contacts, blood group, allergies)
- A note about recommended screenings based on grade band (e.g. "Class 7–8: Recommended – Annual Check-up, Vision Screening, Dental Screening, BMI Assessment")
- A **View / Download ID Card** button
- A list of health records, sorted newest first
- A **+ New Health Entry** button

---

### Step 3.4 – Adding a health record

**What they do:**  
Click **+ New Health Entry** on the Child Profile page.

**What they see:**  
A form organised by section:

**Vitals**
- Height (cm), Weight (kg) → BMI is auto-calculated and shown
- Notes

**Dental Screening**
- Caries index, Hygiene score
- Referral needed (yes/no)
- Notes

**Vision Screening**
- Left eye acuity, Right eye acuity
- Colour blindness test result
- Referral needed (yes/no)
- Notes

**Immunization**
- Status (up to date / incomplete / not assessed)
- Vaccines given this year (free text)

**Mental Wellness**
- Score or observation (free text)
- Counselling recommended (yes/no)

**Nutrition**
- Session attended (yes/no)
- Notes

**Menstrual Hygiene** *(shown for girls)*
- Session attended (yes/no)
- Notes

**Upload lab report** (optional PDF / image)

**Academic year** (which year this record belongs to)

**What they do:**  
Fill in the relevant sections (they don't need to fill everything) and click **Save Health Record**.

**What happens:**  
- A loading spinner while the data is saved
- Redirected back to the Child Profile page
- The new record appears at the top of the health records list
- Toast: "Health record saved."

**If the upload file is too large or in the wrong format:**  
Toast error: "Only PDF or image files up to 5 MB are accepted."

---

### Step 3.5 – Viewing a student's QR ID card

**Two entry points:**

**From Records list:**
The user clicks **ID Card** on a student row.

**From Child Profile:**
The user clicks **View / Download ID Card**.

**What happens:**  
A new browser tab opens at `/card/[token]`.

**What the user sees on the card page:**
- School name and logo at the top
- Student's full name (large text)
- WombTo18 registration ID
- Class, section, academic year
- Blood group, known allergies
- Emergency contact numbers (father/mother)
- Health summary: BMI category, last dental note, last vision note, immunization status
- A large, scannable QR code in the centre (the QR URL is the same page URL)
- A **Print ID Card** button at the bottom

**What they do to print:**  
Click **Print ID Card** → browser print dialog opens → they choose "Save as PDF" or send to a printer.

**Note:** The card is designed so the print layout hides the print button and any browser chrome, giving a clean printable card.

---

### Step 3.6 – Downloading all ID cards as a bulk PDF

**What they do:**  
Back on the Records page, click **Download All ID Cards**.

**What they see:**  
A small modal with optional filters:
- Class (leave blank for all)
- Section (leave blank for all)

Then a **Download PDF** button.

**What happens after clicking:**  
- A loading spinner (this takes a few seconds for large student counts)
- A multi-page PDF downloads to their device
- Each page contains one ID card, ready to print and cut

**If no students match the filter:**  
Toast error: "No students found for the selected class/section."

---

### Step 3.7 – Exporting a health report

**What they do:**  
On the Records page, click **Export Report**.

**What they see:**  
A modal with options:
- **Format:** CSV or PDF
- **Academic year:** dropdown (e.g. 2024-2025)
- **Class:** dropdown or blank for all
- **Section:** dropdown or blank for all
- **Health domain:** All / Vitals & BMI / Dental / Vision / Immunization / Mental Wellness / Nutrition

Then a **Download** button.

**What happens:**  
- The backend generates the file server-side
- The browser triggers a download with an appropriate filename (e.g. `health-report-2024-2025-class7.pdf`)
- Toast: "Report downloaded."

**CSV format:** Opens in Excel/Sheets; one row per student, one column per health metric.
**PDF format:** Formatted table with school header, generated date, and page numbers.

---

## Flow 4 – School Admin: Events and Drills

### Step 4.1 – Opening the Events section

**What they do:**  
Click **Events** in the sidebar.

**What they see:**  
A list of all scheduled events for the current academic year, sorted by date. Each event row shows:
- Event title and type (Annual Checkup, Fire Drill, Vision Screening, etc.)
- Scheduled date
- Academic year
- Completion status badge (Upcoming / Completed / Overdue)
- Buttons: **View details**, **Log attendance** (all event types), **Mark completed / incomplete**

---

### Step 4.2 – Scheduling a new event

**What they do:**  
Click **Add Event**.

**What they see:**  
A form with:

| Field | Notes |
|-------|-------|
| Event type | Dropdown – Annual Check-up, Dental Screening, Vision Screening, BMI Assessment, Nutrition Session, HPV Awareness, Fire Drill, Blackout Protocol, Bunker Preparedness, CPR Training, First Aid Training, Expert Session (Cybercrime), Expert Session (POSH), Expert Session (Emergency Preparedness) |
| Title | Free text (pre-filled based on type) |
| Academic year | Dropdown |
| Scheduled date | Date picker |
| Description | Optional free text |

**Dynamic help text below the event type:**  
Once they select a type, a note appears showing which grade bands it applies to:
- e.g. selecting "Vision Screening" shows: "Applicable grade bands: K–5, 6–8, 9–12 (all grades)"
- e.g. selecting "HPV Awareness" shows: "Applicable grade bands: 6–8, 9–12 (girls, age 9–14)"
- e.g. selecting "CPR Training" shows: "Applicable grade bands: 9–12"

**What they do:**  
Fill in the form and click **Create Event**.

**What happens:**  
- Event appears in the list
- Toast: "Event scheduled."

---

### Step 4.3 – Logging attendance

After an event (checkup, screening, drill, or program) has taken place:

**What they do:**  
Find the event in the Events list, click **Mark completed** if not already done, then click **Log attendance**.

**What they see:**  
A small form:
- Total students / staff present
- Total expected
- Notes (e.g. "Fire drill completed in 4 minutes 20 seconds. All students evacuated successfully.")

**What they do:**  
Fill in the numbers and notes, click **Save Attendance**.

**What happens:**  
- Attendance data saved
- The event card now shows "X / Y attended"
- Toast: "Attendance logged."

Attendance can be logged for any event type — checkups, screenings, drills, nutrition sessions, expert sessions, etc. — so the school can track how many students participated in each program.

---

### Step 4.4 – Marking an event complete

**What they do:**  
Click **Mark completed** on the event row.

**What happens:**  
- The status badge changes from "Upcoming" to "Completed"
- For drill types (fire, CPR, first aid, etc.), this counts towards the school's drill completion % on the Dashboard
- Once completed, the **Log attendance** button appears so they can record participation

To undo, they click **Mark incomplete** and the status reverts.

---

## Flow 5 – School Admin: Ambassadors

### Step 5.1 – Opening the Ambassadors section

**What they do:**  
Click **Ambassadors** in the sidebar.

**What they see:**  
A directory of partner organisations, organised by category:
- Fire Department
- Police
- NDRF
- Health Partners
- CPR / First Aid Trainers

Each entry shows: name, contact person, phone number, email, service area, last updated date.

---

### Step 5.2 – Adding an ambassador

**What they do:**  
Click **Add Ambassador** and fill in:
- Category (dropdown)
- Organisation name
- Contact person name
- Phone
- Email (optional)
- Service area (e.g. "South Delhi")
- Notes (optional)

Click **Save**.

**What happens:**  
The entry appears in the directory. Toast: "Ambassador added."

---

## Flow 6 – School Admin: Certifications

### Step 6.1 – Opening Certifications

**What they do:**  
Click **Certifications** in the sidebar.

**What they see:**  
Cards for each certification type:
- UDISE Certification
- Fire Safety Drill Certificate
- Annual Safety Certificate
- Health Program Certificate

Each card shows:
- Current status: PENDING / ACTIVE / EXPIRED / REVOKED
- Issue date
- Expiry date
- Issuing authority

---

### Step 6.2 – Adding a certification record

**What they do:**  
Click **Add Certification** on a card (or a general + button).

**What they see:**  
A form: certification type, issuing authority, issue date, expiry date, reference number, notes.

Click **Save**.

**What happens:**  
- Status updates based on dates (ACTIVE if current, EXPIRED if past expiry)
- Toast: "Certification added."

---

## Flow 7 – Class Teacher: Scoped Access

### What the teacher wants
A class teacher wants to check which of their students have completed health screenings this year.

**What they see after login:**  
The same dashboard, but only **Dashboard**, **School Details**, and **Records** are visible in the sidebar. Events, Ambassadors, and Certifications are hidden.

**In Records:**  
They see all students (not just their class), but they can only export reports for their own class. They cannot add or edit health records.

**Exporting a class report:**
1. Click **Export Report**
2. Select their class (e.g. Class 7) and section (e.g. B)
3. Choose CSV format
4. Click **Download**
5. A CSV downloads with health data for all Class 7-B students

---

## Flow 8 – Nurse / Counsellor: Adding Health Records

### What the nurse wants
The school nurse has just finished conducting a dental screening for Class 5-A and needs to enter the results.

**What they see after login:**  
**Dashboard** and **Records** are visible in the sidebar. Events, Ambassadors, and Certifications are hidden.

**What they do:**
1. Go to **Records**
2. Search for students in "Class 5-A" using the filter
3. For each student, click **View Profile**
4. Click **+ New Health Entry**
5. Fill in the Dental Screening section (caries index, hygiene score, referral flag)
6. Click **Save Health Record**
7. Repeat for next student

**Shortcut:** They can keep Records open in one tab and the profile in another to speed through students.

---

## Flow 9 – District Viewer: Aggregate Overview

### What the district officer wants
A district education officer wants to review health coverage across all schools in their district.

**What they see after login:**  
Only the **Dashboard** tab in the sidebar. School Details, Events, Ambassadors, Certifications, and Records are all hidden — District Viewer has no linked school and those sections are not relevant to their role.

The dashboard shows a **District Overview** table:

| School | City | Students | Coverage % | Drill % | Flags |
|--------|------|----------|-----------|--------|-------|
| DPS Dwarka | Delhi | 1200 | 68% | 60% | Dental 14% |
| Ryan International | Delhi | 980 | 72% | 80% | Vision 9% |
| … | | | | | |

Schools with fewer than 10 students are excluded from this view.

**What they can do:**
- Sort columns by coverage, drill completion, flags
- Export the district report as CSV or PDF

---

## Flow 10 – Parent: First-Time Login

### What the parent wants
A parent received a message from the school saying they can now view their child's health records on the WombTo18 portal.

---

### Step 10.1 – Navigating to the parent portal

**What they do:**  
Go to the URL provided by the school (e.g. `app.wombto18.in`) and look for the **Parent Login** link, or scan the QR printed on the child's report card.

**What they see:**  
A parent-specific login page (not the same as the school login). It says "Parent / Guardian Portal" and has a single field: **Mobile Number**.

---

### Step 10.2 – Entering their phone number

**What they do:**  
Type their registered mobile number (the number that was entered when the school added their child's record – either father's number or mother's number).

Click **Send OTP**.

**What happens:**  
- The system looks up whether any child record is linked to that number
- If found: an OTP is sent via SMS (6-digit code, valid for 10 minutes)
- If not found: toast error: "No student records found for this number. Contact your school."

**If no SMS provider is set up (development):**  
The OTP is displayed directly on screen for testing purposes.

---

### Step 10.3 – Entering the OTP

**What they see:**  
The page transitions to show a 6-digit OTP input field and a timer ("Code expires in 9:42").

**What they do:**  
Type the 6-digit code received by SMS. Click **Verify & Access**.

**What happens:**
- The system validates the OTP and checks it hasn't expired
- On success: a parent JWT is issued and stored in the browser
- They are redirected to the parent dashboard (or child selection screen if multiple children)

**If OTP is wrong:**  
Error: "Incorrect code. Please try again." (they can re-enter)

**If OTP has expired:**  
Error: "This code has expired. Please request a new one." + a **Resend OTP** link appears.

---

### Step 10.4 – Selecting a child (if multiple)

**What they see:**  
A "Select your child" screen listing the children linked to their phone number:
- Child name, class, section, school name

**What they do:**  
Click on their child's name.

**What happens:**  
They are taken to the parent dashboard for that child.

---

## Flow 11 – Parent: Using the Parent Dashboard

### Step 11.1 – Dashboard home

**What the parent sees:**  
At the top, any notifications appear:

| Notification type | Example message |
|-------------------|----------------|
| Upcoming event | "Annual dental checkup scheduled for 20 Feb 2025 at your child's school." |
| Referral | "Arjun's last dental screening recommended a dental consultation. Please visit a dentist." |
| Abnormal BMI | "Arjun's BMI puts him in the 'At Risk' category. Please consult your paediatrician." |

Below notifications, three tabs: **Health**, **Safety & Programs**, **Medical Reports**.

---

### Step 11.2 – Health tab

**What they see:**

**Current Vitals card:**
- Height: 142 cm | Weight: 38 kg | BMI: 18.8 | Category: Normal

**Latest Screenings card:**
- Dental: Caries index 1.2 / Hygiene score 3 / No referral needed
- Vision: Right eye 6/6 / Left eye 6/9 / Referral: Yes

**BMI Trend chart:**
A line chart showing BMI across academic years (e.g. 2022-23: 16.2, 2023-24: 17.5, 2024-25: 18.8).

---

### Step 11.3 – Safety & Programs tab

**What they see:**

**Program Participation** (for the current academic year):

| Program | Status |
|---------|--------|
| Immunization | Up to date |
| Nutrition awareness session | Attended |
| Mental wellness check | Assessed – no concerns |
| Menstrual hygiene session | N/A (male student) |

**Upcoming school events:**
- Vision Screening Camp – 15 Feb 2025
- Fire Safety Drill – 10 Mar 2025

---

### Step 11.4 – Medical Reports tab

**What they see:**  
A list of all health records, each showing:
- Academic year
- Record date
- A brief summary (e.g. "BMI: Normal · Dental: No referral · Vision: Referral recommended")
- A **Download PDF** button if a lab report was uploaded by the school

**Download ID Card section:**
A button: **Download Child's Health ID Card**

**Emergency Health ID section:**
A large QR code. Below it: "This QR can be shown to emergency responders to request access to your child's health data."

**Access Requests section:**
If any emergency responder has scanned the QR and requested access, their request appears here with:
- Requester name, role, phone
- Reason for access
- Time of request
- **Approve** and **Deny** buttons

---

### Step 11.5 – Downloading a lab report

**What they do:**  
Find a health record with a PDF icon and click **Download PDF**.

**What happens:**  
The browser downloads the uploaded lab report file (PDF/image) that the nurse previously uploaded.

---

### Step 11.6 – Downloading the child's ID card

**What they do:**  
Click **Download Child's Health ID Card**.

**What happens:**  
A new browser tab opens showing the same QR health ID card the school admin sees (the `/card/:token` page).

**What they see:**  
Name, school, class, blood group, allergies, emergency contacts, health summary, and the large QR code.

**What they do to save it:**  
Click **Print ID Card** and save as PDF, or print to paper.

---

### Step 11.7 – Handling an emergency access request

**What happens first:**  
A notification or badge appears on the Medical Reports tab indicating a new access request.

**What they see when they open the tab:**  
Under "Access Requests":
> **Dr. Ramesh Kumar** – Doctor  
> Reason: "Student brought to emergency ward, need vaccination status and allergies"  
> Phone: +91 98765 43210  
> Requested: 2 minutes ago  
> [Approve] [Deny]

**What they do:**  
They verify this looks legitimate (the school/hospital likely called them too), then click **Approve**.

**What happens:**  
A 24-hour access token is created. Dr. Kumar's browser (where he scanned the QR) automatically refreshes to show the child's limited health data.

If they click **Deny**, the request is closed and Dr. Kumar's screen shows "Access was not approved."

---

## Flow 12 – Emergency Responder: QR Scan

### What the responder wants
A doctor in an emergency ward needs to quickly find out a child's blood group, allergies, and immunization status. The child is unconscious. The child's ID card is in their school bag.

---

### Step 12.1 – Scanning the QR

**What they do:**  
Scan the QR code on the physical ID card with their phone camera or QR scanner.

**What they see:**  
A simple web page opens (no app needed). It asks them to fill in a short form:
- Your name
- Your phone number
- Your role (Doctor / Nurse / Paramedic / Police / Fire / Other)
- Reason for requesting access

A **Request Access** button.

---

### Step 12.2 – Submitting the request

**What they do:**  
Fill in the form and click **Request Access**.

**What they see:**  
"Your request has been sent to the child's parent/guardian. Please wait for approval. This page will refresh automatically."

---

### Step 12.3 – Waiting for approval

The page polls every few seconds. The parent receives a push notification or sees the request the next time they open the app.

**Once parent approves:**  
The page refreshes and shows a limited health summary:
- Name, class, school
- Blood group
- Known allergies
- Immunization status
- Last dental and vision notes
- Emergency contacts

This access is valid for 24 hours from approval time.

---

## Flow 13 – Anyone: Viewing a QR Health ID Card

### What the viewer wants
A teacher or school nurse picks up a child's ID card that fell on the ground. They want to check whose it is and return it.

**What they do:**  
Scan the QR code on the card.

**What they see (no login required):**  
The public `/card/:token` page showing:
- Student's name and photo (if any)
- School name, class, section
- WombTo18 ID
- Blood group, allergies (critical info)
- Emergency contact numbers
- Last health check-up summary (BMI category, dental status, vision status, immunization status)
- A QR code (pointing back to this same page)

**What they cannot see:**  
Detailed clinical notes, lab report files, or any data that requires parent approval.

---

## Flow 14 – Partner / Sponsor (CSR)

### What the partner wants
A CSR officer at a company wants to sponsor health checkups at a school in their city.

---

### Step 14.1 – Logging in

**What they do:**  
Go to the app and log in with their email and password. Their account has the `PARTNER` role.

**What they see after login:**  
The dashboard sidebar shows three tabs:
- **Dashboard** (Impact Overview)
- **Browse Schools** (Discover Schools)
- **My Donations** (Transaction History)

---

### Step 14.2 – Impact Overview (home tab)

**What they see:**  
Three stat cards:
- **Total Contributions** – total ₹ donated so far, with a count of successful orders
- **Impact Standing** – their current tier: **Silver** (< ₹10,000), **Gold** (₹10,000–50,000), or **Platinum** (> ₹50,000)
- **Progression** – how much more is needed to reach the next tier, with a progress bar

Below the stats, two quick-action cards:
- **Find Schools** → takes them to Browse Schools
- **My Impact** → takes them to Transaction History

Below that, a motivational section: "Transforming Education through Wellness" with a **Continue Supporting** button, and a **Partner Progress** panel showing:
- Schools sponsored (count)
- Students impacted (total)
- Events funded (count)
- Active for X days

---

### Step 14.3 – Browsing schools to sponsor

**What they do:**  
Click **Browse Schools** in the sidebar (or the quick-action card).

**What they see:**  
A full-page grid of all registered schools. Each school card shows:
- School name, board affiliation (CBSE/ICSE/State/IB), city and state
- Total student strength
- Number of events scheduled
- Total amount already sponsored by all partners
- **View Health Stats** button
- **Sponsor This School** button

**Filters available:**
- **Search bar** – type school name to filter in real time
- **Board filter** – dropdown: All / CBSE / ICSE / State Board / IB

---

### Step 14.4 – Viewing a school's health stats

**What they do:**  
Click **View Health Stats** on a school card.

**What they see:**  
A modal showing a year-by-year breakdown of that school's health program execution:

| Domain | 2024-25 |
|--------|---------|
| General Check-up | ✓ 342 students checked, 0 referrals |
| Eye Screening | ✓ 310 checked, 28 referrals |
| Dental | ✓ 298 checked, 41 referrals |
| BMI Assessment | ✓ 342 assessed |
| Immunization | ✓ 310 recorded |
| Mental Wellness | ✓ 290 assessed |
| Nutrition | ✓ 270 attended session |
| Menstrual Wellness | ✓ 120 attended session |

**Why this matters to the partner:**  
They can see exactly which programs are active, how many students are being covered, and where the need is greatest — before they commit funds.

**What they do next:**  
Close the stats modal and click **Sponsor This School**.

---

### Step 14.5 – Configuring the sponsorship

**What they see:**  
A sponsorship configuration modal with:
- **School name** shown at the top (cannot be changed)
- **Donation type** dropdown: GENERAL / HEALTH_CHECKUP / EVENT / EQUIPMENT / SCHOLARSHIP
- **Number of students to sponsor** – a number input (minimum 1, maximum = school's total student strength)
- **Sponsor All Students** checkbox – toggling this auto-fills the student count with the school's total
- **Amount** – auto-calculated at **₹500 per student** (e.g. 100 students = ₹50,000). Read-only, updates as student count changes.
- **Specific event** – optional dropdown to link the donation to a particular scheduled event at that school
- **Description / message** – optional free text (e.g. "Wishing all students good health this year")

**What they do:**  
Set the number of students (e.g. 200), optionally add a message, then click **Proceed to Checkout**.

---

### Step 14.6 – Razorpay payment

**What happens:**  
- The backend creates a Razorpay order for the calculated amount (in paise)
- The **Razorpay checkout modal** appears over the page (WombTo18-branded, pink theme)
- The modal shows the amount, school name, and payment options (UPI, card, netbanking, wallet)

**What they do:**  
Complete payment via their preferred method.

**What happens on success:**
- Razorpay calls the success handler with `payment_id`, `order_id`, and `signature`
- The backend verifies and records the donation
- A success animation and confirmation message appear for 3 seconds
- All modals close automatically
- The school card refreshes to show the updated total sponsorship amount

**If they dismiss the Razorpay modal without paying:**  
The modal closes, the sponsorship is not recorded, and they return to the school grid.

---

### Step 14.7 – Transaction history

**What they do:**  
Click **My Donations** in the sidebar (or **Transaction History** tab).

**What they see:**  
A chronological list of all past donations, each showing:
- School name
- Date and time
- Amount (₹)
- Donation type
- Description / message (if any)
- Linked event name (if any)

---

### Step 14.8 – Institutional Benefactors (School's perspective)

When a school admin views their **Ambassadors** page, they also see an **Institutional Benefactors** section at the top. This section shows:
- Each partner who has donated to their school (grouped by partner name)
- Total amount contributed by that partner
- Any messages they left
- A "Platinum Supporter" badge (for display)

This is separate from the ambassador directory and is automatically populated whenever a partner sponsors that school through the payment flow.

---

## Error States Reference

| Situation | What the user sees |
|-----------|-------------------|
| Wrong email or password at login | Toast: "Invalid email or password." |
| Trying to register with an email already in use | Toast: "An account with this email already exists." |
| Parent entering a phone not linked to any student | Toast: "No student records found for this number. Contact your school." |
| Parent entering wrong OTP | Error inline: "Incorrect code. Please try again." |
| OTP expired (10 min window) | Error: "This code has expired." + Resend link |
| Trying to access a page without being logged in | Redirected to login page |
| Accessing a section the user's role doesn't allow | "You don't have permission to view this page." (403 message) |
| Uploading a file that is too large or wrong format | Toast: "Only PDF or image files up to 5 MB are accepted." |
| Bulk ID card export with no matching students | Toast: "No students found for the selected filters." |
| Health record save fails (network error) | Toast: "Failed to save. Please check your connection and try again." |
| QR card token not found (deleted student) | "This ID card link is no longer valid." |
| Emergency access request – parent denies | Responder sees: "Access was not approved by the parent/guardian." |
| School not yet registered after account creation | Dashboard shows a prompt to complete school registration |
| SMS not configured in production | OTP request fails; admin must set SMS_PROVIDER in backend .env |
| Razorpay SDK fails to load | Alert: "Razorpay SDK failed to load. Are you online?" |
| Razorpay order creation fails | Alert with backend error message; payment not initiated |
| Payment captured but backend record fails | Alert: "Payment captured but failed to update sponsorship record." |
| Partner tries to access school-only sections | Tabs not visible; role-based sidebar hides inaccessible pages |

---

## Screen-by-Screen Route Reference

| URL | Who sees it | What it is |
|-----|-------------|-----------|
| `/` | Everyone | Login page (school / partner) |
| `/register` | New users | Account registration |
| `/register-school` | Logged-in school users | School registration form |
| `/dashboard` | School users, Partners | Main dashboard (content varies by role) |
| `/child/:id` | School users | Individual child health profile |
| `/parent-login` | Parents | OTP login entry |
| `/parent/children` | Parents | Child selection (if multiple) |
| `/parent/dashboard/:childId` | Parents | Full parent dashboard |
| `/emergency-access/:childId` | Anyone | Emergency access request form |
| `/card/:token` | Anyone | Public QR health ID card |

**Dashboard tab routing by role:**

| Role | Tabs visible |
|------|-------------|
| School Admin / Principal | Dashboard, School Details, Events, Ambassadors, Certifications, Records |
| Class Teacher | Dashboard, School Details, Records |
| Nurse / Counsellor | Dashboard, Records |
| District Viewer | Dashboard only |
| WombTo18 Ops | All tabs |
| Partner | Dashboard (Impact), Browse Schools, My Donations |

---

*Last updated: March 2026. Update this document each time a new feature is shipped.*
