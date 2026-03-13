# AGENTS.md

Guidelines for AI agents (Codex, Claude, Copilot, etc.) working on this repository.

## Project Overview

Rent Splitter is a client-heavy Next.js 16 app. Most logic runs in the browser; the only server-side code is a single API route (`/src/app/api/chat/route.ts`) that proxies requests to Groq's Llama 3.1 API to keep the API key off the client.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5.9 (strict) |
| UI | React 19.2, Tailwind CSS v4 |
| Animations | GSAP 3.14 + `@gsap/react` |
| Icons | lucide-react |
| LLM | Groq API — `llama-3.1-8b-instant` |
| Tests | Vitest 4, @testing-library/react |
| Linter | ESLint 9 + eslint-config-next |

## Repository Structure

```
src/
├── app/
│   ├── api/chat/route.ts     # Only server-side code — POST endpoint for AI chatbot
│   ├── layout.tsx            # Root layout, metadata, Geist font loading
│   ├── page.tsx              # Home page (client component — main app UI)
│   ├── privacy/page.tsx
│   ├── terms/page.tsx
│   ├── robots.ts             # Auto-generated robots.txt
│   └── sitemap.ts            # Auto-generated sitemap.xml
├── components/               # All client components ('use client')
│   └── ui/                   # Primitive UI components (Button, Input, Toggle, etc.)
├── lib/
│   ├── animations.ts         # GSAP animation helpers
│   └── darkMode.tsx          # Dark mode context + localStorage
├── types/index.ts            # Shared TypeScript interfaces
└── utils/
    ├── calculations.ts       # Core rent split logic (income-based & room-size-based)
    ├── compression.ts        # LZ-string URL compression for shareable links
    ├── currency.ts           # Intl.NumberFormat currency formatting
    ├── chatbot.ts            # Message processing and autofill helpers
    ├── rateLimiter.ts        # Per-IP rate limiting
    ├── rateThrottler.ts      # Request throttling
    └── security.ts           # Input sanitisation, prompt injection detection
```

## Running the Project

```bash
npm install
# Create .env.local with MODEL_API_KEY and NEXT_PUBLIC_APP_URL
npm run dev        # dev server (Turbopack)
npm run build      # production build
npm test           # Vitest test suite (165 tests)
npm run lint       # ESLint
```

Required env vars:
- `MODEL_API_KEY` — Groq API key (server-side only, never exposed to client)
- `NEXT_PUBLIC_APP_URL` — public base URL (used for metadata and share links)

## Development Guidelines

### Client vs Server

- Almost everything is a client component. Only `layout.tsx`, static pages, `robots.ts`, `sitemap.ts`, and `api/chat/route.ts` run server-side.
- Do not add `'use client'` to files that don't need interactivity — keep server components server-side for SEO/metadata benefits.
- Never reference `MODEL_API_KEY` in client components. It must only be accessed in `api/chat/route.ts`.

### Testing

- Test runner is **Vitest**, not Jest. Config is in `vitest.config.ts`.
- Always run `npm test` after any change to `utils/`, `lib/`, or `api/`.
- Tests must not make real network calls — mock `fetch` for Groq API calls.
- Coverage thresholds: 80% branches, functions, lines, statements.
- Test files live next to the code they test in `__tests__/` subdirectories.

### Calculations

- Core logic is in `src/utils/calculations.ts`. This is the most critical file — changes here must be accompanied by tests.
- Two split modes: income-based (proportional to annual income) and room-size-based (proportional to sq ft + adjustments).
- Room adjustments: private bathroom (+15%), no window (−10%), flex wall (−5%), custom (−50% to +50%).

### URL Sharing

- Shareable links compress the full form state into a single `?data=` query parameter using LZ-string.
- Compression logic is in `src/utils/compression.ts`. Changes must not break existing shared URLs.

### Chatbot / AI Route

- The `/api/chat` POST endpoint is rate-limited (50 req / 15 min per IP) and sanitises all inputs.
- The system prompt is security-hardened against prompt injection — do not weaken these checks.
- The endpoint returns `{ content: string, parsedData?: object }`. `parsedData` is used to autofill the form.

### Styling

- Tailwind CSS v4 — use utility classes, not custom CSS where possible.
- Dark mode is class-based (`html.dark`). The `DarkModeToggle` component and `darkMode.tsx` context handle persistence.
- Animations must respect `prefers-reduced-motion` — see `src/lib/animations.ts` for the pattern.

### Dependency Constraints

- Keep **ESLint at v9**. `eslint-config-next` bundles plugins that do not yet declare support for ESLint v10.
- Keep **`eslint-config-next` at `15.5.12`**. Version `16.x` pulls in `eslint-plugin-react` v8 which has a circular reference bug that breaks `FlatCompat` config validation. Pin `@eslint/eslintrc` at `3.3.1` for the same reason. These can be unblocked once the upstream circular reference is fixed.
- Node.js 18+ required.

## What Next.js Features Are Used

| Feature | Used | Notes |
|---|---|---|
| App Router | Yes | All pages under `src/app/` |
| API Routes | Yes | `/api/chat` only |
| Server Components | Yes | Layout, static pages, robots, sitemap |
| Client Components | Yes | All interactive components |
| `next/font` | Yes | Geist Sans + Geist Mono |
| `next/link` | Yes | Navigation in Footer, static pages |
| Metadata API | Yes | SEO, Open Graph, Twitter Card |
| Security headers | Yes | Configured in `next.config.ts` |
| Server Actions | No | Not used |
| `next/image` | No | No images in the app |
| Middleware | No | Not used |
| ISR / SSR | No | Static or client-rendered only |
