# Msanga web

The web app of **Msanga**, the reunion app: find your old classmates, then keep the class organised and trusted
(dues, decisions, projects, reunions). The name is coined from *mme nsanga*, "my friends" in Annang.

**React 19 + Vite + TypeScript** (like zayun-web). The API is in **msanga-api**.

> **Status: M0.** One page that talks to the API, with accessibility checks wired in from day one
> (WCAG 2.2 AA is part of "done" for every milestone). See `docs/code-map.md`.

## Run it on your PC

1. Start the API first (in msanga-api: `dotnet run --project Msanga.Presentation --launch-profile https`).
2. Then, in this folder:

```powershell
npm install
npm run dev
```

Open <http://localhost:5174>. You should see **"Mme nsanga! Your set is waiting."** in the Connection check. If the API
isn't running, the page says so, with a Try again button.

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | the app on <http://localhost:5174>, talking to the API at `https://localhost:7311` |
| `npm run lint` | code and accessibility lint rules |
| `npm test` | the tests, including the axe accessibility check and the pinch-to-zoom check |
| `npm run build` | type-check and build into `dist/` |

## Rules

- Accessibility is part of "done": lint, tests and a manual keyboard / screen-reader / zoom check every milestone.
- Never block pinch-to-zoom (no `maximum-scale` or `user-scalable=no`); the tests enforce it.
- No secrets in this repo: anything starting with `VITE_` ends up in the browser.
