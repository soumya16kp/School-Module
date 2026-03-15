# Compliance & Data Breach Issues (By Feature / Behaviour)

These are **feature-level** and **compliance-level** problems: who can see what data, what is exposed, what consent or controls are missing. Not technical implementation details.

---

## 1. Who can see children’s health data (access by feature)

| Issue | What’s wrong | Compliance / breach risk |
|-------|----------------|---------------------------|
| **Class Teacher can see full health records** | Class Teacher can open any child’s profile and see everything: dental, vision, BMI, mental wellness, menstrual hygiene, referrals. | Health data should be on a need-to-know basis. Mental wellness and menstrual data are especially sensitive; showing them to all teachers is excessive and can be a **privacy/compliance** issue. |
| **No “view only my class” for teachers** | Teacher sees all students in the school in Records; filtering by class is optional. | Risk of **unauthorized access** to other classes’ data if the teacher browses or exports. |
| **District Viewer can see School Details** | Dashboard gives District Viewer a “School Details” tab (if they have a linked school) or similar. | District role should see **aggregate only**. Showing a single school’s full details can mix roles and **over-expose** school PII. |
| **Partner can list all schools and see health stats** | “Browse Schools” shows all schools with names, contacts, and health stats (coverage, referrals, etc.). | Partners don’t need **identifiable school or student-level** data for sponsorship. This can be **data minimization** and **purpose limitation** issue. |
| **Any school admin can open any child by ID** | Changing the URL (e.g. `/child/1`, `/child/2`) lets an admin from School A potentially open a child from School B if IDs are global. | **Cross-school access** to minors’ health data = serious **data breach** and compliance failure. |

---

## 2. Parent and child identity / access

| Issue | What’s wrong | Compliance / breach risk |
|-------|----------------|---------------------------|
| **One phone number = access to all linked children** | Parent logs in with one phone; they see every child linked to that number (father/mother). No extra check that they are the guardian. | Shared or family phone can allow **wrong person** to see multiple children’s health data. **Identity/consent** issue. |
| **Emergency access uses simple child ID in URL** | URL is like `/emergency-access/5`. Anyone can try 1, 2, 3… and submit access requests for every child. | **Harassment** and **consent abuse**: parents get fake requests; responders can probe which children exist. **Minors’ data** is indirectly enumerable. |
| **Public card link: anyone with link sees full child + parent contacts** | Scanning the QR (or having the link) shows child name, school, class, blood group, allergies, **full parent phone numbers**, health summary. No login. | If link is shared or QR copied, **PII and health data** of a minor are exposed to **unauthorized persons**. **Data breach** and **child protection** concern. |
| **No clear “who has accessed my child’s data” for parents** | Parent has no way to see who (school staff, responders) viewed or downloaded their child’s record. | **Accountability** and **transparency** requirement under many data protection laws; missing = **compliance gap**. |

---

## 3. Sensitive data shown without need or consent

| Issue | What’s wrong | Compliance / breach risk |
|-------|----------------|---------------------------|
| **Mental wellness and menstrual data visible to all health viewers** | Any role that can “view health” (including Class Teacher if they can open profiles) sees mental wellness and menstrual hygiene flags. | **Sensitive / special category** data must be **restricted by role** and purpose. Broad visibility = **compliance** and **dignity** risk. |
| **Full phone numbers in lists and on cards** | Records list and public ID card show full parent/guardian mobile numbers. | **PII minimization**: numbers should be **masked** in lists and possibly on cards to limit **misuse and exposure**. |
| **Export can pull large sets of identifiable health data** | Export by class/section/domain can generate CSV/PDF with many children’s names, IDs, and health data. If export is not tightly scoped by role (e.g. teacher exports whole school), it’s a **bulk data exposure** risk. | **Data minimization** and **purpose limitation**; risk of **re-identification** and **leak** if file is shared or lost. |
| **No in-app consent or notice for health data collection** | Parents and schools use the app without a clear “we collect child health data for X purpose; by using this you consent” or similar. | Many regimes require **explicit consent** and **notice** for children’s data; missing = **consent/compliance** issue. |

---

## 4. Emergency and third-party access

| Issue | What’s wrong | Compliance / breach risk |
|-------|----------------|---------------------------|
| **Emergency responder sees health data after one approval** | When parent approves, the responder gets a time-limited view of child’s health. There’s no in-app limit on **what** is shown (e.g. full history vs. only emergency-relevant). | **Purpose limitation**: only **necessary** data should be shared in emergencies; excess history = **over-disclosure** and **compliance** risk. |
| **No record of who was given emergency access** | System doesn’t record (or show to parent) which responder, when, and what was accessed. | **Auditability** and **accountability** for sharing minors’ health data; missing = **compliance** gap. |
| **Partner payment flow** | Partner enters payment and may send name/email to Razorpay; school/child data might be in metadata. | Ensure **only necessary** data is sent to payment provider; otherwise **third-party data sharing** and **minimization** issue. |

---

## 5. Data retention and purpose

| Issue | What’s wrong | Compliance / breach risk |
|-------|----------------|---------------------------|
| **No defined retention for health records** | Health and event data are kept without a stated retention period or deletion process. | Many laws require **limited retention** and **secure deletion**; absence = **retention/compliance** issue. |
| **OTP and session data** | OTPs and session tokens may be stored longer than needed. | **Minimization** and **security**: unnecessary storage increases **breach impact** if system is compromised. |
| **No “delete my data” or “export my data” for parents** | Parent cannot request a copy of all data held on their child or request deletion. | **Rights of the data subject** (access, portability, erasure) under GDPR-like laws; missing = **compliance** gap. |

---

## 6. Summary by compliance theme

| Theme | Feature-level issues |
|-------|----------------------|
| **Access control** | Class Teacher sees too much health data; no strict “own class only”; School Admin could access other schools’ children if IDs not scoped; District sees school-level detail; Partner sees all schools and stats. |
| **Minors’ data** | Public card and emergency URL expose child identity and health; no consent flow; no “who accessed” for parents; mental wellness and menstrual data not restricted by role. |
| **PII minimization** | Full phone numbers in lists and on public cards; bulk export with many identifiers; possible over-disclosure to emergency responders and partners. |
| **Consent & notice** | No in-app consent/notice for collection and use of child health data; emergency access approval is the only clear consent point. |
| **Accountability & audit** | No audit trail of who viewed or exported which child’s data; no “access history” for parents. |
| **Retention & rights** | No retention policy or deletion process; no parent-facing “export my data” or “delete my data”. |

---

## What to fix (by feature, not by code)

1. **Restrict by role:** Class Teacher sees only own class; only Nurse/Counsellor (and similar) see mental wellness and menstrual fields; District sees only aggregate; Partner sees only what’s needed for sponsorship.
2. **Strict school scoping:** No child record from another school viewable by a school user, in any feature (profile, export, cards).
3. **Emergency access:** Use a non-guessable token (not sequential child ID); show only emergency-relevant fields; log and show parent who had access and when.
4. **Public card:** Mask or remove parent phone numbers; consider login or token-only access if policy requires.
5. **Parent rights:** Add “Who accessed my child’s data” (audit) and, where required, “Export my data” / “Delete my data”.
6. **Consent and notice:** Add clear in-app notice and, where required, consent for collection and use of child health data.
7. **Retention:** Define and implement retention and secure deletion for health records, OTPs, and access logs.

This document focuses on **data breach and compliance risks in features and behaviour**; technical fixes (auth, encryption, rate limiting) support these but are not listed here.

---

## Detailed solutions for each problem

### 1.1 Class Teacher can see full health records

**Solution:**

- **Define “sensitive health fields”** in one place (e.g. config): mental wellness, menstrual hygiene, dental/vision referral reasons, and any free-text clinical notes.
- **Backend:** For every API that returns a child’s health record (e.g. GET child profile, GET health records, export rows), check the requesting user’s role. If role is `CLASS_TEACHER`, strip or null out sensitive fields before sending the response. Only roles such as `SCHOOL_ADMIN`, `PRINCIPAL`, `NURSE_COUNSELLOR`, `WOMBTO18_OPS` receive full health data.
- **Frontend:** On the Child Profile (and any health summary), if role is Class Teacher, do not render sections for “Mental wellness”, “Menstrual hygiene”, or referral reason text; show only high-level flags (e.g. “Referral recommended”) without detail, or hide those blocks entirely.
- **Document:** In your privacy notice / data handling policy, state that class teachers see only non-sensitive health summary (e.g. attendance at programs, BMI category) and not mental or menstrual data.

---

### 1.2 No “view only my class” for teachers

**Solution:**

- **Data model:** Add `assignedClass` and `assignedSection` (optional) to the User model for Class Teachers. Populate these when a Class Teacher account is created or updated.
- **Backend – Records list:** For role `CLASS_TEACHER`, when fetching the list of children (GET /children or equivalent), filter by `child.class === user.assignedClass` and, if set, `child.section === user.assignedSection`. Do not return children from other classes/sections.
- **Backend – Child profile:** Before returning a single child’s profile or health records, if the user is Class Teacher, verify `child.schoolId === user.schoolId` and `child.class === user.assignedClass` (and section if applicable). Return 403 if not in their class.
- **Backend – Export:** For export (CSV/PDF), if the user is Class Teacher, allow only export for their assigned class/section; reject or filter requests for other classes.
- **Frontend:** For Class Teacher, pre-fill or lock the Records “Class” and “Section” filters to their assigned class/section and hide or disable the option to change to another class. Optionally hide the “Export report” for whole school and only offer “Export for my class”.

---

### 1.3 District Viewer can see School Details

**Solution:**

- **Frontend:** In the dashboard tab visibility logic, remove `DISTRICT_VIEWER` from the list of roles that can see the “School Details” tab. District Viewers see only the “Dashboard” tab (aggregate overview).
- **Backend:** For any endpoint that returns a single school’s full registration details (e.g. “my school”, or school by ID), if the user’s role is `DISTRICT_VIEWER`, return 403 or return only aggregate/anonymized stats, not PII (principal name, contact, address, etc.).
- **Policy:** Document that District/Board role is for aggregate monitoring only and does not have access to individual school registration or contact details.

---

### 1.4 Partner can list all schools and see health stats

**Solution:**

- **Minimize what Partners see:** Keep “Browse Schools” but reduce payload:
  - **School list:** Return only: school name (or anonymized label), city, state, board, student strength, number of events, and **aggregate** stats (e.g. coverage %, referral %) without any principal/POC name, phone, email, or full address.
  - **School stats:** For “View Health Stats”, return only aggregated counts (e.g. “342 students checked, 28 referrals”) by domain and year; no child names, IDs, or class-level breakdown that could re-identify.
- **Backend:** Create dedicated DTOs or response mappers for Partner-facing school list and school-stats endpoints that strip all PII and identifiable contact details.
- **Document:** In partner terms or privacy notice, state that partners see only anonymized/aggregate data for the purpose of choosing sponsorship targets.

---

### 1.5 Any school admin can open any child by ID (cross-school access)

**Solution:**

- **Backend – every child/health endpoint:** Resolve the requesting user’s `schoolId` (from JWT or session). For every request that takes a child ID (or health record by child):
  - Load the child and check `child.schoolId === user.schoolId`.
  - If not equal, return **403 Forbidden** and do not return any child or health data.
- Apply this in: GET child by ID, GET health records for child, PATCH child, export (filter children by school first), bulk ID cards (only children of user’s school), and any dashboard/overview that is school-scoped.
- **Frontend:** Do not rely on hiding links; always validate on the server. Optionally, after a 403, redirect to dashboard and show “You don’t have access to this record”.
- **Testing:** Add tests that assert a user from School A receives 403 when requesting a child belonging to School B.

---

### 2.1 One phone number = access to all linked children

**Solution:**

- **At registration (school side):** When the school adds a child, require clear designation of “Father’s number” and “Mother’s number” and, in school-facing documentation, state that only the designated guardian should use that number for parent login.
- **In-app notice:** On the Parent Login page, add a short notice: “Use only the phone number registered with the school as father’s or mother’s contact. Do not use a shared number if you are not the designated guardian.”
- **Optional – step-up for multiple children:** When a parent has more than one child linked, after OTP verification consider an extra step: “Select which child you are the legal guardian of” (checkbox/list) and store that selection for audit. Or send a second OTP to the other parent’s number for “confirm you are the guardian of [Child X]” when switching to a different child. This is a product choice; at minimum, the notice above and school-side registration clarity reduce risk.
- **Policy:** Document that the school is responsible for ensuring the contact numbers they enter belong to the legal guardian(s).

---

### 2.2 Emergency access uses simple child ID in URL

**Solution:**

- **Use an opaque token instead of child ID:** Generate a long, random, single-use or time-limited token per child for emergency access (e.g. `emergency_<crypto.randomBytes(24).toString('base64url')>`). Store it in the database (e.g. on the Child model or a small EmergencyAccessToken table with childId, token, expiresAt).
- **URL change:** Public URL becomes `/emergency-access/:token` (not `/emergency-access/:childId`). The frontend and backend resolve the child only via the token; if token is invalid or expired, return 404 or “Link expired”.
- **QR and parent flow:** When the parent views “Emergency access” or “Share with responder”, the app generates (or fetches) this token and shows the QR/link with that token. Do not expose the internal child ID in any public URL.
- **Rate limiting:** On the emergency-access request endpoint (submit request), apply rate limiting per IP and per token to prevent enumeration or abuse.

---

### 2.3 Public card link shows full child + parent contacts

**Solution:**

- **Mask parent phone numbers on the public card:** On the backend endpoint that serves the public card (GET /card/:token), before returning the response, mask parent/guardian phone numbers. For example: show only last 4 digits (e.g. `****0375`) or “***-***-0375”. Store full numbers in the DB for school/parent use, but do not send them in the public card response.
- **Optional – reduce what’s on the card:** Consider removing parent names and showing only “Emergency contact on file” with masked number, or a single masked number. Keep child name, school, class, blood group, allergies, and high-level health summary as needed for emergency use.
- **Access policy:** If your organization decides the card must be login-gated (Option B in PRD), replace the public card with a flow: scan QR → redirect to login (parent or responder) → after auth, show card. Then no PII is shown without authentication.
- **Document:** In your privacy policy, state that the physical/QR card is intended for emergency use and shows limited, masked contact information.

---

### 2.4 No “who has accessed my child’s data” for parents

**Solution:**

- **Audit log model:** Add an audit table (e.g. `ChildDataAccessLog`) with: `childId`, `userId` (nullable for system/responder), `actorType` (“school_user”, “parent”, “emergency_responder”), `action` (“view_profile”, “view_health”, “export”, “emergency_access_granted”), `ip` (optional), `metadata` (e.g. responder name for emergency), `createdAt`.
- **Backend – log actions:** Whenever a user (school staff) views a child’s profile or health records, or exports data including that child, or when an emergency access is granted, insert a row into this audit table.
- **Parent-facing “Access history”:** Add an API: GET /parent/children/:id/access-history (authenticated with parent JWT, and verify the child belongs to this parent). Return a list of recent access events (date, actor type, action, no need to expose other users’ names to parent unless required by law – e.g. “School staff viewed profile on DD/MM” or “Emergency access granted to Dr. X on DD/MM”).
- **Frontend:** In the Parent Dashboard (e.g. under “Medical reports” or a new “Privacy” / “Access history” section), add a section “Who has accessed my child’s data” that calls this API and displays the list in simple language.

---

### 3.1 Mental wellness and menstrual data visible to all health viewers

**Solution:**

- **Same as 1.1:** Treat these as “sensitive health fields”. Backend: for roles other than SCHOOL_ADMIN, PRINCIPAL, NURSE_COUNSELLOR, WOMBTO18_OPS, do not include mental wellness and menstrual hygiene fields (or referral reasons for them) in API responses for child profile, health records, or export. Frontend: for Class Teacher and any other restricted role, do not render those sections.
- **Explicit role list:** Maintain a single list of “roles allowed to see sensitive health fields” in config or backend constant; use it in all services that build child/health payloads and in export generation.

---

### 3.2 Full phone numbers in lists and on cards

**Solution:**

- **Backend helper:** Create a utility `maskPhone(phone: string): string` (e.g. show last 4 digits: `****0375` or `***-***-0375`). Use it in:
  - Response for the **public** card (GET /card/:token) for father/mother/mobile.
  - Optional: in the **school** Records list API, return masked phone for roles that don’t need full number (e.g. Class Teacher); or always return masked in list and show full only on Child Profile for authorized roles.
- **Frontend:** In Records list and any shared view, display masked numbers unless the user role is explicitly allowed to see full (e.g. Admin, Principal, Nurse). For the public CardView page, never display full numbers if you fix it on the backend.
- **Export:** For CSV/PDF export, consider masking phone numbers in exports for Class Teacher; for Admin/Principal, full numbers may be needed for official records – document the policy.

---

### 3.3 Export can pull large sets of identifiable health data

**Solution:**

- **Role-based export scope:**
  - **Class Teacher:** Can export only their assigned class/section (enforced in backend; see 1.2). Do not allow “all classes” or other classes’ data.
  - **School Admin / Principal:** Can export by class/section/domain for their school only (already scoped by schoolId).
  - **District Viewer:** Can export only district/school-level aggregate (e.g. one row per school), not per-child rows.
- **Backend:** In the export endpoint, check the user’s role and apply the above filters before building the CSV/PDF. Limit the maximum number of rows per export (e.g. 1000) to reduce bulk download risk; for larger reports, require “request report” (async job) and notify when ready.
- **Audit:** Log every export request (who, when, filters, row count) in the audit table so you can detect misuse.
- **Document:** In your data policy, state that exports are restricted by role and logged for accountability.

---

### 3.4 No in-app consent or notice for health data collection

**Solution:**

- **First-time notice (school):** When a school admin or staff logs in for the first time (or when they first open “Records” or “Add student”), show a modal or full-screen notice: “By using this platform you confirm that your school has obtained necessary consent from parents/guardians for collection and use of student health data for [stated purposes, e.g. health programs and emergency preparedness]. You agree to use the data only for these purposes and in line with [link to Privacy Policy].” Require an “I agree” or “I confirm” before proceeding. Store a flag (e.g. `user.consentToDataPolicyAt`) so you don’t show it again every time.
- **Parent portal notice:** On the Parent Login page and again on first entry to the Parent Dashboard, show a short notice: “Your child’s health data is used to [purposes]. By logging in you confirm you are the registered guardian and agree to [link to Privacy Policy]. For access and deletion requests, contact [email].” Optionally store parent’s acceptance (e.g. linked to phone or parent session).
- **Privacy Policy / Data notice:** Maintain a dedicated Privacy Policy (or Data Protection Notice) page that explains: what data you collect (child health, parent contact), legal basis, purposes, retention, who has access (school, district, partners – in aggregate only), and how parents can request access, correction, or deletion. Link to it from login screens and footer.
- **Consent for specific programs:** For programs that require explicit consent (e.g. HPV awareness/vaccination referral), add a checkbox or consent step in the flow when the school records that referral, and/or when the parent views that section, with a short explanation and “I consent” or “I have been informed”.

---

### 4.1 Emergency responder sees more data than needed

**Solution:**

- **Define “emergency-relevant” fields:** Restrict the data shown to the responder after approval to: child name, school name, class, blood group, allergies, immunization status (e.g. up to date yes/no), one-line “last check-up summary” (e.g. “BMI normal; no active referral”). Do **not** show: full health history, dental/vision details, mental wellness, menstrual data, or past referral reasons.
- **Backend:** The endpoint that returns data to the responder (e.g. GET /access/view/:token) should return only this minimal set. Build a dedicated DTO or mapping for “emergency responder view” and use it only for this flow.
- **Frontend (responder view):** Display only those fields in a simple, readable layout. Do not add “View full record” or links to full health history for the responder.

---

### 4.2 No record of who was given emergency access

**Solution:**

- **Log on approval:** When a parent approves an emergency access request, create an audit record: childId, requester name/role/phone (from the request), action “emergency_access_granted”, timestamp, and the access token or request ID so you can link it to later views.
- **Log when responder views:** When the responder’s session loads the child’s emergency view (GET /access/view/:token), log: childId, action “emergency_view”, timestamp, and optionally IP. You can link this to the request so you know “Dr. X viewed this child’s emergency data at this time.”
- **Show to parent:** In the parent’s “Access history” (see 2.4), include entries for “Emergency access granted to [Requester name] on [date]” and optionally “Viewed on [date]”. This satisfies accountability and transparency.

---

### 4.3 Partner payment flow (data sent to Razorpay)

**Solution:**

- **Review payload to Razorpay:** Ensure you only send to Razorpay what’s needed for payment: order amount, order ID, customer email (if required by Razorpay), and a generic description (e.g. “School health program sponsorship”). Do **not** send child names, child IDs, school names, or any health data in custom fields or notes unless strictly necessary and disclosed in your privacy policy.
- **Backend:** In the create-order and capture handlers, avoid putting PII in `notes` or `metadata` that Razorpay stores. If you need to link the payment to a school internally, use your own internal ID (e.g. school ID) and keep that in your DB only, not in Razorpay’s payload.
- **Document:** In your privacy policy, state that payment processing is done by [Razorpay] and that only necessary transaction data (amount, reference) is shared with them; no child or detailed school PII is shared with the payment provider.

---

### 5.1 No defined retention for health records

**Solution:**

- **Define retention in policy:** In your Privacy Policy or internal Data Retention Policy, state how long you keep: (a) child health records (e.g. “until the child leaves the school + X years” or “7 years for legal compliance”), (b) access logs (e.g. 2 years), (c) OTP and session data (e.g. 24 hours or until used).
- **Implement deletion jobs:** Add a scheduled job (e.g. cron) that: (1) deletes or anonymizes health records and related data for children who have left the school and passed the retention period; (2) deletes expired OTPs and expired emergency tokens; (3) purges old audit logs beyond the retention period. Run it regularly (e.g. weekly).
- **Anonymization option:** For historical reporting, you may anonymize (remove name, contact, class) instead of hard-delete, and keep only aggregate stats. Document this in the retention policy.

---

### 5.2 OTP and session data stored longer than needed

**Solution:**

- **OTP:** Already short-lived (e.g. 10 min). After successful verification, delete the OTP row immediately. Add a job that deletes any OTP row where `expiresAt` is in the past, running every hour or daily.
- **Sessions / tokens:** JWTs are stateless; if you use refresh tokens or server-side sessions, set a reasonable expiry (e.g. 24 hours for access, 7 days for refresh) and delete refresh/session records when they expire or when the user logs out. Run a cleanup job for expired sessions.
- **Document:** In the retention policy, state that OTPs and session data are kept only for the validity period and then deleted.

---

### 5.3 No “export my data” or “delete my data” for parents

**Solution:**

- **Export my data (parent):** Add an option in the Parent Dashboard (e.g. under “Privacy” or “Account”): “Download all data about my child”. Backend: GET /parent/children/:id/export-my-data (parent JWT, verify child belongs to parent). Generate a JSON or PDF that includes: child demographics (name, class, section, school), all health records (dates, findings, referrals), and access log entries for this child. Return as a downloadable file. Complete within a few minutes or run as a background job and email the link when ready.
- **Delete my data (parent):** Add “Request deletion of my child’s data” in the Parent Dashboard. Backend: POST /parent/children/:id/request-deletion. This can create a “deletion request” ticket (stored in DB and/or sent to admin email) so an admin can process it manually (verify identity, then anonymize or delete the child and related records). Alternatively, if your policy allows immediate deletion on request, implement a flow that anonymizes the child and health records (replace name with “Deleted”, null out PII) or hard-deletes and then confirms to the parent. Comply with your retention obligations (e.g. some data may need to be kept for legal reasons; then document and inform the parent what is retained and why).
- **Privacy policy:** Update the policy to state how parents can request access (export) and erasure (deletion), and the timeline (e.g. “within 30 days”).

---

## Implementation order (suggested)

1. **Immediate (breach prevention):** 1.5 (school scoping), 2.2 (emergency token), 2.3 (mask card phones), 3.2 (mask phones in list/card).
2. **Access control:** 1.1 (sensitive fields by role), 1.2 (class teacher class-only), 1.3 (District no School Details), 1.4 (Partner minimize data).
3. **Audit and transparency:** 2.4 and 4.2 (audit log + access history for parents).
4. **Consent and policy:** 3.4 (in-app notice and consent), 5.1–5.3 (retention policy, OTP/session cleanup, export/delete for parents).
5. **Emergency and partners:** 4.1 (minimal emergency view), 4.3 (Razorpay payload review).
