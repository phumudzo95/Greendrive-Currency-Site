# GreenDrive Currency — Marketing Site & Application Form

The public-facing website and driver application form for **GreenDrive
Currency**, the first live division of **Mikatshema Group (Pty) Ltd**.

> Powering people. Driving businesses. Building futures.

## What's actually built right now

This is **phase one** of the Mikatshema OS platform described in the
original project brief. The full brief asks for a complete multi-tenant
SaaS platform: RBAC across seven roles, a CRM, fleet management, payments,
PDF generation, email automation, an affordability scoring engine, and a
full Supabase-backed database. That is realistically weeks of work for a
team, not a single build.

What exists in this repo today:

- The public marketing site (home page) with the brand's real messaging
  and numbers from the GreenDrive Currency marketing material.
- A complete five-step driver application form with client-side
  validation (personal details → employment → vehicle requirements →
  documents → review & submit).
- Static pages: About, Business Fleet Solutions, Careers, Privacy Policy
  (draft), Terms of Service (draft).

**What is explicitly NOT built yet, and why:**

- **No backend.** The application form validates and shows a confirmation
  screen with a generated reference number, but nothing is persisted
  anywhere. There is no Supabase project connected. See "Next steps"
  below.
- **No authentication.** No login, no roles, no admin panel.
- **No database, no RLS policies, no CRM, no fleet module, no payments,
  no PDF generation, no email sending.** None of this can be built
  responsibly without a real Supabase project and a decision on what the
  actual MVP scope is — see the note at the bottom of this file.
- **Privacy Policy and Terms pages are drafts**, clearly marked as such on
  the pages themselves. They must be reviewed by a qualified attorney
  before this goes live and starts collecting real applicant data,
  particularly given POPIA obligations.
- **Logo is a rebuilt text/icon wordmark**, not the original brand
  artwork, since only JPEG marketing flyers were provided, not a usable
  vector/transparent logo file.

## Tech stack

- Next.js 16 (App Router, Turbopack) — the brief asked for Next.js 15;
  16 is the current stable release and fully compatible with everything
  used here. Pin to 15 in `package.json` if you specifically need that
  major version.
- React 19, TypeScript
- Tailwind CSS v4 (CSS-first `@theme` tokens in `app/globals.css`)
- React Hook Form + Zod for the application form

## Deploying to Vercel

1. Go to [vercel.com](https://vercel.com), import the `Greendrive-Currency-Site` GitHub repo.
2. Framework preset will auto-detect as Next.js — leave all build settings as defaults.
3. Before clicking Deploy, add these **Environment Variables** under Settings → Environment Variables:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://meixaqauldeotvtjkijc.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Get this from Supabase Dashboard → Project Settings → API → `anon` key |

4. Deploy. The application form will now save real submissions to Supabase.

To verify it's working after deploy: submit a test application, then open the Supabase dashboard → Table Editor → `applications` table. You should see the row with the reference number shown on screen.

## Running locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

```bash
npm run build   # production build
npm run lint    # ESLint
```

Note: the production build fetches the Inter font from Google Fonts at
build time via `next/font/google`. If you're building in an environment
without internet access, this step will fail — it succeeds normally on
Vercel or any machine with normal internet access.

## Project structure

```
app/
  page.tsx              Home page
  apply/page.tsx         Application form page
  about/, business/, careers/, privacy/, terms/   Static pages
  layout.tsx             Root layout, fonts, metadata
  globals.css             Design tokens (brand colors, theme)
components/
  marketing/              Header, hero, sections, footer, simple-page shell
  apply/                  Multi-step form, step indicator, field primitives
lib/
  application-schema.ts    Zod schema + types for the driver application
```

## Brand tokens

Defined in `app/globals.css` under `@theme`:

| Token | Hex | Use |
|---|---|---|
| `gd-primary` | `#0D7A34` | Primary actions, links |
| `gd-dark` | `#065F27` | Hover states, depth |
| `gd-black` | `#111111` | Headlines, high-contrast text |
| `gd-white` | `#FFFFFF` | Base background |
| `gd-accent` | `#34C759` | Sparing accent: checkmarks, highlights |
| `gd-cream` | `#FAFAF8` | Section background variation |
| `gd-mute` | `#6B7280` | Secondary text |

## Next steps, in order

1. **Decide the actual MVP scope.** The full original brief is a large
   multi-year platform. Pick what the business genuinely needs in the
   next 1–2 months (almost certainly: driver applications landing
   somewhere real, plus a basic staff view to review them) before building
   more.
2. **Create a Supabase project** for this platform (separate from any
   other Mikatshema Group project) and decide who owns/manages it.
3. **Wire the application form to a real backend.** A Next.js Server
   Action that validates with the existing Zod schema, inserts into a
   Supabase `applications` table, uploads documents to Supabase Storage,
   and sends a confirmation email (Resend) is the natural next increment.
4. **Get a real legal review** of the Privacy Policy and Terms before
   collecting any real applicant data.
5. **Get proper logo/brand assets** (vector or transparent PNG) from
   whoever designed the original marketing material.

Only after the application pipeline is real and trustworthy does it make
sense to build the CRM, fleet management, payments, and admin panel
described in the original brief.
