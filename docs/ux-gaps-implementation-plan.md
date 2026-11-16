# Qasberry UX Gaps: Implementation Plan

Source: *Qasberry Site Gaps & Suggestions* (UX review, 12 items).
Scope: every item except **#04 Pricing**, which waits on the payment decision (pay for access vs. pay for certificates).

The work is split into five phases. Each phase can ship on its own, and the earlier phases are smaller and lower-risk. Every item lists what's wrong, why it happens (found by reading the code), the fix, the files involved, and how we'll know it's done.

| Phase | Theme | Review items | Size |
|---|---|---|---|
| 1 | Broken things | #11, #12, #06, #07 | Small, about 1 day |
| 2 | Navigation and consistency | #01, #10 | Medium, 2–3 days |
| 3 | Audience and age groups | #05, #02 | Medium, 2–3 days (includes a database change) |
| 4 | Learning experience | #03, #08 | Medium, 2–3 days |
| 5 | Reading support | #09 | Medium, 2 days |
| Later | Pricing | #04 | Waits on the payment plan |

---

## Decisions needed before we start

These belong to the product team, not to engineering. The phase each one blocks is in brackets.

1. **Real social profile links** for X, LinkedIn and any others (Instagram, YouTube?). [Phase 1]
2. **The new audience name** that replaces "Youths". Proposal: **"Kids & Teens"**. Alternatives: "Young Learners", "Ages 6–16". [Phase 3]
3. **Age bands.** The review suggests 6–9, 10–12 and 13–16. Can one course belong to more than one band (for example, a course for ages 10–16)? Proposal: yes, a course can be tagged with one or more bands. [Phase 3]
4. **Should the rest of the marketing site (Courses, Youth page, legal pages) adopt the new robotics design with light and dark modes?** Proposal: yes. It's the biggest single cause of the "inconsistent frames" feeling in #10. [Phase 2]

---

## Phase 1: Fix what's broken

**Status: done (16 Nov 2026).** One thing is still open: the real social profile URLs need to be added to `lib/site.ts`. Until then the footer hides the social icons.

Small, contained bug fixes. No design decisions involved, apart from the social links.

### #11 "Sign in to join and post" disappears on hover (Kids Hub)

- **Cause:** the link turns its text white on hover (`hover:text-white`), but the page background is white, so the text vanishes. It's left over from an older dark design.
- **Fix:** use a visible hover color (violet text with a violet dashed border) to match the rest of the light pages.
- **Files:** `components/community/community-feed.tsx` (around line 136).
- **Done when:** hovering the CTA keeps the text readable, with a contrast ratio of at least 4.5:1.

### #12 Back button hidden under the nav bar (Kids Hub)

- **Cause:** the nav bar is fixed to the top of the screen (about 88px tall), but the community page starts its content only 48px down (`py-12`). The "← All Communities" link sits underneath the nav. The back link also uses the same white-on-white hover color as #11.
- **Fix:** give the page the same top spacing as the other marketing pages (`pt-32`) and fix the hover color. Phase 2's shared page layout prevents this from happening on future pages.
- **Files:** `app/community/[slug]/page.tsx`.
- **Done when:** the back link is fully visible below the nav at phone and desktop widths.
- **Note:** the Kids Hub is currently switched off (`SHOW_COMMUNITY = false` in `lib/features.ts`). We fix it now so it's ready when it's switched back on.

### #06 Misleading footer links

| Link | Goes to today | Fix |
|---|---|---|
| Help Center | `/courses` | Build a real `/help` page: FAQs for learners, parents and teachers, plus a contact email |
| Case Studies | `/community` | Remove it. It only appears while the community is on, and there's no case-study content yet |
| Certificates | `/dashboard` | Link to `/dashboard?tab=certificates`. This opens the Certificates tab built in Phase 4 (#08). Until then it scrolls to the certificates section |
| My Dashboard | `/dashboard` | Keep it. This one is correct |

- **Files:** `components/marketing/footer.tsx`, new `app/(marketing)/help/page.tsx`.
- **Done when:** every footer link leads to the page its label promises.

### #07 Generic social links and icons

- **Cause:** the links point to `twitter.com`, `linkedin.com` and `qasberry.com` rather than Qasberry's profiles, and the icons are stand-ins (a paper plane for Twitter, an @ sign for LinkedIn).
- **Fix:** use the real profile URLs (decision 1), the official X logo and LinkedIn logo as small inline SVGs (the icon library we use doesn't include brand logos), and accessible labels such as "Qasberry on X".
- **Files:** `components/marketing/footer.tsx`, plus a new `components/shared/brand-icons.tsx`.
- **Done when:** every social icon opens the correct Qasberry profile in a new tab and shows the official logo.

---

## Phase 2: Navigation and consistency

**Status: done (16 Nov 2026).** Decision 4 was approved: every marketing page now uses the robotics design with light and dark modes. Three differences from the original plan:
- **Two page widths, not three.** The course page now uses the same width as the catalog, so content doesn't shift sideways when you open a course.
- **The Sales & Marketing page wasn't converted.** That track is switched off and the page redirects away, so its sections still use the old light design. Move it onto `MarketingShell` when the track is switched back on.
- **No crossfade between pages.** Next.js doesn't support one natively, so every page uses only the shared entry animation.

### #01 The nav doesn't show where you are

- **Cause:** nav links are plain links with no active state. Three of them ("Why Qasberry", "How it works", "Tracks") point to sections of the homepage rather than separate pages, so a simple "current page" check isn't enough.
- **Fix:**
  - **Page links** (Courses, Youth): highlight the link when the current address matches, including sub-pages, so `/courses/some-course` still highlights "Courses".
  - **Homepage section links:** highlight the link for the section currently on screen, updating as the user scrolls.
  - **Look:** a pill-shaped background that slides from one active link to the next. The slide only runs when the active link changes, which is occasional, so it won't feel busy.
  - **Accessibility:** mark the active link as the current page for screen readers (`aria-current="page"`), and apply the same state in the mobile menu.
- **Files:** `components/marketing/marketing-nav.tsx`, plus a small new scroll-tracking hook in `components/marketing/robotics/`.
- **Done when:** at any point on any marketing page, exactly one nav item (or none, on pages not in the nav) shows as active, on desktop and in the mobile menu.

### #10 Inconsistent frame sizes and transitions between sections

- **Cause:** three separate things combine:
  1. **Different page widths and top spacing.** The homepage uses `max-w-7xl`, a course page `max-w-6xl`, legal pages `max-w-4xl` and community pages `max-w-3xl`. Top spacing varies too (`pt-32`, `py-12`, none). Content jumps sideways and vertically as you move between pages.
  2. **Two visual languages.** The homepage now uses the robotics design with light and dark modes, while Courses, Youth and the legal pages use the older light design. Going from the homepage to Courses switches the whole look.
  3. **The nav changes size** when you scroll (1200→1100px wide, 72→62px tall), so it looks different from page to page depending on scroll position.
- **Fix:**
  1. **A shared page layout** (`MarketingShell`) for every marketing page. It provides the nav, the footer, the correct top spacing below the fixed nav, and a fixed set of widths: **wide** (catalog and homepage), **standard** (course detail) and **reading** (legal and help pages). Pages choose a width; they don't set their own.
  2. **Extend the robotics design to all marketing pages** (decision 4), using the same color tokens, so light and dark mode work everywhere and the toggle appears on every page.
  3. **Keep the nav one size.** Scrolling only changes its background (more solid, with a shadow); it no longer shrinks.
  4. **One page-entry animation for every page:** content fades in and rises 8px over 250ms, plus a short crossfade between pages where the browser supports it. No per-page variations.
- **Files:** new `components/marketing/marketing-shell.tsx`; every page under `app/(marketing)/` and `app/community/`; `components/marketing/marketing-nav.tsx`; the `components/kids/*` sections (Youth page).
- **Done when:** clicking through every nav item keeps the nav still, the content edges line up, every page uses the same entry animation, and light and dark modes work on every page.

---

## Phase 3: Audience and age groups

**Status: done (16 Nov 2026).** Decisions 2 and 3 were approved: the audience is called **Kids & Teens**, and a course can belong to more than one age band. Notes:
- **New address:** the page moved from `/youth` to **`/kids-teens`**. `/youth` and the older `/kids` both redirect there permanently.
- **Database:** migration `20261116120000_p3_course_age_groups` was applied. It is additive: a new `AgeGroup` enum and an `ageGroups` column on courses. Every existing course was tagged with all three bands, so each course currently appears under every age filter. **Next step for the content team:** open each course in Admin, select the bands it really suits, and save.
- **Course cards:** the age range replaces the duplicate difficulty badge. Difficulty still shows in the card footer.
- **Extra fix:** browser tab titles no longer repeat "| Qasberry" twice.
- **Not changed:** the career name shown on course cards ("Kids") comes from the database. It's safe to rename it to "Kids & Teens" in Admin → Settings: the rename changes its slug to `kids-and-teens`, which is now on the list of visible slugs in `lib/features.ts`. Any other new name needs its slug added to that list first, or every course disappears from the public site.

### #05 "Youths" doesn't say the platform is for children too

- **Fix:** rename the audience everywhere it appears, using the name from decision 2 (proposal: "Kids & Teens").
- **Where "Youth" appears:** the nav label, the audience definitions (`components/marketing/audiences.ts`), the homepage hero, the dashboard, the privacy page and the 11 sections of the Youth page (`components/kids/*`).
- **The page address:** move `/youth` to a new address that matches the name (for example `/kids-teens`), with a permanent redirect so old links keep working.
- **Not changing:** the internal database names (`kid` and `youth`), so existing courses, enrollments and certificates aren't affected.
- **Done when:** no user-facing text says "Youth" or "Youths", and `/youth` redirects to the new page.

### #02 Only one broad age range ("Ages 6–16")

- **Cause:** courses have no age information. The only age shown is a hard-coded "Ages 6–16" label on the audience card.
- **Fix:**
  1. **Database:** add age bands to courses (6–9, 10–12, 13–16, per decision 3), allowing more than one band per course. A migration fills in all bands for existing courses, so nothing disappears.
  2. **Admin:** add an "Age groups" checkbox field to the course create and edit forms, next to Difficulty.
  3. **Course catalog:** age-band filter chips ("All ages · 6–9 · 10–12 · 13–16") that are kept in the address bar, so a filtered list can be shared as a link.
  4. **Course cards and course pages:** show an age badge such as "Ages 10–12".
  5. **Homepage and Kids & Teens page:** replace the single audience card with three age-band tiles, each linking to the filtered catalog and showing its course count.
- **Files:** `prisma/schema.prisma` plus a migration, `components/admin/course-form/index.tsx`, `components/admin/course-edit-form/index.tsx`, the admin course save route, `app/(marketing)/courses/page.tsx`, `app/(marketing)/courses/[slug]/page.tsx`, `components/marketing/audience-section.tsx`, `components/kids/kids-pathways.tsx`.
- **Done when:** an admin can tag a course with age bands, visitors can filter the catalog by age, and every course shows its age range.

---

## Phase 4: Learning experience

**Status: done (16 Nov 2026).** Notes:
- **Free previews actually play now.** The course page's old "Free Previews" list only showed lesson titles. It now plays the lessons: Mux videos (using short-lived tokens signed on the server), YouTube and Drive links, and readings, with no sign-in needed. Only lessons an admin has marked as free previews are ever served; the playback check for enrolled learners is unchanged.
- **Action needed: no lessons are marked as free previews yet.** Until the content team ticks "Free preview" on at least one video or reading lesson per course, the catalog badge, the "Watch a free lesson" button and the player stay hidden. A warning now appears in Admin on every published course with no free-preview lesson.
- **Homepage demo:** no screen recording was available, so "Peek inside a lesson" is an animated mock-up built from a real published course: its lesson topics, video lengths, a reading excerpt and its first quiz question. It never loads which answer is correct, so it doesn't highlight any choice.
- **Catalog badge:** the whole card already links to the course page, so the "Free preview" badge is a label. The course page's "Watch a free lesson" button jumps to the player.
- **Dashboard tabs:** "Continue" now opens the first unfinished lesson. It used to always open lesson one.

### #03 No preview of what a lesson looks like

- **What already exists:** lessons can be marked as free previews (`isFree`), and the course detail page already plays free preview videos. The gap is that visitors only find this out after opening a course, and many courses may not have a preview lesson marked.
- **Fix:**
  1. **"Peek inside a lesson" section on the homepage:** a short looping demo of a real lesson (video, reading, quiz, project), placed between "Why Qasberry" and "How it works". It uses the same light and dark tokens.
  2. **"Free preview" badge** on catalog cards for courses with at least one free lesson, linking straight to the preview on the course page.
  3. **"Watch a free lesson" button** at the top of the course page, next to Enroll, that jumps to and plays the first free lesson. This follows Udemy's pattern.
  4. **Admin nudge:** a warning on the course edit screen when a published course has no free preview lesson.
- **Content needed:** a 20–40 second screen recording of a real lesson for the homepage demo. Until it exists, we'll use an animated mock-up built from real lesson screenshots.
- **Files:** new `components/marketing/lesson-preview-section.tsx`, `app/(marketing)/page.tsx`, `app/(marketing)/courses/page.tsx`, `app/(marketing)/courses/[slug]/page.tsx`, `components/admin/course-edit-form/index.tsx`.
- **Done when:** a visitor can see what a lesson looks like from the homepage, and every course with a free lesson advertises it in the catalog.

### #08 Dashboard needs In Progress / Completed / Certificates tabs

- **Today:** the dashboard is one long page with an enrollments list and a certificates section underneath.
- **Fix:** three tabs, following Coursera's pattern:
  - **In Progress:** enrolled courses that aren't finished, most recently studied first, each with a progress bar and a "Continue" button that opens the next unfinished lesson.
  - **Completed:** finished courses, with a "Review" button and a link to the certificate.
  - **Certificates:** certificate cards with View and Download.
  - Each tab shows a count in its label, for example "In Progress (2)".
  - The selected tab is kept in the address bar (`?tab=certificates`), so links work, including the footer link from Phase 1, and the browser Back button behaves as expected.
  - Each empty tab has a friendly message, for example: "No completed courses yet. Finish your first course to see it here."
- **Files:** `components/dashboard/dashboard-client.tsx`, `app/dashboard/page.tsx` (to sort and split enrollments on the server).
- **Done when:** a learner can switch between the three tabs, every course appears in exactly one of In Progress or Completed, and `/dashboard?tab=certificates` opens straight to Certificates.

---

## Phase 5: Reading support for young learners

**Status: done (16 Nov 2026).** Notes:
- **Where Listen appears:** reading lessons (above the text), each quiz question (a speaker button that reads the question and every answer choice), and course descriptions on the public course page.
- **Highlighting:** the sentence being read is shown in a highlighted caption above the text, so the lesson's own formatting stays untouched.
- **More natural reading:** generic lesson titles such as "Reading" are skipped when the text already starts with a heading. All-capitals headings are read in normal case, because some voices spell capitals out letter by letter. Acronyms such as "AI" stay as they are.
- **Reading help switch:** it's in the account menu (avatar), it's on by default, and it's saved per device. Turning it off hides every Listen control and returns icons to their normal size.
- **Icons beside labels:** lesson-type labels and sidebar icons (Video, Reading, Quiz), plus Mark Complete, Back to Dashboard, Submit Quiz, and the dashboard's Continue and Review buttons.
- **Not tested on a signed-in lesson page:** the lesson page needs an enrolled learner. The Listen bar and the quiz speaker were tested on a temporary page using real lesson text, with the same components, which has since been deleted.

### #09 Read-aloud audio and icons for pre-readers

- **Fix:**
  1. **"Listen" button** on reading lessons, course descriptions and quiz questions. It uses the browser's built-in text-to-speech, so there are no audio files to produce and no running cost. Controls: play/pause, speed (slower, normal) and highlighting of the sentence being read. It's hidden on the rare browser with no text-to-speech support.
  2. **Icons beside labels** on the main learner screens (dashboard tabs, lesson types, buttons such as Continue, Quiz, Certificate) so children who can't read yet can still find their way. Icons sit next to text and never replace it.
  3. **A "Reading help" setting** in the user menu that turns read-aloud buttons and larger icons on or off. It's saved per device and on by default for the Kids & Teens audience.
- **Files:** new `components/shared/read-aloud.tsx` and `lib/use-speech.ts`; the lesson reading view under `app/learn/[courseId]/[lessonId]/`; the quiz components; the dashboard; the user menu.
- **Done when:** a learner can press Listen on any reading lesson or quiz question and hear it read, with the current sentence highlighted, and the main learner screens show an icon beside every label.
- **Later improvement:** recorded human narration for flagship courses, if browser voices turn out to sound too robotic for younger children.

---

## Later: #04 Pricing

On hold until the payment plan is decided. When it is, the change mostly affects the CTA banner ("No credit card required"), the course cards and the course page price box, and possibly a new `/pricing` page. Phase 2's shared layout and design will make that page quick to add.

---

## How we'll run each phase

1. Agree the decisions that phase needs (listed at the top).
2. Build the phase on its own branch.
3. Check every changed page in light and dark mode at phone and desktop widths, and run the typecheck and production build.
4. Review the changes together and merge, then start the next phase.
