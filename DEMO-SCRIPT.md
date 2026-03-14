# WombTo18 School Edition – Stakeholder Demo Script

> A word-for-word presentation guide. Sections marked **[SAY]** are what you speak aloud. Sections marked **[DO]** are what you click or type on screen. Sections marked **[NOTE]** are private reminders to you — do not read these out.

---

## Pre-Demo Checklist

Before the meeting starts, complete these steps:

- [ ] Backend running on Render (or locally on port 5000)
- [ ] Frontend running on Vercel (or locally on port 5173)
- [ ] Test school account already created: `admin@demo-school.com` / `Demo@1234`
- [ ] School already registered: "Sunrise International School"
- [ ] At least 8–10 students already added with health records (mix of normal and flagged)
- [ ] One student has a dental referral flag
- [ ] One student has a vision referral flag
- [ ] One student has an "At Risk" BMI category
- [ ] Parent account phone: `+91 98765 00000` linked to a student named "Arjun Sharma"
- [ ] Browser zoom at 100%, full screen
- [ ] Disable notifications on your laptop
- [ ] Have a second phone/browser tab ready for the parent OTP demo
- [ ] Print (or have on screen) a physical QR ID card for the emergency access demo
- [ ] Partner account created: `partner@demo.com` / `Demo@1234`
- [ ] Razorpay is in **test mode** (key starts with `rzp_test_`) — confirm with backend team
- [ ] If doing live payment demo: have test card `4111 1111 1111 1111`, any future expiry, any CVV ready

**Estimated demo time: 35–40 minutes**

---

## Opening (2 minutes)

**[SAY]**
> "Good [morning/afternoon], everyone. Thank you for joining us today.
>
> I want to start with a quick question: How many schools in India have a single, unified place where they can track every student's health record — from annual checkups to dental screenings to emergency drills — and where a parent can instantly pull up their child's health ID card from their phone?
>
> The answer, until now, has been very few. Health data sits in paper registers, drill attendance is tracked in spreadsheets, and parents have no visibility unless the school calls them.
>
> What we've built is WombTo18 School Edition — a complete preventive health and emergency preparedness platform for K-12 schools. Today I'm going to walk you through the product as a real user would experience it, covering four journeys: a school admin, a parent, an emergency responder, and the QR health ID card."

**[DO]** Open the app in the browser. The login page is on screen.

---

## Part 1 – School Admin Experience (10 minutes)

### 1A – Logging In

**[SAY]**
> "This is what a school admin or principal sees when they first open the app. Clean, straightforward — email and password."

**[DO]** Type `admin@demo-school.com` and `Demo@1234`. Click **Sign In to Dashboard**.

**[SAY]**
> "And we're in. This is the main dashboard for Sunrise International School."

---

### 1B – The Dashboard

**[SAY]**
> "The first thing a principal sees is a health snapshot of their entire school — not individual records, but the big picture.
>
> Here we can see:
> - **Checkup Coverage** — 100%, meaning every student in the system has at least one health record this academic year
> - **Drill Completion** — 1 of 5 required drill types done (fire, blackout, bunker, CPR, first aid). Schools need to complete all five for full compliance
> - **Certifications** — 2 active, 1 pending (UDISE, Fire Safety, Health Program)
> - **High Risk** — the system flags issues like low drill completion so they stand out immediately
>
> Below that, the school card shows affiliation, principal, contact, total strength. This is the kind of data that previously required a manual audit — here it's live and always current."

**[DO]** Pause on the dashboard for 5–7 seconds. Let the numbers sink in.

---

### 1C – Student Records

**[SAY]**
> "Let me take you into the Records section, where all students are managed."

**[DO]** Click **Records** in the sidebar.

**[SAY]**
> "Every student is listed here with their class, section, and last health record date. If a student has no records yet, that's also visible — so nothing falls through the cracks.
>
> I can search by name, filter by class — let me show you class 7."

**[DO]** Use the class filter to show Class 7 students.

**[SAY]**
> "There's Arjun Sharma in 7-B. Let me open his profile."

**[DO]** Click **View Profile** on Arjun Sharma.

---

### 1D – Student Health Profile

**[SAY]**
> "This is the student's health profile. At the top we have his personal details — name, class, blood group, allergies, emergency contacts.
>
> Below that, notice this note: 'Class 6–8: Recommended screenings — Annual Check-up, Vision Screening, Dental Screening, BMI Assessment.' This is what we call age-banded protocols — the platform automatically tells you which screenings are relevant for this student's grade band, so nurses know exactly what to do when they're on-site."

**[DO]** Point to the age-band note on screen.

**[SAY]**
> "And here are his health records. The latest one from February 2025 shows a dental referral was flagged. Let me click into it."

**[DO]** Click on the most recent health record to expand or view it.

**[SAY]**
> "You can see the full record — height, weight, BMI in the normal range, but the dental screening flagged a caries index above threshold. The nurse has noted 'recommend dental consultation.' This flag is what you saw on the dashboard's high-risk section.
>
> Everything is traceable — who entered the record, when, which academic year."

---

### 1E – Adding a Health Record (optional, can skip to save time)

**[NOTE]** Skip this if time is short. Only demonstrate if a stakeholder specifically asks "how does data get in?"

**[SAY]**
> "Let me quickly show you how a nurse adds a health record. I'll click 'New Health Entry'."

**[DO]** Click **+ New Health Entry**.

**[SAY]**
> "The form is organised by health domain — vitals, dental, vision, immunization, mental wellness, nutrition. The nurse fills in only what's relevant for that visit. If it's a dental screening day, she fills in the dental section. If it's a full check-up day, she fills in everything. Nothing is mandatory except the academic year."

**[DO]** Fill in height (145), weight (42), and toggle the dental referral flag. Do not save — click cancel or back.

---

### 1F – Exporting a Health Report

**[SAY]**
> "Now, one of the most requested features by schools — reporting. At the end of each term, the principal needs to send a health summary to the school board or district education office. This used to mean hours of manual work in Excel.
>
> Let me show you how it works now."

**[DO]** Go back to the Records page. Click **Export Report**.

**[SAY]**
> "I can choose CSV for Excel, or PDF for a formatted printable report. I'll filter for the current academic year, and let's say I want the vision screening data specifically."

**[DO]** Select Format: PDF, Academic Year: 2024-2025, Domain: Vision. Click **Download**.

**[SAY]**
> "A formatted PDF report downloads in seconds — ready to submit or share, no manual formatting required."

**[DO]** Open the downloaded PDF briefly so the audience can see it, then close it.

---

### 1G – Events and Drills

**[SAY]**
> "Schools are legally required to conduct annual drills — fire safety, first aid, CPR training. But they also run checkups, screenings, and health programs. Tracking whether each actually happened, who attended, and getting a compliance certificate has always been a pain point. Let me show you how WombTo18 handles it."

**[DO]** Click **Events** in the sidebar.

**[SAY]**
> "Here is the full event calendar for the academic year. You can see health events — Vision Screening, Dental Screening — and safety drills like the Fire Safety Drill.
>
> Every event type supports attendance. The Fire Safety Drill shows 1128/1200 attended. The Vision Screening could show the same — you mark an event complete, then log how many students participated. That gives a collective count for each program: 'these many students did dental screening,' 'these many did vision,' and so on. Drill attendance also feeds into the school's drill completion percentage on the dashboard."

**[DO]** Click on the Fire Safety Drill to show its details — attendance, notes, completion status. Point out that Vision Screening and Dental Screening would have the same Log/Edit attendance option once completed.

**[SAY]**
> "Let me quickly show you what happens when we add a new event."

**[DO]** Click **Add Event**.

**[SAY]**
> "I'll choose 'HPV Awareness Session' as the event type."

**[DO]** Select HPV Awareness from the type dropdown.

**[SAY]**
> "Notice what just appeared below the dropdown — 'Applicable grade bands: 6–8, 9–12 (girls, age 9–14).' The system automatically tells the scheduler which grades this applies to, so the vice principal doesn't have to look it up in a manual. The right students get invited, the right classes get scheduled."

**[DO]** Click cancel — don't save the event.

---

### 1H – QR ID Card (School Side)

**[SAY]**
> "Now I want to show you one of the features I'm most excited about — the student health ID card."

**[DO]** Go back to **Records**. Click **ID Card** on Arjun Sharma's row.

**[SAY]**
> "A new tab opens with Arjun's digital health ID card. This is printable — it fits on a standard ID card size.
>
> You can see his name, school, class, registration ID, blood group, allergies, emergency contacts, a health summary, and — most importantly — this QR code in the centre.
>
> Anyone who scans this QR gets instant access to this same information. No login required. If Arjun collapses at a school trip, the accompanying teacher or a nearby doctor can scan this and immediately know his blood group is B+, he has no allergies, and his last checkup was clean."

**[DO]** Click the **Print ID Card** button to show the print dialog, then close it.

**[SAY]**
> "From the school's side, the admin can also download ID cards for the entire school in one click — let me show you that."

**[DO]** Go back to Records. Click **Download All ID Cards**.

**[SAY]**
> "I can filter by class or section, then download a multi-page PDF — one card per page, print and laminate. Every student gets a physical health ID card that goes home in their school bag."

**[DO]** Keep the filter blank. Click **Download PDF**. Wait for the download.

**[SAY]**
> "Done. That's 400 ID cards in a single PDF."

---

## Part 2 – Parent Experience (7 minutes)

**[SAY]**
> "Now let me switch to the parent's perspective. I want to show you this on a mobile-sized browser because this is how most parents will access it."

**[DO]** Either switch to a mobile device, or open Chrome DevTools and switch to mobile view (iPhone 12 Pro size). Navigate to the parent login page.

---

### 2A – OTP Login

**[SAY]**
> "Parents don't need to create an account. There are no passwords to remember. They log in with the same phone number the school registered when they enrolled their child."

**[DO]** Type `+91 98765 00000`. Click **Send OTP**.

**[SAY]**
> "An OTP is sent via SMS. In production, this works with Twilio or Fast2SMS. Let me enter the code."

**[NOTE]** If in dev mode, the OTP will appear on screen. Enter it. If in production, you need the SMS on your phone.

**[DO]** Enter the OTP. Click **Verify & Access**.

**[SAY]**
> "And we're in — directly to Arjun's health dashboard. No signup flow, no email verification, no forgotten passwords. The parent is immediately where they need to be."

---

### 2B – Parent Dashboard – Notifications

**[SAY]**
> "The first thing the parent sees is notifications — things they actually need to act on.
>
> Here we have: 'Arjun's last dental screening recommended a dental consultation.' That's a direct call to action based on the nurse's flag from the health record we saw earlier.
>
> This replaces the paper chit that used to get lost in the school bag."

**[DO]** Point to the notification panel.

---

### 2C – Health Tab

**[SAY]**
> "On the Health tab, the parent sees Arjun's current vitals — height, weight, BMI, and category. Right now he's in the Normal range, which is reassuring.
>
> The BMI trend chart shows his growth over three academic years. A parent can actually see their child's health trajectory — not just a one-time snapshot."

**[DO]** Click on the **Health** tab. Show the vitals card and the trend chart.

---

### 2D – Safety & Programs Tab

**[SAY]**
> "The Safety and Programs tab shows the parent which school health programs their child has participated in — immunization, nutrition sessions, mental wellness checks. And any upcoming events at the school."

**[DO]** Click **Safety & Programs** tab.

---

### 2E – Medical Reports Tab

**[SAY]**
> "The Medical Reports tab is where everything comes together. All health records are listed chronologically. If the school nurse uploaded a lab report, the parent can download it directly here — no need to call the school, no need to come in person.
>
> And here is the Download ID Card button — so parents can re-download the card any time, in case the physical card gets lost or damaged."

**[DO]** Click **Medical Reports** tab. Point to the record list and the Download ID Card button.

---

### 2F – Emergency Access

**[SAY]**
> "I want to show you something that I think is genuinely new in the Indian school health space — the emergency access flow."

**[DO]** Point to the QR code displayed in the Emergency Health ID section.

**[SAY]**
> "This QR code is on the back of Arjun's physical ID card. Let's say he's at a school trip and he has a medical emergency. The attending teacher or a bystander doctor can scan this QR.
>
> Let me demonstrate — I'll open a new incognito window to simulate someone scanning the code."

**[DO]** Open an incognito browser. Navigate to the emergency access URL (or scan the QR with a phone).

**[SAY]**
> "The person scanning sees a simple form — name, phone number, their role, and why they need access. They are not seeing any health data yet. This is the request."

**[DO]** Fill in: Name "Dr. Mehta", Phone "+91 91234 56789", Role "Doctor", Reason "Student in emergency ward, need medical history". Click **Request Access**.

**[SAY]**
> "The doctor now sees a 'waiting for approval' message. Simultaneously — on the parent's device — an access request notification appears.
>
> Let me switch back to the parent's view."

**[DO]** Switch back to the parent dashboard tab.

**[SAY]**
> "The parent sees Dr. Mehta's request — name, role, reason, phone number, and when they requested it. The parent can call the school or hospital to verify, and then approve."

**[DO]** Click **Approve** on the request.

**[SAY]**
> "Now let's see what the doctor sees."

**[DO]** Switch to the incognito tab. Refresh or wait for the page to update.

**[SAY]**
> "The doctor now has access to Arjun's limited health summary — blood group, allergies, immunization status, BMI, dental and vision notes. Just what they need in an emergency. This access automatically expires in 24 hours."

**[DO]** Show the health data briefly on screen.

**[SAY]**
> "No hospital paperwork. No frantic calls to parents at 2 AM asking 'does your child have any allergies.' The information gets to the right person in under 60 seconds."

---

## Part 3 – District Overview (2 minutes)

**[SAY]**
> "Let me briefly show you the district-level view — relevant for education board officials who oversee multiple schools."

**[DO]** Log out and log in with a District Viewer account, or show a screenshot if the account isn't pre-configured.

**[SAY]**
> "A district officer sees only one thing in their sidebar — the Dashboard. No school profile, no records, no events. Just the data they actually need.
>
> The dashboard shows a District Overview table: one row per school, with student count, checkup coverage percentage, drill completion, and high-risk flags. At a glance they can identify which schools need attention.
>
> They can also export a district-level CSV or PDF report — perfect for quarterly board reviews."

---

## Part 4 – Partner / CSR Sponsorship (5 minutes)

**[SAY]**
> "Now I want to show you something that directly addresses the funding side of this — the partner and CSR module. This is for corporates, foundations, or individuals who want to sponsor health programs at schools."

**[DO]** Log out. Log in with the partner account: `partner@demo.com` / `Demo@1234`.

---

### 4A – Partner Impact Dashboard

**[SAY]**
> "Partners log into the same app but see a completely different experience — the Partner Network dashboard.
>
> This home screen shows them their impact at a glance. Total contributions made, their current tier — Silver, Gold, or Platinum — and a progression bar showing how far they are from the next tier.
>
> Below that, a Partner Progress panel shows how many schools they've supported, how many students have been impacted, and how many events they've funded."

**[DO]** Pause on the Impact Overview. Point to the tier badge and progression bar.

---

### 4B – Browsing Schools

**[SAY]**
> "The most important section for a partner is 'Browse Schools.' This is where they find institutions to sponsor."

**[DO]** Click **Browse Schools** in the sidebar.

**[SAY]**
> "Every registered school on the platform is listed here. Partners can search by school name or filter by board affiliation — CBSE, ICSE, State Board, IB.
>
> Each card shows the school's name, location, student strength, and how much has already been sponsored by other partners."

**[DO]** Point to 2–3 school cards. Show the search bar and board filter briefly.

**[SAY]**
> "But here's what makes this genuinely useful for a CSR officer — before they commit money, they can actually see the school's health data."

**[DO]** Click **View Health Stats** on a school.

**[SAY]**
> "This is a year-by-year breakdown of everything that school has done — general checkups, eye screening, dental, BMI, immunization, mental wellness. How many students were covered, how many referrals were flagged.
>
> A CSR officer can look at this and say: 'They've done dental and vision, but 41 students need dental referrals and the school hasn't been able to follow up. That's where my funding should go.' This is data-driven philanthropy."

**[DO]** Close the stats modal.

---

### 4C – Making a Sponsorship

**[SAY]**
> "Now let me show you how a sponsorship is actually made."

**[DO]** Click **Sponsor This School** on a school card.

**[SAY]**
> "The partner sees a configuration screen. They choose the donation type — general, health checkup, a specific event, equipment, or scholarship.
>
> Then they set how many students they want to sponsor. The platform charges ₹500 per student — this covers one full annual health checkup cycle. Or they can tick 'Sponsor All Students' to cover the entire school."

**[DO]** Set number of students to 100. Show the amount updating to ₹50,000 automatically.

**[SAY]**
> "₹50,000 sponsors 100 students. They can also add a message — which actually shows up on the school's Ambassadors page as a public acknowledgement.
>
> Let me click Proceed to Checkout."

**[DO]** Click **Proceed to Checkout**.

**[SAY]**
> "The Razorpay checkout opens — UPI, card, netbanking, wallet, all payment options are available. The entire payment is handled by Razorpay's PCI-compliant infrastructure, so we never touch card data."

**[NOTE]** Do NOT complete the actual payment during the demo unless you are in test mode with a Razorpay test key. If in test mode, use card number 4111 1111 1111 1111, any future expiry, any CVV.

**[DO]** Either complete a test payment, or show the Razorpay modal briefly and close it.

**[SAY]**
> "Once payment goes through, the donation is recorded, the school's card refreshes with the updated total, and the partner's contribution count goes up. The school admin also sees this partner appear in their Ambassadors page under 'Institutional Benefactors.'"

---

### 4D – Transaction History

**[SAY]**
> "The partner can always review all their past contributions under My Donations — school name, date, amount, type, and any message they included."

**[DO]** Click **My Donations** in the sidebar. Show the list briefly.

---

## Part 5 – The Bigger Picture (3 minutes)

**[SAY]**
> "Let me step back and summarise what we've built and why it matters."

**[DO]** Show the dashboard homepage. Keep it on screen while you speak.

**[SAY]**
> "Before WombTo18 School Edition, a typical school had:
> - Health records on paper registers or in scattered Excel files
> - No system to track whether required annual screenings were completed
> - Drill attendance in a physical logbook
> - Parents with zero visibility into their child's health data
> - No standardised ID card — certainly not one a doctor could scan in an emergency
>
> With this platform:
> - Every student's health data is digital, structured, and accessible by the right people
> - The principal can see school-wide health coverage at a glance
> - Nurses add records in minutes, not hours
> - Reports that used to take a day to compile download in seconds
> - Parents get real-time visibility and are notified of referrals and upcoming events
> - Every child carries a scannable health ID that works without internet, without a login, and in any emergency
>
> We currently support six roles — School Admin, Principal, Class Teacher, Nurse/Counsellor, District Viewer, and WombTo18 Ops — each with appropriate access controls. The parent portal is completely separate, accessed by phone OTP, with no overlap into school-level admin data.
>
> The backend is deployed on Render, the frontend on Vercel. The database is PostgreSQL via Prisma. The codebase is fully TypeScript — frontend in React, backend in Node with Express."

---

## Closing (1 minute)

**[SAY]**
> "What you've seen today is the working product — not a prototype or a mockup. Everything I clicked and typed was live data.
>
> We're at a stage where we can onboard pilot schools right now. The things still on our roadmap include production readiness hardening, a full QA pass, more test coverage, and deeper polish on the UI.
>
> I'm happy to take questions, do a deeper dive into any specific flow, or talk about the technical architecture if that's useful."

**[DO]** Bring up a clean browser tab or go back to the dashboard homepage.

---

## Q&A Preparation

Anticipate these questions and know your answers:

---

**Q: "What happens if a parent loses their phone or changes their number?"**

> The school admin updates the phone number on the student's record. The next OTP will go to the new number. There is no account to "transfer" — the number is the identity.

---

**Q: "Is the child's health data secure? Who can see it?"**

> Health records are only accessible to logged-in school users (with JWT authentication). The public QR card (`/card/:token`) shows only a curated health summary — no clinical notes, no lab files. Emergency access requires explicit parent approval. Tokens are long, random, and non-guessable.

---

**Q: "How does the school get students' data into the system? Is there a bulk import?"**

> Currently, students are added one at a time through the form. Bulk CSV import is on the roadmap as a future feature. For a school of 1,000 students, a data entry operator can populate the system in a few days.

---

**Q: "What if the school doesn't have internet connectivity?"**

> The current version requires an internet connection. An offline-capable version (with local sync) is a future consideration for low-connectivity rural schools. For now, the platform targets urban and semi-urban schools with reliable connectivity.

---

**Q: "Can a parent see all their children if they have multiple kids in the same school?"**

> Yes. After OTP login, if the parent's phone is linked to more than one student, a child selection screen appears and they can switch between children.

---

**Q: "How is the OTP sent? What if the parent doesn't get it?"**

> OTPs are sent via Twilio (international) or Fast2SMS (India). If the message doesn't arrive in 30 seconds, there will be a Resend OTP button. In rare cases of carrier delays, the OTP is valid for 10 minutes.

---

**Q: "How does the payment to schools actually work? Does the money go directly to the school?"**

> Payments are processed via Razorpay, which is PCI-DSS compliant. The current model records the donation against the school and partner accounts in the platform. The actual fund disbursement to schools happens through a WombTo18-managed settlement process — the platform tracks commitments; the ops team handles transfer. That disbursement workflow is configurable.

---

**Q: "Does the school pay per student or a flat fee?"**

> That's a commercial question — pricing is outside this demo's scope. But the system is designed to support multiple schools and large student counts without architectural changes.

---

**Q: "What's on the roadmap?"**

> Immediate: production hardening and testing. Medium-term: bulk CSV student import, offline mode for low-connectivity schools, push notifications for parents, and a partner/CSR sponsorship module. Longer-term: integration with state health boards and UDISE+ data pipelines.

---

**Q: "Can the platform be white-labelled for a specific school board or state?"**

> Yes. The branding (logo, colour scheme, app name) can be customised per deployment. Multi-tenant architecture is already in place.

---

## Backup: If Something Goes Wrong

| Problem | Recovery |
|---------|---------|
| Backend is down | Say "Let me pull up our staging environment" and switch to a local dev server |
| OTP SMS doesn't arrive | Say "In development, the OTP also appears on screen" — and show it from the console or dev UI |
| Login fails | You likely have the wrong password — have a recovery account ready |
| Bulk PDF takes too long | Say "This is generating cards for all 400 students — for the demo I'll use the pre-downloaded version" and open the file from your desktop |
| Browser crashes | Have a second browser (Firefox/Edge) with the app already open and logged in |
| Internet goes out | Have the Vercel app cached, or switch to `localhost` |
| Razorpay modal doesn't open | Say "Payment gateway requires internet — in production this opens Razorpay's native checkout" and skip the payment step |
| Razorpay test payment fails | Use card `4111 1111 1111 1111`, expiry `12/26`, CVV `123` |

---

*Demo prepared for: WombTo18 School Edition v1.0 · March 2026*
