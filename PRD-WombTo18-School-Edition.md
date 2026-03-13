# WombTo18 School Edition – Product Requirements Document

**Product:** Product 3 – WombTo18 School Edition (B2B)  
**Target:** Schools (K-12)

**Overview:** B2B offering for K-12 institutions covering preventive health programs, emergency preparedness training, a school master dashboard, and parent dual access.

---

## 1. Objectives & Constraints

**Success metrics:** % students with completed annual checkups; reduction in emergency response time; dashboard adoption rate; parent activation rate; NPS from schools/parents.

**School segmentation:** K-5 vs 6-8 vs 9-12; urban vs rural; low-tech vs high-tech. Delivery adapts accordingly (in-person vs digital-heavy).

**Regulatory & compliance:** Child data privacy; clinical data storage; parental consent; MoUs with education boards.

---

## 2. Module A: Preventive Health Programs

### 2.1 Program Scope

| Activity | Description |
|----------|-------------|
| Annual general health check-ups | Vitals, growth charts, common conditions flagging |
| Dental screening | Caries index, hygiene score, referral thresholds |
| Vision screening | Visual acuity thresholds, color blindness, referral rules |
| BMI measurement & obesity assessment | WHO/ICMR percentile charts, risk classification, counselling triggers |
| Nutrition awareness sessions | Decks and handouts for students, teachers, parents |
| HPV awareness (girls 9–14) | Age-appropriate content; consent templates for parents if vaccination referred |
| Expert sessions (annual) | Cybercrime awareness; POSH; Emergency preparedness |

### 2.2 Program Structure

- **Annual calendar:** General check-ups, dental, vision, BMI/obesity, nutrition, HPV, expert sessions scheduled across the year.
- **Age-banded protocols:** K-5, 6–8, 9–12 for each screening and awareness session.
- **Content kits:** Scripts, slides, videos, FAQs for expert sessions.

### 2.3 Operational Playbooks

- School visit SOPs: pre-visit communication, on-site flow (class-wise batches), post-visit reporting.
- Capacity planning: students/hour per health professional, equipment needs, scheduling heuristics.

---

## 3. Module B: Emergency Preparedness Training

### 3.1 Drills (Annual)

| Drill | Conducted By |
|-------|--------------|
| Fire safety | Fire department |
| Blackout protocol | School staff + ambassadors |
| Bunker preparedness | School staff + ambassadors |
| CPR training | Certified trainers |
| First-aid training | Certified trainers |

### 3.2 Protocols & Partnerships

- **SOPs:** Clear procedures for each drill; checklists and evaluation rubrics for teachers and safety auditors.
- **MoUs:** Fire department, police, NDRF, certified CPR/first-aid trainers.
- **Role boundaries:** When official ambassadors lead vs when school staff run refreshers.
- **AmbassadorDirectory:** Fire dept, police, NDRF, health partners – contact info and service areas.

### 3.3 Scheduling & Certification

- Annual drill schedule (e.g., 1 per quarter); minimum participation criteria by grade.
- Digital certificates/badges for schools; optionally for students/teachers.

---

## 4. Module C: School Master Dashboard

### 4.1 User Roles & Access

| Role | View health data | Edit health data | Schedule events | Export reports | Manage ambassadors |
|------|------------------|------------------|-----------------|----------------|---------------------|
| School Admin | Yes | Yes | Yes | Yes | Yes |
| Principal | Yes | Yes | Yes | Yes | Yes |
| Class Teacher | Own class | No | No | Own class | No |
| School Nurse/Counsellor | Yes | Yes | No | Yes | No |
| District/Board Viewer | Aggregate | No | No | Yes | No |
| WombTo18 Ops | Yes | Yes | Yes | Yes | Yes |

### 4.2 Data Model

| Entity | Contents |
|--------|----------|
| **Student** | Demographics, UDISE ID, class/section, parent contacts |
| **HealthRecord** | Per-student, per-event: check-ups, screenings, BMI, notes, referrals |
| **Event** | Checkups, screenings, drills, expert sessions; attendance and outcomes |
| **AmbassadorDirectory** | Fire dept, police, NDRF, health partners; contact info, service areas |
| **Certification** | UDISE certification data, school-level compliance status |

### 4.3 Dashboard Features

| Feature | Description |
|---------|-------------|
| All student health records | Student profile + HealthRecord; per-event tracking |
| Health check-up results | Schedule, assign classes, track completion, view aggregate results; export PDFs/CSVs by class, time window, health domain |
| Safety drill participation logs | Log drills, participation metrics, ambassador validation; Event model |
| Ambassador contact directory | Fire, police, NDRF, health partners; contact and service area info |
| UDISE certification data | Compliance status, certification records |

**Overview screen:** School-level health snapshot (coverage, alerts, upcoming events, overdue screenings), safety drill completion, certification status, filters for high-risk flags.

### 4.4 School Details (Normal View Only)

**Purpose:** Read-only view of school registration information. No edit controls.

**Fields:** School name, UDISE+ Code, school type, board affiliation, principal name and contact, school email, total student strength, full address (state, city, pincode), point of contact (if different), registration number (e.g. SCH-WB-20250805-000056), academic year, channel (Direct / Healthcare Partner / CSR).

**Layout:** Single- or two-column; labels and values; no forms. Placement: "School Profile" or "School Details" tab, or top summary block.

**Access:** School Admin, Principal, optionally Class Teachers and District/Board. Not visible to parents.

---

## 5. Module D: Parent Dual Access

### 5.1 Access & Onboarding

- **Identity flow:** Link via student + school + phone/email; OTP verification.
- **Invitation:** Printed QR on report, SMS invite, or school app integration.

### 5.2 Core Features

| Feature | Description |
|---------|-------------|
| View child's health records | Health records and drill participation; current and past academic years |
| Notifications | Upcoming checkups; completed screenings; abnormal findings; recommended referrals; drills completed |
| Download reports | Medical and safety reports as PDFs for doctor consultations or documentation |

### 5.3 Safety & Communication Guardrails

- No direct messaging with clinicians without structured channels.
- In-app explanation of what the data means and when to seek medical follow-up.

### 5.4 Child QR ID Card Download

**Purpose:** Printable ID card with QR; scan opens child's health ID card (portable medical card).

**QR generation:** Unique, persistent QR per student; URL with secure token (e.g. `wombto18.in/card/[token]`). Token long and non-guessable.

**ID card layout (PDF/image):** Student name and photo; WombTo18 ID; class, section, school; QR (central, large enough to scan); academic year; optional school logo.

**Scan behavior:** Opens health ID card view – student info, health summary (BMI category, last check-up, immunization status, allergies), emergency contact.

**Access control (TBD with manager):**
- Option A (token-based): Anyone with physical card can view; no login.
- Option B (login-gated): Scan → login → card shown.

**Download locations:** School dashboard (per student + bulk); Parent dashboard ("My Child" section); optional email/SMS link after registration.

---

## 6. Feature Placement Reference

| Feature | Module | Location |
|---------|--------|----------|
| Child QR ID Card Download | School + Parent Dashboard | School: Student row "Download ID Card" / bulk. Parent: "My Child" download button |
| School Details (Normal View) | School Dashboard | "School Profile" / "School Details" tab or top block |

---

## 7. Open Points for Manager

- **QR access control:** Token-based (Option A) vs login-gated (Option B). Option A is faster for emergencies; Option B is more secure if card is lost.

---

## 8. Acceptance Criteria

**Preventive Health (A):**
- [ ] Annual calendar and age-banded protocols defined for all screenings and sessions
- [ ] Clinical forms and content kits ready
- [ ] Operational SOPs and capacity model documented

**Emergency Preparedness (B):**
- [ ] SOPs and checklists for all drills
- [ ] MoUs with fire, police, NDRF, CPR/first-aid trainers
- [ ] AmbassadorDirectory populated; digital certificates available

**School Dashboard (C):**
- [ ] All roles and access scopes implemented
- [ ] Student, HealthRecord, Event, AmbassadorDirectory, Certification models in place
- [ ] Overview, health check-up flow, drill log flow, reporting working
- [ ] School Details read-only view with all fields

**Parent Access (D):**
- [ ] Parent identity and OTP flow working
- [ ] View records, notifications, download reports functional
- [ ] Safety guardrails and in-app explanations in place

**Child QR ID Card:**
- [ ] Unique QR per student; downloadable PDF from School and Parent dashboards
- [ ] Scan resolves to health ID card; access control per chosen option

**School Details:**
- [ ] All registration fields in read-only view; no edit controls
- [ ] Access restricted to allowed roles; parents excluded
