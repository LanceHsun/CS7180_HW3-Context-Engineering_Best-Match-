# BestMatch Demo: Video Script (Conversational Style)

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
