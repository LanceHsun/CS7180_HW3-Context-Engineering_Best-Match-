# BestMatch Demo: Video Script (Conversational Style)
# Version2
### **Speaker 1: Product & Frontend Lead**

**Goal:** Introduction and the "What & How" of the User Experience.
**Duration:** ~5 Minutes

#### **Intro: The Reality Check (0:00 - 0:45)**

"Hey everyone! Let’s be real—job hunting today is a nightmare. You’re shouting into a void, manually tweaking your resume for the 50th time, and getting 'search fatigue.' I’m **[Speaker 1 Name]**, the frontend lead for **BestMatch**. We built this AI-driven dashboard to flip the script. Instead of *you* chasing jobs, your 'Master Resume' works for you 24/7. Think of this video as a live walkthrough of our technical journey."

#### **Part 1: The Onboarding Flow (0:45 - 2:45)**

*[Action: Screen shows the Landing Page]*
"As the frontend lead, I focused on making the entry point frictionless. We’re using **Next.js 15** with **Shadcn UI**.
*[Action: Drag a PDF into the dropzone]*
When a user drops a resume, we don't just 'read' it; we stream it to the backend for a full persona extraction.
*[Action: Point to the 'Target Role' edit field]*
One thing we realized during testing was that AI isn't always 100% perfect on intent. So, I implemented this editable 'Target Role' card. It uses **Zod validation** on the client side to ensure the data is clean before it ever hits our database. It puts the user back in control."

#### **Part 2: The Dashboard & Returning User (2:45 - 4:15)**

*[Action: Show the Dashboard with Match History]*
"Once you're in, the Dashboard is your mission control. You’ll see your **Match History** with these custom **ScoreBadges**. We set a strict 70% threshold—if a job isn't a high-probability fit, it doesn't clutter your view.
*[Action: Click 'Update Resume' or 'Preferences']*
I also built the Preferences card where you can toggle your email digest frequency. Everything here is built with **A11y (Accessibility)** in mind and is fully responsive."

#### **Part 3: The Auth Pivot (4:15 - 5:00)**

"Now, here’s a peek into our development process. Originally, we wanted a 'Silent Sign-in' where you'd click 'Start Receiving Matches' and magically be inside the dashboard. But, as our **[Memory Document](https://github.com/LanceHsun/CS7180_HW3-Context-Engineering_Best-Match-/blob/main/DEMO_SCRIPT.md)** shows, bridging that anonymous session to a secure account was a massive hurdle. We decided to pivot to a cleaner, more reliable **Magic Link** flow. Now, users move from the extraction results directly to a sign-in page, keeping the security rock-solid without the 'link expired' headaches we faced during the prototype."

---

### **Speaker 2: Backend & AI Lead**

**Goal:** Technical deep-dive, AI implementation, and overcoming challenges.
**Duration:** ~5 Minutes

#### **Part 4: Under the Hood - The AI Engine (5:00 - 6:30)**

"Thanks, **[Speaker 1]**! I’m **[Speaker 2 Name]**, and I handled the backend and AI integration.
*[Action: Switch to VS Code, showing `api/match/run/route.ts`]*
Our core engine uses **Gemini 1.5 Pro**. The real 'secret sauce' isn't just the model; it’s the **Prompt Engineering**. We gave the AI an 'Expert Recruiter' persona to analyze job descriptions against user profiles.
*[Action: Scroll to the Zod schema in the code]*
To make this production-ready, we used **Zod schemas** to force the AI to output strictly typed JSON. If the AI hallucinates, the schema catches it, and we don't save bad data to **Supabase**."

#### **Part 5: The 'API Key' Challenge (6:30 - 7:45)**

"One of the biggest 'real-world' problems we hit was **API Quotas**. When you're building a project on free-tier AI, you hit rate limits *fast*.
*[Action: Show the fallback logic or environment variable list]*
To solve this, I implemented a robust **multi-model fallback and key rotation system**. If Gemini 1.5 Pro is exhausted, the system automatically falls back to **Gemini 2.0 Flash**. We also set up a rotation for our API keys to ensure that our Cron jobs—which scan for jobs every night—never fail due to a '429 Too Many Requests' error. It’s not elegant, but it made the app resilient."

#### **Part 6: Reliability & Collaboration (7:45 - 9:15)**

"We treated this like a professional engineering project.
*[Action: Show GitHub Actions/CI Pipeline]*
We have a hard rule: **80% test coverage**. I wrote over 20 unit tests for the matching logic alone. Our CI pipeline, which we built using **GitHub Actions**, blocks any code that lowers that coverage or fails our **Playwright** E2E tests.
Regarding AI in our workflow: we didn't just use AI to write code. We used **Claude** to architect the data flow and **Antigravity** as our IDE agent to maintain consistency across the stack. This helped us stay synced even when working on separate ends of the project."

#### **Outro: Reflections (9:15 - 10:00)**

"Reflecting on the last few weeks, our biggest win wasn't just the code—it was how we handled the pivots. From fighting Magic Link redirection bugs on Vercel to managing our API quotas, we focused on evidence-based fixes rather than guessing.
**BestMatch** is the result of that 'engineering-first' mindset. It’s efficient, it’s tested, and it actually works. Thanks for watching our walkthrough!"
# Version1
## Intro: The Reality Check (0:00 - 0:45)

"Hey everyone! So, let’s be real for a second—job hunting today is kind of a nightmare, right? You’re scrolling through endless boards, manually tweaking your resume for the 50th time, and it just feels like shouting into a void.

Well, that’s exactly why we built **BestMatch**. It’s an AI-centric dashboard that flips the script. Instead of _you_ chasing jobs, we have your 'Master Resume' work for you in the background, 24/7. Let me show you how it works."

---

## Part 1: The New User Experience (0:45 - 3:30)

**[Action: Screen shows the Landing Page]**
"Imagine I’m a first-time user. I just landed on the site. No tedious sign-up forms yet—we want to get straight to the value."

**[Action: Dragging a PDF into the dropzone]**
"I’m just gonna grab my resume here and drop it in. Now, look at this..."

**[Action: Pointing at the ScanLine animation]**
"That glowy scan line isn't just for show. Right now, our backend is streaming this PDF to Gemini 1.5 Pro. We’re not just 'reading' text; we’re extracting a full professional 'persona.' And check this out..."

**[Action: Showing the Extraction Panel]**
"It pulled out my skills like React and Next.js, and even my current role title. Now, here’s a key detail: if the AI gets my title slightly off, or if I want to pivot to a more specific 'Target Role,' I can just click and edit it right here. It’s all about putting me in the driver’s seat before the system starts searching."

**[Action: Clicking 'Start Receiving Matches']**
"Now, watch. I click this, and boom—I’m redirected to my dashboard. Notice I didn't have to set a password? We use 'Silent Auth' with Supabase, so my account is created in the background. My focus stays on the jobs, not the setup."

---

## Part 2: Returning & Updating (3:30 - 6:00)

**[Action: Showing the Login Page / Magic Link UI]**
"Let’s say I’m coming back a few days later. I just pop in my email, and I get a Magic Link. No passwords to leak, no passwords to forget. It’s super clean and secure."

**[Action: Showing the Dashboard with populated Match History]**
"Landing on the dashboard, you see my **Match History**. See these badges? They show the exact match percentage. We’ve set a strict bar: only roles with a **70% match or higher** make the cut. If it’s not a high-probability fit, it doesn't even show up. I can see at a glance exactly how well I fit each role without any fluff—just the numbers that matter."

**[Action: Clicking 'Update Resume' dialog]**
"But here’s the cool part. Let’s say I just finished a big project and learned a bunch of new stuff. I don't want to start over. I just hit 'Update Resume,' drop the new version in, and the system re-syncs everything.

My profile cards update instantly, and my next batch of matches will reflect my new skills. It’s a living profile that grows with me."

---

## Part 3: Under the Hood (6:00 - 8:00)

**[Action: Switching to VS Code and GitHub]**
"Alright, for the technical folks out there—we didn't just 'hack' this together. This is built for the long haul."

**[Action: Showing the CI Badges in README]**
"Check the badges on our repo. We’ve got a mandatory **80% test coverage** rule. If our matching logic or API routes aren't tested, our CI pipeline literally blocks the deployment. We’re using Vitest for the heavy lifting and Playwright to make sure the user flows don't break on the front end."

**[Action: Showing the Evaluation Dashboard table]**
"We also have automated security scans running with CodeQL because, well, your data matters. It’s all integrated into a multi-stage GitHub Actions pipeline."

---

## Part 4: The AI Secret Sauce (8:00 - 9:30)

**[Action: Showing some code in lib/ai.ts]**
"Finally, people ask how we built this so fast. It was all about **AI Mastery**.

We didn't just ask an AI to 'write a website.' I used Claude for the big-picture architecture—mapping out how data flows from the PDF to Supabase. Then, I used our IDE agent, Antigravity, to actually implement the code within the project context.

We even engineered custom Prompt templates to make sure Gemini outputs rock-solid JSON every single time. It’s a true collab between human design and AI execution."

---

## Outro: The Close (9:30 - 10:00)

"And that’s BestMatch. It’s efficient, it’s intelligent, and it takes the 'work' out of finding work. Thanks for watching, and I can't wait to hear what you think!"
