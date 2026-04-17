**SYSTEM FLOW (SIMPLE VERSION)**

1. JOBS COME IN (Automation layer - n8n)

* Every day (e.g., morning + evening), a scheduler runs
* It fetches jobs from sources (company sites, Greenhouse, Lever, etc.)
* It sends those jobs to your backend via an API

Think: “Bot goes out, collects jobs, sends them home”

---

2. BACKEND RECEIVES JOBS (NestJS - Ingestion)

* Your backend receives each job
* It validates the data (makes sure nothing is broken)
* It cleans/normalizes the data (title, location, etc.)

Think: “Security + cleanup at the gate”

---

3. DEDUPE CHECK (Important step)

* Backend checks: “Do we already have this job?”
* Uses:

  * job ID (if available)
  * URL
  * content hash (job text)
* If duplicate → update existing
* If new → create new entry

Think: “No duplicates, no clutter”

---

4. STORE JOB (Database - Postgres)

* Job is saved in the database
* Metadata like:

  * company
  * title
  * location
  * description
  * timestamps

Think: “Everything goes into your personal job database”

---

5. SCORING (Matching engine)

* Backend compares job vs YOUR profile:

  * title match
  * tech stack match
  * country (Germany / Netherlands)
  * experience level
  * visa/remote signals
* Generates:

  * score (e.g., 8.5/10)
  * strengths
  * red flags

Think: “How good is this job FOR YOU?”

---

6. (OPTIONAL) AI ENHANCEMENT

* AI improves scoring + explains reasoning
* Gives insights like:

  * “Strong Node.js match”
  * “German language preferred (risk)”

Think: “Smart assistant reviewing each job”

---

7. APPLICATION RECORD CREATED

* Every job gets an application state:

  * new
  * shortlisted
  * applied
  * rejected
  * etc.

Think: “Tracking system for your job hunt”

---

8. TOP JOBS SURFACE TO YOU (Frontend)

* Dashboard shows:

  * best jobs first
  * filtered by score, country, etc.

Think: “Only high-quality jobs reach you”

---

9. YOU TAKE ACTION (Human step)

* You:

  * shortlist good jobs
  * skip bad ones
  * mark applied

Think: “You stay in control — no blind automation”

---

10. AI DRAFT GENERATION (When needed)

* For shortlisted jobs:

  * generates tailored summary
  * suggests CV bullets
  * writes recruiter message

Think: “Prepares your application, you finalize it”

---

11. TRACKING + PROGRESS

* System tracks:

  * what you applied to
  * what got rejected
  * what reached interview

Think: “Your personal job CRM”

---

12. DAILY LOOP

* Next day:

  * new jobs come in
  * old jobs updated
  * new matches appear

Think: “Continuous pipeline working in the background”

---

**ONE-LINE SUMMARY**

Automation finds jobs → backend filters + scores → you only see the best → you apply faster and smarter.

---

**MENTAL MODEL**

n8n = “job collector”
NestJS = “brain + decision engine”
Postgres = “memory”
Frontend = “control panel”
You = “final decision maker”

---

**WHY THIS WORKS**

* Saves time (no manual searching)
* Avoids spam applications
* Focuses on high-probability roles
* Keeps everything organized
* Scales as you grow

---

If something breaks, debug flow in this order:

1. Did jobs get fetched?
2. Did backend receive them?
3. Did dedupe block them?
4. Did scoring run?
5. Are they visible in dashboard?

Fix the broken step — pipeline resumes.
