# Msanga web: code map

Where everything lives, and why. Kept up to date with every milestone.

_Last updated: M3b-2 your set (14 Nov 2026)_

## M3b-2: your set (14 Nov 2026)

Against the API's `PUT /api/communities/{id}/membership/set` and `GET /api/communities/{id}/sets/{year}` (M3b-1).
Decided 14 Nov 2026: each school names its sets by leaving year (default) or entry year; shown as **"1998 Set"**;
house, class arm, hostel, department are free text (tidied later with AI).

| File | What it does |
|---|---|
| `src/components/schools/SetForm.tsx` | "Your set": the sets your years allow ("1998 Set"…), the suggested one chosen for you (none if you left early), a hint saying how this school names its sets; then the details for the school's level (secondary: house, class arm, hostel; university / polytechnic: department; primary: none), all optional |
| `src/components/schools/MembershipPanel.tsx` | joining goes straight on to "Your set" ("Now choose your set"); shows "Your set: 1998 Set · Blue House · SS3B" (link to the set) or "You haven't chosen your set yet"; **Choose / Change your set**; new years that no longer fit clear the set ("choose it again"); the heading takes the focus at once (no frame delay) |
| `src/pages/schools/SchoolPages.tsx` | + **`SetPage`** (`/schools/:schoolId/sets/:year`: "1998 Set at …", "This is your set.", "Who's here" until M3c; only for people who joined the school, otherwise "Go to the school"); My Schools shows "You: 1992–1998 · 1998 Set · details"; the school's Sets box says how its sets are named |
| `src/api/communities.ts` | `Community.setNaming`; `Membership` + set and details; `MySet`, `SchoolSet`; `membershipApi.chooseSet`, `membershipApi.set` |
| `src/components/schools/schoolText.ts` | + `detailsText` ("Blue House · SS3B") |
| `src/App.tsx` | + the set's route |
| `src/mock/homeData.ts`, `src/api/auth.ts` | "Class of 1998" → "1998 Set" in the made-up Home data |
| `src/test/fakeApi.ts` | + set naming per school, suggestions / choices like the API, `PUT …/membership/set`, set pages (403 unless joined), years that no longer fit clear the set; `api.schools` |
| `src/pages/schools/Sets.test.tsx` | choose a set with details (secondary), left early (no guess), by entry year, department (university), years no longer fit, members only |

## M3a-2: "Were you a student here?" (14 Nov 2026)

School first, then the year (see the roadmap). Against the API's `/api/communities/{id}/membership` and
`/api/me/schools` (M3a-1). Only ever the signed-in member's own membership.

| File | What it does |
|---|---|
| `src/components/schools/MembershipPanel.tsx` | on a school's page: "Were you a student here?" → **Yes, I was a student here** → the years form (started, left: this year back to 1940; "Did you finish here?"), checked here with the API's rules; joined: "1992–1998 · Finished here", "Not confirmed yet", **Change years** (the form, filled in), **Leave this school** (asked on the page: Yes, leave / Keep it). Focus: the form's first field when it opens, the box's heading after; what happened is announced (`role="status"`) |
| `src/components/schools/schoolText.ts` | + `membershipKey`, `MY_SCHOOLS` (query keys), `yearsText` |
| `src/api/communities.ts` | + `Membership`, `SchoolYears`, `membershipApi` (`mine` gives null when not joined, `join`, `change`, `leave`, `mySchools`), `EARLIEST_YEAR`, `MAX_YEARS_AT_ONE_SCHOOL` |
| `src/pages/schools/SchoolPages.tsx` | the school's page shows the panel; **My Schools** lists your schools with "You: 1992–1998 · Finished here", most recent first, then Find another school |
| `src/components/schools/SchoolResult.tsx` | can show extra lines under a school (your years) |
| `src/components/forms/fields.tsx` | `SelectField` takes a `ref` (to move the focus to it) |
| `src/auth/useSession.ts` | **signing out forgets everything the page remembered for that member** (their schools, memberships, searches), not just "who is signed in", so the next person on this browser never sees it |
| `src/styles.css`, `styles/schools.css` | `.button-danger` (white on deep red 6.6:1), the years form (two lists side by side, stacked on phones) |
| `src/test/fakeApi.ts`, `renderApp.tsx` | + memberships (`api.memberships`) and `/api/me/schools`; `renderApp` also returns the query `client` |
| `src/pages/schools/Membership.test.tsx` | join (focus, status, saved years), years checked before sending, change (filled in), leave (asked first, Keep it), My Schools (order, a school just joined), forgotten on sign-out |

## M2d: Add your school (14 Nov 2026)

Against the API's `POST /api/communities` (M2b).

| File | What it does |
|---|---|
| `src/pages/schools/AddSchoolPage.tsx` | `/schools/new`: name (starts as `?name=`, from a search that found nothing), kind (radio buttons), country (Nigeria first), state (Nigeria: the list; elsewhere optional text), town, other names (commas, up to 5). Checked before sending. "Is it one of these?" (LooksLike: the schools, and "No, it's none of these: add my school" = the same details with `addAnyway`) or "Your school is already on Msanga" (no second copy); its heading takes the focus. Added → the school's page, "Your school is added." |
| `src/api/communities.ts` | + `NewCommunity`, `communitiesApi.add`, `notAddedBecause` (reads a 409's `code` and `suggestions`) |
| `src/api/http.ts` | `ApiError.body`: the API's whole answer, for extra fields like `suggestions` |
| `src/data/places.ts` | `NIGERIAN_STATES` (the same 37 as the API's `NigerianStates.cs`: change both together), `COUNTRIES` (every country, names from the browser, Nigeria first) |
| `src/components/forms/fields.tsx` | + `SelectField` (a native select) and `RadioGroup` (a fieldset with its question as the legend); same label / hint / error rules as the text fields |
| `src/components/forms/formHelpers.ts` | the API's `OtherNames[0]` errors land on the `otherNames` field |
| `src/pages/schools/SchoolPages.tsx` | the school's page says "Your school is added." after adding |
| `src/pages/comingSoon.ts`, `OtherPages.tsx` | Find Classmates (with sets, M3) now offers "Find your school first"; `back` per entry |
| `src/styles/schools.css`, `auth.css` | "Is it one of these?" box; select and radio buttons (each choice 44px tall) |
| `src/test/fakeApi.ts` | + adding a school (AlreadyListed, LooksLike, Nigeria needs a state); schools are per test |
| `src/pages/schools/AddSchoolPage.test.tsx` | adds and opens it; what's needed; "Is it one of these?" then add anyway; already listed; Nigeria's states / free text elsewhere; the name from a search; Find Classmates → Find your school |

## M2c: Find your school (14 Nov 2026)

Against the API's `GET /api/communities?search=` and `GET /api/communities/{id}` (M2a). Members only.

| File | What it does |
|---|---|
| `src/api/communities.ts` | the `Community` type (as the API sends it) and `communitiesApi.search` / `get`; `SEARCH_MIN_LENGTH` (2) |
| `src/components/schools/schoolText.ts` | `LEVEL_LABELS` ("University / Polytechnic"), `placeOf` (the country only outside Nigeria; "Enugu", not "Enugu, Enugu"), `useDebouncedValue` (waits 0.3 s after typing stops) |
| `src/components/schools/SchoolResult.tsx` | one result: the name as the link (the school goes along with it), level and place, "New" (explained to screen readers), "Also known as…"; `NewLabel` |
| `src/pages/schools/FindSchoolPage.tsx` | `/schools/find`: the search box (its own named search landmark), results as you type, "3 schools found." announced politely (`role="status"`), the search kept in the address (`?q=`), Try again on a failure, "Can't find your school?" → `/schools/new` |
| `src/pages/schools/SchoolPages.tsx` | `/schools/:schoolId` (name, level, place, other names; "Sets" come in M3; School not found), `/schools` My Schools (starts you off with Find your school) |
| `src/styles/schools.css` | the search box with its magnifier, results, the "New" label (8:1) |
| `src/test/fakeApi.ts` | + six schools (`SCHOOLS`) and a rough search; `calls` now include `?search=…` |
| `src/test/where.ts`, `TrackLocation.tsx` | + `where.search` (the `?q=…` part) |
| `src/pages/schools/FindSchoolPage.test.tsx` | typing searches once after the pause; one letter asks nothing; nothing found; New; the country; a state named like its town; a school's page (focus on its name, title, Back), not found; My Schools |

Data-light: nothing is asked for under 2 letters or while you're still typing; the same search within 5 minutes
isn't asked again; a school opened from the results shows at once (the result goes along with the link).

## W5: your profile and the account menu (13 Nov 2026)

"Your profile" (name, surname at school, about you, your sets, your email "only you see this"; no counts), Edit
profile (saved through `PUT /api/me`; the new name shows in the top bar at once), and the top bar's account menu
(Your profile, Settings, Sign out). With W1–W5, M1 (accounts) is done in the web app.

| File | What it does |
|---|---|
| `src/api/members.ts` | `/api/me` (read, edit), through `authorizedFetch` (refreshes the session when needed) |
| `src/pages/ProfilePage.tsx` | `ProfilePage` and `EditProfilePage`; the sets shown are still made up until M2 |
| `src/components/layout/AccountMenu.tsx` | the top bar's ▾: a show/hide list (`aria-expanded`), Esc closes and returns to the button, a click elsewhere closes |
| `src/components/forms/fields.tsx` | + `TextArea` (About you) |
| `src/styles/*.css` | profile layout, the extra-large photo, outline button, the account menu |
| `src/test/fakeApi.ts` | + `PUT /api/me`; `pages/ProfilePage.test.tsx` (profile, edit, no counts, the menu) |

## W4: forgot and reset password with a code (13 Nov 2026)

"Forgot your password?" → the email (always "done": nobody can find out who has an account) → "Choose a new
password" (the 6-digit code, works 15 minutes, and the new password; send a new code) → Sign in says "Your password is
changed" with the email filled in. The API has signed out every device and emailed "your password was changed".

| File | What it does |
|---|---|
| `src/api/auth.ts` | + `forgotPassword`, `resetPassword` |
| `src/pages/auth/ForgotPasswordPage.tsx` | the email; on to Choose a new password |
| `src/pages/auth/ResetPasswordPage.tsx` | code + new password; a wrong code on the code field, a weak password on the password field (the code still works) |
| `src/pages/auth/SignInPage.tsx` | + "Your password is changed" with the email filled in |
| `src/test/fakeApi.ts` | + reset codes; `pages/auth/ResetPasswordPage.test.tsx`; `TrackLocation` now a layout effect (no flaky address checks) |

## W3: create account and the 6-digit code (13 Nov 2026)

Create account → "Check your email" (type the 6-digit code; send a new code) → Sign in says "Your email is
confirmed" with the email filled in → Home. Signing in before confirming offers "Enter the code from your email".

| File | What it does |
|---|---|
| `src/api/auth.ts` | + `register`, `confirmEmail`, `resendConfirmation` (all privacy-safe: the API's answers never say who has an account) |
| `src/pages/auth/RegisterPage.tsx` | names, surname at school (optional), email, password (at least 10 characters) |
| `src/pages/auth/CheckEmailPage.tsx` | the code box (`inputmode="numeric"`, `autocomplete="one-time-code"`, spaces allowed: "482 913"), Send a new code, the API's one "isn't right or has expired" message on the code field |
| `src/pages/auth/SignInPage.tsx` | "Your email is confirmed" + email filled in; "Enter the code from your email" when not confirmed yet |
| `src/components/forms/useFormProblems.ts`, `formHelpers.ts` | a form's problems after a submit (shared by the three pages); `codeProblem` / `codeDigits` |
| `src/styles/auth.css` | the code box (big, spaced digits), the green "confirmed" line, `form-more` |
| `src/test/fakeApi.ts` | + accounts, codes (5 wrong tries), resend; `pages/auth/RegisterPage.test.tsx` |

## W2: signing in with the real API (13 Nov 2026)

Sign in against msanga-api, stay signed in, sign out. Home greets the signed-in member; sets, reunions and memories
are still made up. Create account, the codes, the password pages and the profile come in W3–W5.

**Keeping the session (decided 13 Nov 2026):** the access token (15 minutes) lives only in the page's memory; the
refresh token (30 days) in this browser's storage (`msanga.refreshToken`), so members stay signed in between
visits. The API rotates refresh tokens and ends every session if one is used twice, so only one refresh runs at a
time: within the page (one shared promise) and across tabs (the browser's Web Locks).

| File | What it does |
|---|---|
| `src/api/http.ts` | `apiFetch`: the API's address, JSON, and error answers turned into an `ApiError` (status, the API's `code`, a plain-English message, per-field messages keyed like the form ids) |
| `src/api/auth.ts` | the account endpoints and their shapes (`Member`, `AuthTokens`): login, refresh, logout |
| `src/auth/session.ts` | the session keeper (no React): `signIn`, `refreshSession` (one at a time), `signOut`, `authorizedFetch` (refreshes early, and once more after a 401; then the session has ended), `onSignedOut` |
| `src/auth/useSession.ts`, `memberContext.ts` | React side (TanStack Query): `useMe` (on page load, a returning visitor is signed in from the stored token), `useSignIn`, `useSignOut`, `useMember`, and showing Sign in when the session ends |
| `src/components/auth/RouteGuards.tsx` | `RequireMember` (signed out → Sign in, then back; "Can't reach Msanga" with Try again), `RedirectIfMember` |
| `src/components/auth/AuthLayout.tsx` | the account-page frame: navy brand panel (wide) or logo strip (phones) + the form |
| `src/components/forms/*` | labelled fields with hints and errors tied to them, password Show / Hide, "There is a problem" summary that takes the focus; `problemsFromApi` |
| `src/pages/auth/SignInPage.tsx` | Sign in; "Forgot your password?" and "Create an account" are "coming soon" (W3–W4) |
| `src/pages/OtherPages.tsx` | Settings now shows who you're signed in as, and Sign out |
| `src/styles/auth.css` | the forms and the account-page frame |
| `src/test/fakeApi.ts` | a pretend msanga-api for the tests (rotating refresh tokens, like the real one); `auth/session.test.ts`, `pages/auth/SignInPage.test.tsx` |

## W1: frame, logo and Home fixes (13 Nov 2026)

The first of the web app's M1 steps (W1–W6; sign-in comes in W2–W4). No sign-in yet: Home still shows the mock-up's
made-up member.

| File | What it does |
|---|---|
| `src/main.tsx` | starts React inside `BrowserRouter` (React Router) and loads the Fredoka font for headings |
| `src/App.tsx` | every page in one place: the frame with Home, Settings and "coming soon" pages; Page not found |
| `src/pages/comingSoon.ts`, `src/pages/OtherPages.tsx` | every menu place not built yet says when it comes (no dead links); Settings (with the connection check, moved from Home); Page not found |
| `src/components/layout/page.ts` | tab titles ("Memories – Msanga"); after moving page, the focus goes to the new page's h1 (screen readers announce it) |
| `src/components/layout/AppLayout.tsx` | the frame (skip link, top bar, sidebar or bottom tabs, main) around each page |
| `src/components/layout/navItems.ts` (`isCurrent`), `NavLinks.tsx`, `TopBar.tsx`, `src/components/home/*` | links change page without reloading (`Link`); a menu item is also "current" on its sub-pages |
| `src/components/ui/Logo.tsx`, `public/favicon.svg`, `public/apple-touch-icon.png`, `index.html` | the SVG logo (rebuilt from the PNGs, `docs/brand/svg`), favicon and phone home-screen icon |
| `src/components/home/WelcomeHero.tsx` | "Welcome back, Hilary!"; wide: photo starts after the words; phones: photo + greeting + "Ready to reconnect?" |
| `src/styles/*.css` | Fredoka headings; search edge #7a7499 (4.4:1, was 2.0:1); full-height sidebar with the evening scene at the bottom; phones: four tiles, compact set rows, your card hidden (Profile tab); `pages.css` |
| `src/test/renderApp.tsx` | renders the whole app at an address (for tests); `App.test.tsx` checks pages, focus, current item, Settings; `ConnectionCheck.test.tsx` |
| `docs/brand/`, `docs/mockups/` | the logo PNGs and SVG rebuild; the two mock-ups |

## Home mock-up (13 Nov 2026)

The Home page from the agreed mock-up, filled with **made-up data** from `src/mock/homeData.ts`, to show what goes
where before the API exists. As each part of the API arrives (members M1, sets M2–M3, reunions, memories), its list in
`homeData.ts` is replaced by an API call; when the file is empty it is deleted. The pictures in `public/mock-images`
(WebP, 132 KB in all) were cut from the ChatGPT mock-up (AI-made, not real people); real ones will be members' uploads.
They're decoration (`alt=""`): the words beside each one (set name, caption, event title) carry the meaning.

| File | What it does |
|---|---|
| `src/mock/homeData.ts` | the made-up member, sets, reunions and memories |
| `src/App.tsx` | the frame: skip link, top bar, sidebar (wide) or bottom tabs (phones), main |
| `src/components/layout/TopBar.tsx` | logo, search (your sets, schools, classes only), notifications, messages, account |
| `src/components/layout/Sidebar.tsx`, `BottomNav.tsx`, `NavLinks.tsx`, `navItems.ts` | the menus; current page = `aria-current="page"`; counts read as "Messages, 3 unread" |
| `src/pages/HomePage.tsx` | the page: main column + side column (one column on phones and medium screens) |
| `src/components/home/*` | WelcomeHero (the h1), QuickActions, MySets, MemoryWall, ProfileCard (no counts), UpcomingReunions ("Going" in words), ThenAndNow, SectionHeader ("See all" named after its section) |
| `public/mock-images/*.webp` | the mock-up's pictures: hero, sidebar evening, two set covers, four memories, three reunions, Hilary's photo |
| `src/components/ui/Avatar.tsx`, `Logo.tsx` | the member's photo, or initials when there's none; the logo mark (stand-in until the SVG rebuild) + wordmark + tagline |
| `src/styles.css`, `src/styles/layout.css`, `src/styles/home.css` | tokens and global rules; the frame; the Home sections |
| `src/pages/HomePage.test.tsx` | one h1; every Open / See all / Join / Register link named after its item; Home marked current; counts read with meaning; no personal counts; labelled search |

Layout: sidebar from 64rem (1024px at normal text size); below it the bottom tabs. Side column beside the main one
from 80rem; below it, one column. No sideways scrolling at 320px (400% zoom).

## Files (M0)

| File | What it does |
|---|---|
| `index.html` | the page shell: language (en-GB), the viewport tag that keeps pinch-to-zoom working, title, description |
| `src/main.tsx` | starts React and loads the styles |
| `src/App.tsx` | the page frame: skip link, header, main (one h1), footer, and the connection check |
| `src/components/ConnectionCheck.tsx` | M0's feature: asks the API for its greeting; shows it, or a clear message and Try again |
| `src/api/config.ts` | where the API is (`VITE_API_BASE_URL` from `.env.development`) |
| `src/api/hello.ts` | `GET /api/hello`, with plain-English errors |
| `src/styles.css` | the **light theme** (default; dark comes later as a setting): colours contrast-checked (ratios at the top of the file), sizes in rem, focus ring, reduced motion |
| `src/App.test.tsx` | tests: greeting shown, API-down message, live region, skip link, and **axe** finds no accessibility problems |
| `src/viewport.test.ts` | fails if anyone ever blocks pinch-to-zoom in `index.html` |
| `src/test/setup.ts`, `src/test/axe.ts` | test helpers: a fresh page per test; the axe check |
| `.oxlintrc.json` | lint rules, including the **jsx-a11y** accessibility rules (missing alt text, mouse-only clicks…) |
| `vite.config.ts`, `vitest.config.ts` | dev server on port 5174 (next to zayun-web on 5173); tests in a pretend browser (jsdom) |
| `.github/workflows/msanga-web-ci.yml` | lint, test and build on every push (no deploy until M9) |

## Accessibility checks (every milestone)

1. **Automatic, every push:** jsx-a11y lint rules, the axe test, the pinch-to-zoom test.
2. **By hand, every milestone:** keyboard only (Tab, Enter, Esc), one screen-reader pass (TalkBack on Android first,
   then NVDA), pinch-zoom and 200% text on a real phone.
3. **Colour contrast** is checked by hand (the pretend browser can't see colours): the ratios are at the top of
   `styles.css`; bright teal `#00c7e6` is decoration only (2.0:1 on white).

## Coming next

- **M8 (privacy):** Msanga is 18+ (roadmap): add an "I'm 18 or over" confirmation to Create account (and the API).
- **M3:** sets: the made-up sets, reunions and memories are replaced by the API's; Find Classmates.
