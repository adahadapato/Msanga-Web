# Msanga web: code map

Where everything lives, and why. Kept up to date with every milestone.

_Last updated: W2 signing in with the real API (13 Nov 2026)_

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

- **W3:** create account + "check your email" with the 6-digit code (and "send a new code").
- **W4:** forgot / reset password with a code. **W5:** profile, edit profile, the account menu in the top bar.
