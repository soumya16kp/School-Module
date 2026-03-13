# WombTo18 School Edition – Module-wise implementation roadmap

Use this to implement the PRD one module at a time. Order is chosen so the dashboard and data model come first, then events/ambassadors, then parent access and QR card.

**Before starting:** Check [OPEN-QUESTIONS-TRACKER.md](./OPEN-QUESTIONS-TRACKER.md). Critical items (OQ-01, OQ-02, OQ-03) must be resolved before Sprint 1; other OQs are tied to Sprints 2–4.

---

## Implementation order

1. **Module C (School Master Dashboard)** – Core roles, data model, School Details, overview. Foundation for everything else.
2. **Module A (Preventive Health)** – Calendar, events, age bands, health flows. Builds on C.
3. **Module B (Emergency Preparedness)** – Drills, AmbassadorDirectory, certifications. Builds on C + Event model.
4. **Module D (Parent Dual Access)** – Parent identity, OTP, parent dashboard, notifications.
5. **Child QR ID Card** – QR generation, PDF, scan page. Uses Student + HealthRecord from C.

---

## Module C: School Master Dashboard

**Goal:** Roles, full data model, School Details read-only, overview and reporting.

### C.1 Data model (Backend)

- [ ] Add **Event** model: type (checkup / screening / drill / expert_session), title, date, academicYear, schoolId, assignedClass/section (optional), attendance/outcomes (JSON or relation), ambassadorId (optional). Link to School.
- [ ] Add **AmbassadorDirectory** model: type (fire / police / ndrf / health_partner), name, contact, email, serviceArea, schoolId (or global). Link to School if school-specific.
- [ ] Add **Certification** model: schoolId, type (udise / drill / etc.), status, issuedAt, metadata (JSON). Link to School.
- [ ] Extend **School** if needed: academicYear, channel (Direct / Healthcare Partner / CSR). Match PRD §4.4.
- [ ] Rename or alias: **Child** → **Student** in API/docs where PRD says “Student”; keep DB table as Child unless you want a migration rename.
- [ ] Ensure **HealthRecord** supports per-event linkage (e.g. eventId optional) and referrals/notes.

### C.2 Roles and access (Backend)

- [ ] Define roles: SCHOOL_ADMIN, PRINCIPAL, CLASS_TEACHER, NURSE_COUNSELLOR, DISTRICT_VIEWER, WOMBTO18_OPS.
- [ ] Add role (and optionally class/section) to **User**; ensure every protected route resolves user → role + school (and class if teacher).
- [ ] Implement permission checks per PRD table §4.1:
  - View health: all except District = full or own class; District = aggregate only.
  - Edit health: Admin, Principal, Nurse; not Class Teacher, District, Ops (or Ops yes per table).
  - Schedule events: Admin, Principal only (plus Ops).
  - Export reports: all except maybe restrict District to aggregate exports.
  - Manage ambassadors: Admin, Principal, Ops only.
- [ ] Middleware or helper: e.g. `requireRole(['SCHOOL_ADMIN','PRINCIPAL'])`, `requireViewHealth(schoolId, class?)`, etc.

### C.3 School Details read-only (PRD §4.4)

- [ ] Backend: GET `/api/schools/my-school` (or `/schools/:id`) returns all registration fields; no PATCH/PUT for “School Details” (or restrict to a separate “admin settings” area if you add one later).
- [ ] Frontend: “School Profile” or “School Details” tab/block – labels + values only, no form. Show: name, UDISE+ code, type, board, principal name/contact, school email, strength, address (state, city, pincode), POC (if different), registration number, academic year, channel. Access: School Admin, Principal, optionally Class Teacher, District/Board; hide from parents.

### C.4 Dashboard features (Frontend + API)

- [ ] **Overview screen:** Health snapshot (coverage %, alerts, upcoming events, overdue screenings), drill completion summary, certification status, high-risk filters. API: aggregated stats by school (and by class for teachers).
- [ ] **Student health records:** List/detail already partially there; ensure per-event tracking and link to Event where applicable.
- [ ] **Health check-up flow:** Schedule event (checkup/screening), assign classes, record completion, view by class/time/domain; export PDF/CSV (by class, time window, health domain). API: events CRUD, report generation (e.g. CSV export endpoint).
- [ ] **Ambassador directory:** List/search fire, police, NDRF, health partners with contact and service area. API: CRUD for AmbassadorDirectory (guarded by “manage ambassadors” permission).
- [ ] **UDISE certification:** Display certification status/records; optional CRUD for Certification. API: list/create/update Certification for school.

### C.5 Acceptance (Module C)

- [ ] All 6 roles and access scopes enforced.
- [ ] Student, HealthRecord, Event, AmbassadorDirectory, Certification in place and used.
- [ ] Overview, health check-up flow, drill log flow, reporting working.
- [ ] School Details read-only with all fields; access and “no edit” as per PRD.

---

## Module A: Preventive Health Programs

**Goal:** Annual calendar, age-banded protocols, health events and content support.

### A.1 Calendar and events

- [ ] **Annual calendar:** UI (and optionally API) to define/view schedule of general check-ups, dental, vision, BMI, nutrition, HPV, expert sessions across the year. Use **Event** model with types (e.g. `general_checkup`, `dental`, `vision`, `bmi`, `nutrition`, `hpv`, `expert_session`).
- [ ] **Age-banded protocols:** Config or table for which event types apply to K–5, 6–8, 9–12. Used when scheduling or showing relevant events per class/grade.

### A.2 Health content and forms

- [ ] **Clinical forms:** Ensure HealthRecord (and any event-specific payload) supports vitals, growth, dental (caries, hygiene), vision (acuity, color blindness), BMI/percentiles, referrals. Add fields or JSON if needed.
- [ ] **Content kits:** Optional content entity or static repo for scripts, slides, videos, FAQs for expert sessions; or links in Event. Can be Phase 2.

### A.3 Operations (documentation / light support)

- [ ] **SOPs:** Document pre-visit, on-site class-wise flow, post-visit reporting (can be wiki/PDF; no code required for “documented”).
- [ ] **Capacity:** Optional: students/hour or capacity fields on Event or config for scheduling hints.

### A.4 Acceptance (Module A)

- [ ] Annual calendar and age-banded protocols defined for all screenings/sessions.
- [ ] Clinical forms and content kits ready (or minimal viable forms in app).
- [ ] Operational SOPs and capacity model documented.

---

## Module B: Emergency Preparedness Training

**Goal:** Drills as events, AmbassadorDirectory usage, certifications.

### B.1 Drills as events

- [ ] **Event types:** Add drill types: fire_safety, blackout, bunker, cpr, first_aid. “Conducted by” from PRD: store in Event (e.g. conductor name/org or ambassadorId).
- [ ] **Drill logging:** Log drill events (date, type, participants, outcomes). Use Event + optional DrillOutcome or JSON. Participation metrics per class/grade.
- [ ] **Ambassador validation:** When logging a drill, optionally link to AmbassadorDirectory entry (fire dept, trainer, etc.).

### B.2 AmbassadorDirectory (shared with C)

- [ ] Already in C; ensure types include fire, police, ndrf, health_partner. Contact info and service areas. Used in B for “who conducts” and contact directory.

### B.3 Certifications

- [ ] **Certification model:** Already in C. Use for UDISE and for drill/compliance (e.g. “Fire drill 2024–25 completed”).
- [ ] **Digital certificates/badges:** Export or display school-level (and optionally student/teacher) certificates; can be PDF or badge image generated from Certification + template.

### B.4 Acceptance (Module B)

- [ ] SOPs and checklists for all drills (documented; checklists can be in-app or PDF).
- [ ] MoUs noted (external); AmbassadorDirectory populated; digital certificates available.

---

## Module D: Parent Dual Access

**Goal:** Parent identity, OTP, parent dashboard (view records, notifications, download reports).

### D.1 Identity and onboarding

- [ ] **Parent entity:** Model or link: Parent (phone/email, verified, linked to one or more Child/Student via school). Or Guardian table with studentId, schoolId, phone, email, otpVerifiedAt.
- [ ] **Link flow:** Parent links via student + school + phone/email; backend generates and sends OTP; verify OTP → mark verified, create session/token.
- [ ] **Invitation:** Optional: printed QR on report, SMS invite, or school app link that starts link flow.

### D.2 Parent API and UI

- [ ] **Auth:** Parent login (phone/email + OTP or password after first OTP). Issue parent JWT or session; scope to their linked children only.
- [ ] **View child’s health records:** API: list health records and drill participation for linked children (current + past academic years). Frontend: parent dashboard “My Child” view.
- [ ] **Notifications:** Upcoming checkups, completed screenings, abnormal findings, referrals, drills. Can be in-app list + optional push/email later. Backend: notification preferences and list endpoint.
- [ ] **Download reports:** PDF (and CSV if needed) for medical/safety reports. Reuse or extend report export from Module C; restrict to parent’s children.

### D.3 Guardrails

- [ ] No direct messaging with clinicians in scope; in-app text only (or structured channel if you add later).
- [ ] In-app copy explaining what data means and when to seek follow-up (static content or small CMS).

### D.4 Acceptance (Module D)

- [ ] Parent identity and OTP flow working.
- [ ] View records, notifications, download reports functional.
- [ ] Safety guardrails and in-app explanations in place.

---

## Child QR ID Card (cross-module)

**Goal:** Unique QR per student, downloadable PDF, scan → health ID card; access control (A or B) per product decision.

### QR.1 Backend

- [ ] **Token:** Per Student/Child: persistent, unique, long non-guessable token (e.g. uuid or 32-byte random). Store in Child/Student table. URL: `wombto18.in/card/[token]` (or your domain).
- [ ] **Public or gated route:** If Option A (token-based): GET `/card/:token` returns HTML (or redirect) for health ID view; no login. If Option B: GET `/card/:token` → redirect to login → after auth show card (and verify token belongs to user’s linked child or school).

### QR.2 Health ID card view

- [ ] **Page content:** Student name, photo (if stored), WombTo18 ID, class, section, school; health summary: BMI category, last check-up, immunization status, allergies; emergency contact. Data from Student + HealthRecord + School.

### QR.3 PDF / download

- [ ] **Layout:** Name, photo, WombTo18 ID, class, section, school, QR (central, scannable), academic year, optional school logo. Generate PDF (e.g. lib like pdfkit or jspdf) or image.
- [ ] **Download locations:** School dashboard: per-student “Download ID Card” + bulk. Parent dashboard: “My Child” download. Optional: email/SMS link after registration.

### QR.4 Acceptance

- [ ] Unique QR per student; downloadable PDF from School and Parent dashboards.
- [ ] Scan resolves to health ID card; access control per chosen option (A or B).

---

## Quick reference: dependency graph

- **C** must be first (roles, Event, AmbassadorDirectory, Certification, School Details).
- **A** and **B** depend on C (Event, roles, directory).
- **D** depends on C (Student, HealthRecord, school) and needs Parent/Guardian model.
- **QR** depends on C (Student, HealthRecord, School) and D for parent download.

Suggested sprint order: **C → A → B → D → QR**, or **C → B → A → D → QR** if drills are higher priority than preventive calendar.
