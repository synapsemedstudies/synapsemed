# SynapseMed: Visual and UX Recommendations

Date: 2026-11-02  
Scope: focused product/design review of the current student, admin, PYQ, quiz, and landing-page flows. This report recommends improvements to the existing product rather than proposing a larger feature set. It is based on source review; validate with a few students/faculty members before committing to visual changes.

## Product direction

SynapseMed already has a clear core: students browse past university questions and take timed quizzes; faculty manage questions, quizzes, and student records. Keep those jobs central. The best next improvements are clearer hierarchy, more readable study content, predictable interaction feedback, and honest/consistent content—not adding social, AI, gamification, or analytics systems before the core flows feel effortless.

The product should feel like a calm, trustworthy study workspace. Preserve the existing dark-indigo identity if users like it, but use glass, glow, animation, and gradients as accents rather than placing visual effects behind every surface. Study content needs to be easier to read than the surrounding chrome.

## Main opportunities

### 1. Make the student dashboard a simple “where to go next” page

The dashboard currently welcomes the student and presents both the PYQ bank and quizzes as peer modules (`src/app/(student)/dashboard/page.tsx:28-113`). It is a useful foundation, but has no clear continuation cue.

Recommended changes:

- Keep the two core actions prominent: “Browse PYQs” and “Take a quiz.”
- If the app can reliably determine a useful next step without extra query complexity, show one compact “Continue” link, such as the last opened chapter or an unfinished quiz. Otherwise omit it; do not add a history subsystem just for this card.
- Use descriptive counts and empty states. If there are no published quizzes or no PYQs, explain what the student can do rather than displaying a dead-end count.
- Remove repeated marketing descriptions from authenticated dashboard cards; use that space for immediate, actionable information.

### 2. Improve PYQ study readability and interaction clarity

The PYQ browser places navigation, filters, search, and expandable model answers in one view (`src/components/pyq/student-pyq-browser.tsx:111-433`). The hierarchy is sensible, but dense controls and dark translucent surfaces compete with long-form answers.

Recommended changes:

- Give the question and answer a strong, quiet reading surface: comfortable line length, larger body text, clear heading spacing, readable table/code formatting, and sufficient contrast. Keep the decorative glass styling around controls, not behind the main answer text.
- Make the entire question header a real button (or provide a dedicated accessible toggle button) instead of a clickable `div` (`:354-356`). Expose expanded/collapsed state with `aria-expanded` and a relationship to the answer region. This improves keyboard and screen-reader use without adding a feature.
- Rename the “Exam: {repeatYears}” chip to “Repeated in {years}” or “Exam years: {years}” so the data reads accurately (`:382-389`). Only show “Verified” or “University Model Answer” where editorial review actually happened; otherwise use a neutral “Model answer.”
- Keep search and type filters visible and usable on mobile, but reduce their visual weight and avoid a large control bar pushing questions below the fold. A compact mobile filter control is enough; do not add a complex filter drawer unless usability testing shows a need.
- Preserve selected subject/chapter and search/filter behavior while improving initial loading. Show a clear empty state and a recoverable error state for failed chapter loads.

### 3. Make quiz-taking feel safe, focused, and predictable

The quiz runner already includes a timer, answer palette, local draft persistence, and submit confirmation (`src/components/quizzes/quiz-runner.tsx`). These are high-value features for the central exam flow.

Recommended changes:

- Keep the question, answer options, and timer visually dominant; reduce glass/shine around answer choices so selected and unselected states are unmistakable.
- Clarify the auto-save promise with a small status such as “Saved on this device” and explain that drafts are browser/device-specific. Avoid implying that progress syncs across devices if it is only stored in localStorage.
- Ensure the final-submit dialog states how many questions are unanswered and gives clear “Continue quiz” and “Submit exam” actions.
- Prevent accidental ambiguous states around timeout, repeated submit clicks, network failures, and reload restoration. After a failed submit, preserve answers and provide a retry action rather than losing the attempt.
- On result screens, make score, accuracy, and correct/incorrect/unanswered counts easy to scan, then let the student review explanations. Avoid adding charts unless testing shows that they improve understanding.

### 4. Simplify the faculty admin landing page around tasks

The admin home has metric cards, tool links, explanations, roster access, and a template download (`src/app/(admin)/admin/page.tsx:29-229`). Some destinations are repeated in multiple places, which creates visual noise.

Recommended changes:

- Prioritize three common tasks: manage PYQs, create/import a quiz, and manage students. Use one clear primary action per task.
- Keep only metrics that help faculty decide what to do. Label whether counts are total or published; current “Published Quizzes” count is sourced from all quizzes (`src/app/(admin)/admin/page.tsx:14-24,107-120`), so either correct the metric or call it “Total Quizzes.”
- Move the quiz-template download into the quiz import workflow, where it is needed, rather than making it a prominent dashboard card.
- Use concise descriptions. Avoid restating the same tool link in top actions, tool cards, and right-side panels.
- Provide useful success/error feedback after create, delete, and import actions, with a safe confirmation for destructive actions and a clear indication of what was changed.

### 5. Improve landing-page trust and reduce unsupported claims

The landing page has a clear headline and sign-in/create-account actions (`src/app/page.tsx:60-97`), but includes time-sensitive or technical claims that need maintenance and proof.

Recommended changes:

- Replace the dated “Spring 2026 Medical Cohort System Live” label (`src/app/page.tsx:63-66`) with timeless copy or data that is actually maintained.
- Replace “zero lag” (`:76-79`) with a truthful benefit such as “practice with timed quizzes and instant scoring”; performance claims should only be made after measured results exist.
- Verify the claims about PostgreSQL RLS and role enforcement (`:170-183`) against the deployed configuration. If they are not demonstrably true in production, remove or correct the claim. Trust is more valuable than technical-sounding marketing.
- State exactly who can create an account and whether student registration requires an invitation or institutional approval. The page currently presents open student signup (`:41-53,81-96`); align that message with the actual onboarding policy.
- Keep a single primary CTA and one secondary sign-in action. Reduce repeated feature pills and duplicated “Get Started” calls if they do not answer a user question.

### 6. Establish a small, consistent visual system

Current UI uses Space Grotesk/Inter, indigo and sky accents, many fine borders, high blur, glow, and animation. Consistency matters more than a redesign.

Recommended changes:

- Define a compact set of tokens for page background, panel, reading surface, primary/secondary text, border, focus ring, success/warning/error, spacing, radius, and elevation.
- Reserve bright indigo for primary actions and active selection; use neutral surfaces for long-form study content. Avoid using multiple competing accent colors for nearby controls.
- Standardize button sizes and states across landing, student, and admin pages: default, hover, focus-visible, disabled, loading, and destructive.
- Check contrast at actual rendered opacity. Text on translucent backgrounds can become unreadable as the background changes.
- Respect `prefers-reduced-motion`, keep focus indicators visible, use semantic headings/forms/buttons, and maintain touch targets around 44px on mobile.
- Retain the current responsive shell/navigation (`src/components/ui/student-shell-client.tsx` and `src/components/ui/mobile-bottom-nav.tsx`) unless usability testing identifies a concrete problem; three main student destinations are a manageable information architecture.

## Recommended order of work

### Pass 1 — Correctness and trust

Correct inaccurate counts/labels and time-sensitive landing copy. Verify signup and security claims. Ensure import failures, quiz-submit errors, and destructive operations communicate the real result. These are small, high-confidence changes.

### Pass 2 — Reading and quiz ergonomics

Improve PYQ typography and answer hierarchy, make expand/collapse controls accessible, and refine quiz submit/save/timeout feedback. Test with a phone-sized viewport and keyboard-only navigation.

### Pass 3 — Navigation and admin clarity

Remove duplicated admin links, put templates in context, and simplify dashboard cards. Confirm that students can reach PYQ and quizzes in one obvious step and faculty can start each main management task quickly.

### Pass 4 — Visual polish after real-user feedback

Tune blur, glow, animation, and color only after reading and task flow are clear. Compare a restrained-glass variant with the current look on mobile and desktop; keep the version users find clearer and faster to scan.

## Small validation plan

Ask 3–5 target users (a mix of students and faculty) to complete these tasks without coaching: find a chapter and reveal a model answer, search/filter questions, start and submit a quiz, find their result, create or import a quiz, and locate a student roster entry. Observe hesitation, misclicks, and questions; do not lead users toward the expected controls.

For each flow, record completion, errors, time to first useful content, and the point where users pause. Also test keyboard-only navigation, reduced motion, and a narrow mobile viewport. Fix repeated points of confusion before adding any new capabilities.

## Explicitly avoid for now

Do not add chat, social feeds, leaderboards, badges, AI tutors, advanced analytics dashboards, recommendation engines, complex personalization, or multi-step onboarding unless a validated user need emerges. These increase implementation, privacy, moderation, support, and maintenance costs while distracting from the current core jobs.

Do not redesign the whole site or replace the current stack just to make it feel modern. Do not add new settings, navigation categories, or dashboards when a clearer label, better default, or contextual action solves the problem.

## Success criteria

The site should make it obvious what students and faculty can do next; put study content ahead of decoration; make important actions understandable and recoverable; work by keyboard and on mobile; and avoid claims or metrics that are not true. New feature work should be accepted only when it improves one of those outcomes enough to justify the extra complexity.
