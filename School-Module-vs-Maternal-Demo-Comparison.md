# Comparative Analysis: School-Module vs wombto18-maternal-demo (School Features)

**Prepared:** 2026-03-20
**Purpose:** Gap analysis to align School-Module with the reference implementation in wombto18-maternal-demo

---

## 1. School Registration

| Feature | School-Module | maternal-demo | Gap |
|---|---|---|---|
| School name, type, board | Yes | Yes | — |
| UDISE code | Yes | Yes | — |
| Principal info | Yes | Yes | — |
| POC details | Yes | Yes | — |
| State/district dropdown | Manual text input | Real Indian state-district data | No dropdown with real data |
| OTP verification | No | Yes (phone OTP before registration) | OTP step missing at registration |
| Health & safety service selection | No | Yes (BMI, Dental, Eye, Mental Wellness, Police/Fire/NDRF checkboxes) | Entire service-selection step missing |
| Registration type | No | Yes (`direct` vs `channel_partner`) | Field missing |
| Registration number format | Not visible to user | `SCH-{STATE}-{DATE}-{RANDOM}` (auto-generated) | No visible registration number |
| Payment amount | Rs. 5,000 flat | Rs. 2,500 + 18% GST (= Rs. 2,500 total) | Price and breakdown differ |
| Mock payment fallback | No | Yes (dev/testing without Razorpay keys) | No fallback for dev testing |
| Post-payment thank-you page | No | Yes (`/school-registration/thank-you` with credentials) | Redirects straight to dashboard |
| Form validation | Basic HTML required | `zod` schema + real-time field validation | No schema-level validation |

---

## 2. School Dashboard

| Feature | School-Module | maternal-demo | Gap |
|---|---|---|---|
| School overview stats | Yes (summary cards) | Yes | — |
| Role-based tab visibility | Yes (8 tabs, 7 roles) | Not applicable (single view) | School-Module is more advanced here |
| Class-wise compliance tracking | No | Yes (compliance % by class: Nursery, Gr 1-5, etc.) | Entire compliance view missing |
| Health compliance percentage | No | Yes (e.g. "Health Compliance: 94%, Pending: 23 students") | Missing from dashboard stats |
| Action items panel | No | Yes (pending tasks, reminders, upcoming health camps) | Missing |
| School profile subpage | No | Yes (`/school-dashboard/profile` - editable) | No dedicated profile subpage |
| UDISE report generation | Certifications tab only | Dedicated full UDISE report page | No UDISE-aligned report |

---

## 3. UDISE Report (Biggest Gap)

The maternal-demo has a full, structured, printable UDISE+ aligned report page. School-Module has no equivalent.

| Feature | School-Module | maternal-demo |
|---|---|---|
| Dedicated UDISE report page | No | Yes (`/school-dashboard/udise-report`) |
| Auto-fill from school profile | No | Yes (pulls school name, UDISE code, state, principal name) |
| Health check-up summary table | No | Yes — 6 parameters, each with: Conducted (Yes/No), No. of Students Checked, Referrals Made |
| Health parameters covered | None | General Medical, Eye/Vision, Dental, BMI (Height/Weight), Menstrual Wellness (Girls 10+), First-Aid Kit |
| Medical team management | No | Yes (add/remove doctor records: name, specialisation, organisation, contact) |
| Follow-up checklist | No | Yes (Parents informed, Referrals issued, Health cards distributed, Tree planting completed) |
| Attachments section | No | Yes (Student Health Report Excel/PDF, Photos of camp, Referral slips) |
| Declaration section | No | Yes (Principal name + date + school stamp space) |
| Edit / Save toggle | No | Yes (view mode and edit mode) |
| PDF download (print) | No | Yes (`window.print()`) |
| UDISE+ / NEP 2020 / SDG 3 alignment | No | Yes (stated in declaration and footer) |

---

## 4. Implementation Plan

### Priority 1 — Registration Flow Fixes

1. **OTP verification during school registration**
   - Add phone OTP step after form submission, before record is created
   - Follows same 2-step pattern already used in login (`sendLoginOtp` → `verifyLoginOtp`)
   - Files to update: `Frontend/src/pages/RegisterSchool.tsx`, `Backend/routes/schoolRoutes.ts`

2. **State/district cascading dropdown**
   - Replace plain text `state` and `city` inputs with state → district dropdowns
   - Source: port or adapt the `state-district-data` from maternal-demo
   - Files to update: `Frontend/src/pages/RegisterSchool.tsx`

3. **Health and safety service selection**
   - Add a checkbox section during registration:
     - Health Services: BMI Assessment, Dental Check-up, Eye/Vision Screening, Mental Wellness
     - Safety Services: Police Program, Fire Safety, NDRF Program
   - Store selections in the school record (backend schema update required)
   - Files to update: `RegisterSchool.tsx`, `Backend/prisma/schema.prisma`, `Backend/routes/schoolRoutes.ts`

4. **Registration type field**
   - Add `direct` vs `channel_partner` selection to the form
   - Files to update: `RegisterSchool.tsx`, backend school model

5. **Auto-generated registration number**
   - Format: `SCH-{STATE_CODE}-{YYYYMMDD}-{6-digit random}`
   - Display to user post-registration
   - Files to update: `Backend/routes/schoolRoutes.ts` or `schoolService.ts`

6. **Thank-you page after payment**
   - Create new route `/register-school/thank-you`
   - Show registration number, login credentials, and next steps
   - Files to create: `Frontend/src/pages/RegisterSchoolThankYou.tsx`

7. **Mock payment fallback**
   - If Razorpay keys are missing or in dev mode, skip to mock payment success
   - Files to update: `Frontend/src/pages/RegisterSchool.tsx`, `Backend/routes/schoolRoutes.ts`

---

### Priority 2 — Dashboard Gaps

8. **Class-wise health compliance widget**
   - Add a section on the main dashboard showing compliance % per class group
   - Data source: aggregate health records by class from existing Prisma queries
   - Files to update: `Frontend/src/pages/Dashboard.tsx`, `Backend/routes/dashboardRoutes.ts`

9. **Action items panel**
   - Show pending tasks: students with missing vaccinations, upcoming events, new admissions needing records
   - Files to update: `Frontend/src/pages/Dashboard.tsx`, `Backend/routes/dashboardRoutes.ts`

10. **School profile subpage**
    - Dedicated editable profile page accessible from the school dashboard
    - Should show all registration details with edit capability
    - Files to update: add `Frontend/src/pages/SchoolProfile.tsx`, update `App.tsx` routing

---

### Priority 3 — UDISE Report (Highest Impact Missing Feature)

11. **New UDISE Report page**
    - Route: `/dashboard/udise-report` or as a tab under Certifications
    - Sections to implement:
      - School Information (auto-filled from profile: name, UDISE code, district, state, school category, board, class range)
      - Health Check-up Summary table (6 rows x 3 columns: conducted, students checked, referrals)
      - Medical Team section (dynamic add/remove of doctor records)
      - Follow-up checklist (4 checkboxes)
      - Attachments checklist (3 checkboxes)
      - Declaration (principal name, date, stamp space)
      - Edit/Save toggle
      - Download as PDF via `window.print()`
    - Files to create: `Frontend/src/pages/UDISEReport.tsx`
    - Files to update: `Frontend/src/App.tsx`, `Frontend/src/pages/Dashboard.tsx` (add tab or link)
    - Backend: optional API to persist saved report state
