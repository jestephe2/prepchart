# PrefChart — Claude Code Context

## What This Is
Mobile-first PWA for surgical device reps. Core flow: Surgeon → Procedure → Preference Card.

## Stack
Next.js 16 App Router, TypeScript, Tailwind, Zod, Supabase, Vercel. PWA via next-pwa.

## Design Tokens
- Background: #080b10
- Accent green: #4ade80
- Accent dark: #052e16
- Amber (flags): #fb923c
- Amber bg: #1c0a00
- Card bg: #0d1117
- Border: #1a2332

## Non-Negotiable Architecture Rules
1. ALL Supabase queries live in `/lib/data.ts` only. Never raw Supabase in components, pages, or API routes.
2. ALL types derive from Zod schemas in `/lib/schemas.ts`. Never write separate TypeScript interfaces for DB entities.
3. API routes do exactly three things: validate with Zod, call a `/lib` domain function, return a response.
4. Domain logic lives in `/lib/{domain}/index.ts`. Never in pages or API routes.
5. Page components contain zero logic — only rendering. If there's an `if` statement that isn't about rendering, move it to `/lib`.

## Directory Structure
/app → Next.js routing only. Thin page components and API routes.
/lib/surgeons → Surgeon domain logic
/lib/procedures → Procedure domain logic
/lib/preferences → Implant prefs + flags logic
/lib/schemas.ts → ALL Zod schemas and derived types
/lib/data.ts → ALL Supabase queries
/lib/supabase/ → client.ts and server.ts
/components → Reusable UI only. Zero business logic.

## Database Tables
surgeons → procedures → implant_preferences + flags
processed_events (Stripe webhook idempotency)
RLS enabled on all tables. Cascading deletes handle cleanup.

## Current Phase
Phase 1 — Tracer Bullet

## How to Start a Session
State the phase and specific task: "We are in Phase 1. Today's task is [specific task]."

## Build Sequence Reference

# PrefChart — V1 Build Sequence

**Tracer Bullet Methodology | Solo Founder | ~5 hrs/week**

-----

## The Guiding Principle

From *The Pragmatic Programmer*: build the thinnest possible slice that goes all the way through the system — real auth, real database, real phone. Not a demo. Not dummy data. A working tool you personally use on your next case.

Everything in this sequence follows that rule. We build end-to-end first, then flesh out. No feature is “done” until it works on your actual iPhone in a hospital parking lot.

-----

## Constraints

- ~5 hrs/week available
- Stack: Next.js (App Router), Supabase, Vercel, Tailwind, Zod
- Target: PWA, no App Store
- You are User #1 — Sacramento territory, real surgeons
- Target launch: paying beta users within 60 days

-----

## The 4 Phases

|Phase|Name            |Goal                                |Timeline        |
|-----|----------------|------------------------------------|----------------|
|0    |Foundation      |Project lives on real infrastructure|Day 1 (2 hrs)   |
|1    |Tracer Bullet   |Full flow, read-only, YOUR real data|Week 1–2 (8 hrs)|
|2    |Write Layer     |Reps can add and edit their own data|Week 3–4 (8 hrs)|
|3    |Launch Readiness|Stripe, onboarding, landing page    |Week 5–6 (8 hrs)|

**Total: ~26 hours of focused work. 6 weeks at 5 hrs/week with buffer.**

-----

## Phase 0 — Foundation

**Time: 2 hours | Goal: Something real is deployed before you sleep**

The rule: don’t write a single feature until the skeleton is live on Vercel with a real domain.

### Tasks

**0.1 — Project Init (30 min)**

```bash
npx create-next-app@latest prepchart --typescript --tailwind --app
cd prepchart
npm install zod @supabase/supabase-js @supabase/ssr
git init && git remote add origin [new GitHub repo]
```

**0.2 — Supabase Setup (30 min)**

- Create project at supabase.com → name: `prepchart`
- Note your project URL and anon key
- Create `/lib/supabase/client.ts` and `/lib/supabase/server.ts`

**0.3 — Deploy to Vercel (30 min)**

- Connect GitHub repo to Vercel
- Add environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Confirm deploy passes — even if it’s just a blank page
- Set custom domain if you have one

**0.4 — PWA Config (30 min)**

- Install: `npm install next-pwa`
- Add manifest.json (name, icons, theme_color: `#4ade80`, background: `#080b10`)
- Configure `next.config.js` for PWA
- Test: visit on iPhone → Share → Add to Home Screen → confirm it works

**Phase 0 Done When:** A blank app is live at a real URL and installable as a PWA on your iPhone.

-----

## Phase 1 — Tracer Bullet

**Time: 8 hours across 2 weeks | Goal: Full flow with YOUR real data, read-only**

This is the most important phase. You’re not building features. You’re proving the entire system works from login to preference card — with real rows in Supabase, real auth, real phone.

-----

### 1.1 — Database Schema (1 hr)

Run this SQL in Supabase SQL editor. This is the complete V1 schema — don’t add tables, don’t modify it until Phase 3.

```sql
-- surgeons: one row per surgeon per rep
create table surgeons (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  specialty text,
  hospital text,
  initials text,
  last_case_date date,
  created_at timestamptz default now()
);

-- procedures: linked to a surgeon
create table procedures (
  id uuid default gen_random_uuid() primary key,
  surgeon_id uuid references surgeons(id) on delete cascade not null,
  name text not null,
  sub_type text,
  icon text default '🔩',
  setup_notes text,
  timing_notes text,
  rep_notes text,
  created_at timestamptz default now()
);

-- implant_preferences: the ranked preference stack
create table implant_preferences (
  id uuid default gen_random_uuid() primary key,
  procedure_id uuid references procedures(id) on delete cascade not null,
  rank integer not null check (rank between 1 and 5),
  product_name text not null,
  detail_notes text,
  updated_at timestamptz default now()
);

-- flags: critical warnings per procedure
create table flags (
  id uuid default gen_random_uuid() primary key,
  procedure_id uuid references procedures(id) on delete cascade not null,
  text text not null,
  created_at timestamptz default now()
);

-- processed_events: idempotency log for Stripe webhooks
create table processed_events (
  id uuid default gen_random_uuid() primary key,
  stripe_event_id text unique not null,
  processed_at timestamptz default now()
);

-- Indexes on every foreign key (required — do not skip)
create index on procedures(surgeon_id);
create index on implant_preferences(procedure_id);
create index on flags(procedure_id);

-- Row Level Security
alter table surgeons enable row level security;
alter table procedures enable row level security;
alter table implant_preferences enable row level security;
alter table flags enable row level security;

-- Policies: users see only their own data
create policy "Users own their surgeons"
  on surgeons for all using (auth.uid() = user_id);

create policy "Users own their procedures"
  on procedures for all using (
    surgeon_id in (select id from surgeons where user_id = auth.uid())
  );

create policy "Users own their implant prefs"
  on implant_preferences for all using (
    procedure_id in (
      select p.id from procedures p
      join surgeons s on s.id = p.surgeon_id
      where s.user_id = auth.uid()
    )
  );

create policy "Users own their flags"
  on flags for all using (
    procedure_id in (
      select p.id from procedures p
      join surgeons s on s.id = p.surgeon_id
      where s.user_id = auth.uid()
    )
  );
```

**Then seed YOUR real data directly in Supabase table editor.** Add 3–4 of your actual Sacramento surgeons with real procedures and real implant preferences. This is not a chore — this is you becoming User #1.

-----

### 1.2 — Zod Schemas (Single Source of Truth) (30 min)

Create `/lib/schemas.ts`. This is the only place types are defined. Never write a separate TypeScript `interface` for a database entity — derive it from Zod instead.

```typescript
// /lib/schemas.ts
import { z } from 'zod'

export const SurgeonSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  name: z.string().min(1),
  specialty: z.string().optional().nullable(),
  hospital: z.string().optional().nullable(),
  initials: z.string().max(3).optional().nullable(),
  last_case_date: z.string().optional().nullable(),
  created_at: z.string().optional(),
})

export const ProcedureSchema = z.object({
  id: z.string().uuid(),
  surgeon_id: z.string().uuid(),
  name: z.string().min(1),
  sub_type: z.string().optional().nullable(),
  icon: z.string().default('🔩'),
  setup_notes: z.string().optional().nullable(),
  timing_notes: z.string().optional().nullable(),
  rep_notes: z.string().optional().nullable(),
  created_at: z.string().optional(),
})

export const ImplantPreferenceSchema = z.object({
  id: z.string().uuid(),
  procedure_id: z.string().uuid(),
  rank: z.number().int().min(1).max(5),
  product_name: z.string().min(1),
  detail_notes: z.string().optional().nullable(),
  updated_at: z.string().optional(),
})

export const FlagSchema = z.object({
  id: z.string().uuid(),
  procedure_id: z.string().uuid(),
  text: z.string().min(1),
  created_at: z.string().optional(),
})

// Derive all TypeScript types from schemas — never write them separately
export type Surgeon = z.infer<typeof SurgeonSchema>
export type Procedure = z.infer<typeof ProcedureSchema>
export type ImplantPreference = z.infer<typeof ImplantPreferenceSchema>
export type Flag = z.infer<typeof FlagSchema>

// Input schemas for forms (subset of full schema, no id/timestamps)
export const CreateSurgeonSchema = SurgeonSchema.pick({
  name: true,
  specialty: true,
  hospital: true,
  initials: true,
})

export const CreateProcedureSchema = ProcedureSchema.pick({
  name: true,
  sub_type: true,
  icon: true,
})

export const UpsertImplantSchema = ImplantPreferenceSchema.pick({
  rank: true,
  product_name: true,
  detail_notes: true,
})

export type CreateSurgeonInput = z.infer<typeof CreateSurgeonSchema>
export type CreateProcedureInput = z.infer<typeof CreateProcedureSchema>
export type UpsertImplantInput = z.infer<typeof UpsertImplantSchema>
```

**Why this matters:** This is the DRY principle from the skill file applied directly. One schema = one type = one validator. Change the shape in one place and everything downstream updates.

-----

### 1.3 — Auth (1 hr)

Use Supabase magic link auth. No passwords for V1.

- `/app/login/page.tsx` — email input + “Send me a link” button
- `/app/auth/callback/route.ts` — Supabase auth callback handler
- Middleware to protect all routes except `/login`
- Redirect authenticated users to `/` from login page

Keep the login screen simple: PrefChart logo, one email field, one button. Dark theme matching the app. No social auth, no passwords.

-----

### 1.4 — Directory Structure

The skill file principle: your directory structure should scream **what the system does**, not what framework it uses. Keep all domain logic outside `/app`.

```
/app                        ← Next.js routing only. Thin page components.
  /login
  /surgeons
    /[id]
      /procedures
        /[procedureId]
/lib
  /surgeons                 ← All surgeon domain logic
    index.ts                ← getSurgeons(), createSurgeon(), deleteSurgeon()
  /procedures               ← All procedure domain logic
    index.ts
  /preferences              ← Implant prefs + flags logic
    index.ts
  /schemas.ts               ← All Zod schemas and derived types (single source of truth)
  /data.ts                  ← All raw Supabase queries (one place, nowhere else)
  /supabase
    client.ts
    server.ts
/components                 ← Reusable UI only. No business logic.
```

**The test:** Can you read `/lib/surgeons/index.ts` and understand what the app does without knowing it’s built in Next.js? If yes, the structure is right.

-----

### 1.5 — Data Layer (1 hr)

Create `/lib/data.ts`. This is the ONLY place Supabase queries live. Components and domain functions never query Supabase directly — they call this file.

```typescript
// /lib/data.ts
import { SupabaseClient } from '@supabase/supabase-js'
import { Surgeon, Procedure, ImplantPreference, Flag } from './schemas'

export async function getSurgeons(supabase: SupabaseClient): Promise<Surgeon[]> {
  const { data, error } = await supabase
    .from('surgeons')
    .select('*')
    .order('name')
  if (error) throw new Error(`getSurgeons failed: ${error.message}`)
  return data ?? []
}

export async function getProcedures(
  supabase: SupabaseClient,
  surgeonId: string
): Promise<Procedure[]> {
  const { data, error } = await supabase
    .from('procedures')
    .select('*')
    .eq('surgeon_id', surgeonId)
    .order('name')
  if (error) throw new Error(`getProcedures failed: ${error.message}`)
  return data ?? []
}

export async function getPreferences(
  supabase: SupabaseClient,
  procedureId: string
): Promise<{ implants: ImplantPreference[]; flags: Flag[] }> {
  const [implants, flagsResult] = await Promise.all([
    supabase
      .from('implant_preferences')
      .select('*')
      .eq('procedure_id', procedureId)
      .order('rank'),
    supabase
      .from('flags')
      .select('*')
      .eq('procedure_id', procedureId),
  ])
  if (implants.error) throw new Error(`getImplants failed: ${implants.error.message}`)
  if (flagsResult.error) throw new Error(`getFlags failed: ${flagsResult.error.message}`)
  return {
    implants: implants.data ?? [],
    flags: flagsResult.data ?? [],
  }
}
```

**Crash loudly.** The skill file says: “A system that crashes loudly at the point of the bad input is easier to debug than one that corrupts data silently.” Throw real errors, don’t swallow them.

-----

### 1.6 — The Three Screens (3 hrs)

Build these in order. Don’t move to the next until the current one works on your phone with real data. Each screen = a thin Next.js page component calling the data layer. No Supabase in the page file.

**Humble Object pattern:** Every page component is “humble” — it does I/O (fetches data) and renders. All logic lives in `/lib`. If you find yourself writing an `if` statement in a page component that isn’t about rendering, move it to `/lib`.

**Screen 1: Home (`/app/page.tsx`)**

- “What case are you walking into?” header
- Big green “Pick your surgeon” button → links to `/surgeons`
- Upcoming surgeons list (those with `last_case_date` in the future)
- Stats strip (surgeon count, procedure count)
- Bottom nav bar

**Screen 2: Surgeon List (`/app/surgeons/page.tsx`)**

- Fetch surgeons via `getSurgeons()` from data layer (server component)
- Search bar (client component island)
- Surgeon cards with initials, specialty, hospital
- Tap → navigate to `/surgeons/[id]`

**Screen 3: Procedure List (`/app/surgeons/[id]/page.tsx`)**

- Fetch surgeon + their procedures
- Surgeon header with initials, name, specialty
- Procedure cards with icon, name, sub-type
- Tap → navigate to `/surgeons/[id]/procedures/[procedureId]`

**Screen 4: Preference Card (`/app/surgeons/[id]/procedures/[procedureId]/page.tsx`)**

- Fetch procedure + implants + flags via `getPreferences()`
- Flags strip (amber) — always visible at top
- Three tabs: Implants | Setup | Rep Notes
- Each tab is a client component, rest is server rendered
- “Edit” buttons visible but non-functional (placeholder for Phase 2)

-----

### 1.7 — Mobile Polish (1 hr)

Before calling Phase 1 done, do this checklist on your actual iPhone:

- [ ] Install as PWA from Safari
- [ ] Launch from home screen (no Safari chrome)
- [ ] All text readable without zooming
- [ ] All tap targets at least 44px tall
- [ ] No horizontal scroll anywhere
- [ ] Works on WiFi and LTE
- [ ] Back navigation works correctly
- [ ] Preference card loads in under 2 seconds on LTE

**Phase 1 Done When:** You walk into your next case, pull up PrefChart on your phone in the parking lot, tap your surgeon, tap the procedure, and see your real preference card. That’s the tracer bullet hitting the target.

-----

## Phase 2 — Write Layer

**Time: 8 hours across 2 weeks | Goal: Any rep can sign up and build their own profile**

Phase 1 was read-only. Phase 2 is the full CRUD layer that turns this from a personal tool into a product other reps can use.

**API route structure (Single Responsibility):** Every API route handler does only three things — validate input with Zod, call a domain function from `/lib`, return a response. Auth logic, business logic, and database calls never mix in the same function.

```typescript
// Example: /app/api/surgeons/route.ts — thin and humble
export async function POST(request: Request) {
  // 1. Auth check
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  // 2. Validate input with Zod
  const body = await request.json()
  const result = CreateSurgeonSchema.safeParse(body)
  if (!result.success) return new Response(result.error.message, { status: 400 })

  // 3. Call domain function
  const surgeon = await createSurgeon(supabase, user.id, result.data)

  // 4. Return response
  return Response.json(surgeon, { status: 201 })
}
```

-----

### 2.1 — Add Surgeon Flow (1.5 hrs)

Bottom nav `+` button → modal or new page.

**Form fields:**

- Name (text, required)
- Specialty (select: Sports Medicine, Ortho Trauma, Spine, General Ortho, Other)
- Hospital (text)
- Initials (auto-generated from name, editable)

Validate with `CreateSurgeonSchema.safeParse()` before submitting. Show inline field errors if validation fails — don’t wait for the server.

On submit: POST to `/api/surgeons`, redirect to new surgeon’s page.

Keep the form to one screen. No multi-step wizard. Reps are in a hurry.

-----

### 2.2 — Add Procedure Flow (1.5 hrs)

From surgeon page, tap “Add Procedure.”

**Form fields:**

- Procedure name (text, required)
- Sub-type / descriptor (text, e.g. “Meniscal Repair”)
- Icon (emoji picker — small grid of 8 common options)

Validate with `CreateProcedureSchema.safeParse()` before submitting.

On submit: POST to `/api/procedures`, redirect to new procedure’s page (empty preference card).

-----

### 2.3 — Add/Edit Preference Card (3 hrs)

This is the core of the product. Three separate edit modes accessible from the preference card:

**Implant Edit Mode:**

- Tap “Edit” on Implants tab → inline editing
- Each implant card becomes editable: rank selector, name field, notes textarea
- Validate each implant with `UpsertImplantSchema.safeParse()` before saving
- “Add Implant” button adds a new card (max rank 5)
- Save button → upserts to `implant_preferences`

**Setup Edit Mode:**

- Tap “Edit” on Setup tab → textareas for OR setup and timing notes
- Save → updates `procedures` row

**Rep Notes + Flags Edit Mode:**

- Tap “Edit” on Rep Notes tab → textarea for rep notes
- Flags: tap “+” to add a flag (text input), tap flag chip to delete it
- Save → updates `procedures.rep_notes` and upserts `flags`

**Key UX rule:** Never navigate away to edit. Edit in place. The rep might be standing in the hallway.

-----

### 2.4 — Delete Flows (1 hr)

- Long-press on surgeon card → “Delete surgeon” (with confirmation)
- Long-press on procedure card → “Delete procedure” (with confirmation)
- Swipe on implant preference → delete
- Tap flag chip → delete (no confirmation needed, low stakes)

Cascading deletes are handled by the database schema (`on delete cascade`). Don’t handle them in the application layer.

-----

### 2.5 — Error States (1 hr)

Every data operation needs a real error state before Phase 2 is done:

- Network offline → “You’re offline. Changes will save when reconnected.”
- Save failed → inline error message, data not cleared from form
- Load failed → “Something went wrong. Pull to refresh.”
- Empty states → “No surgeons yet. Tap + to add your first.” (not a blank screen)
- Validation failed → field-level error messages from Zod, shown immediately

**Phase 2 Done When:** Send a link to one other rep. Have them sign up, add their first surgeon and procedure from scratch, build a preference card, and tell you what was confusing. Do this with 2–3 reps before Phase 3.

-----

## Phase 3 — Launch Readiness

**Time: 8 hours across 2 weeks | Goal: First paying customers**

### 3.1 — Pricing Decision (30 min, no code)

|Tier|Price |What you get                                                           |
|----|------|-----------------------------------------------------------------------|
|Free|$0    |2 surgeons, 3 procedures each. No upgrade nagging — just natural limit.|
|Pro |$15/mo|Unlimited surgeons, procedures, preferences                            |

Free tier lowers signup friction. A rep fully evaluates PrefChart on 2 surgeons. When they want surgeon #3, they upgrade. No credit card required to start.

-----

### 3.2 — Stripe Integration (2 hrs)

```bash
npm install stripe @stripe/stripe-js
```

**API routes:**

- `/app/api/checkout/route.ts` — creates Stripe Checkout session (humble: validate auth, call Stripe, return URL)
- `/app/api/webhooks/stripe/route.ts` — handles `checkout.session.completed`

**Webhook handler must be idempotent.** Stripe can deliver the same event more than once. Before processing any event, check the `processed_events` table:

```typescript
// /app/api/webhooks/stripe/route.ts
export async function POST(request: Request) {
  // 1. Verify Stripe signature (humble layer)
  const sig = request.headers.get('stripe-signature')!
  const body = await request.text()
  const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)

  // 2. Idempotency check — deduplicate by Stripe event ID
  const supabase = createServiceClient()
  const { data: existing } = await supabase
    .from('processed_events')
    .select('id')
    .eq('stripe_event_id', event.id)
    .single()

  if (existing) return new Response('Already processed', { status: 200 })

  // 3. Process the event (business logic in /lib, not here)
  if (event.type === 'checkout.session.completed') {
    await handleCheckoutComplete(supabase, event.data.object)
  }

  // 4. Log the processed event
  await supabase
    .from('processed_events')
    .insert({ stripe_event_id: event.id })

  return new Response('OK', { status: 200 })
}
```

**Add to Supabase:** A `user_profiles` table with `subscription_status` and `subscription_end` columns, linked to `auth.users`.

Gate “Add Surgeon” after 2 surgeons for free users: show upgrade prompt, not an error.

-----

### 3.3 — Onboarding Flow (1.5 hrs)

New user signs up → 3-step onboarding before they hit the home screen:

**Step 1:** “Welcome to PrefChart. Let’s add your first surgeon.” → inline surgeon form (validated with Zod before submit)
**Step 2:** “Now add a procedure.” → inline procedure form
**Step 3:** “Add your first preference.” → inline implant form with example placeholder

By the end of onboarding, the user has one complete preference card. They immediately see the value. Skip button available on each step but not prominent.

Track: set `onboarding_complete = true` in `user_profiles` when finished or skipped.

-----

### 3.4 — Landing Page (2 hrs)

Single page for non-authenticated visitors.

**Sections (in order):**

1. Hero: “Your surgeon preferences. Always with you.” + “Start free” button
1. The problem: “Tribal knowledge walks out the door when a rep leaves.”
1. The flow: 3-step visual — Pick surgeon → Pick procedure → See your card
1. Proof: your own preference card screenshot (real data, blur surgeon names)
1. Pricing: Free vs Pro, one CTA

No testimonials yet. No social proof yet. Honest, direct, rep-to-rep language.

-----

### 3.5 — Pre-Launch Checklist (1 hr)

- [ ] Magic link email has PrefChart branding (not Supabase default)
- [ ] PWA icon is high quality at all sizes
- [ ] Stripe webhook is verified with signing secret
- [ ] Idempotency working — test by sending duplicate Stripe events
- [ ] All form inputs validated with Zod before hitting the server
- [ ] Error monitoring set up (Vercel Analytics or Sentry free tier)
- [ ] Privacy policy page exists
- [ ] You have personally used the app for at least 5 real cases
- [ ] Foreign key indexes confirmed in Supabase → Table Editor → Indexes

**Phase 3 Done When:** You send the link to 10 reps you know personally. No cold outreach. No ads. Just: “I built this. It’s free to start. Tell me if it’s useful.” Target: 3 paying users within 30 days of launch.

-----

## What’s NOT In V1

Deliberately excluded. Do not build these until you have 20 paying users:

- Team/sharing features
- Case scheduling / calendar integration
- Photo uploads
- Push notifications
- Offline-first / service worker caching
- Export to PDF
- Android optimization (iPhone first)
- Rep-to-rep discovery or network features
- Any AI features

Every one of these is a good idea. None of them should exist until someone is paying $15/mo for the core product.

-----

## The Weekly Schedule

|Week|Focus                                 |Hours|Milestone                                      |
|----|--------------------------------------|-----|-----------------------------------------------|
|1   |Phase 0 + Schema + Auth               |5    |App deployed, auth works, schema + indexes live|
|2   |Zod schemas + Data layer + Screens 1–2|5    |Home and surgeon list working on phone         |
|3   |Screens 3–4 + mobile polish           |5    |Full read flow, tracer bullet complete         |
|4   |Add/edit flows + API routes           |5    |Write layer working, send to 2 beta reps       |
|5   |Error states + Stripe + idempotency   |5    |Payments working, pricing gate in place        |
|6   |Onboarding + landing page + launch    |5    |Public, 10 reps invited                        |

-----

## First Session With Claude Code

When you open PrefChart in Claude Code for the first time, paste this as the starting context:

> PrefChart is a mobile-first PWA for surgical device reps. Stack: Next.js App Router, TypeScript, Supabase, Tailwind, Zod. Colors: dark background #080b10, green accent #4ade80. Four core tables: surgeons, procedures, implant_preferences, flags. Plus processed_events for webhook idempotency. All Supabase queries live in /lib/data.ts only — never raw Supabase in components or API routes. All types derived from Zod schemas in /lib/schemas.ts — never write separate TypeScript interfaces for DB entities. API routes are humble: validate with Zod, call /lib domain function, return response. We are in Phase [X] of the build sequence. Today’s task is [specific task from this doc].

Start each session with the specific task. Don’t start sessions with “let’s work on PrefChart” — start with “let’s build the Add Surgeon API route from Phase 2.1.”

-----

## Architectural Fitness Test

Run these checks at the end of each phase:

1. **Can I change the database without touching business logic?** (Dependency Rule)
1. **Is there a single Zod schema for every database entity?** (DRY)
1. **Do any page components contain `if` statements that aren’t about rendering?** (Humble Object — move logic to `/lib`)
1. **Do any API routes contain business logic beyond validate → call → return?** (Single Responsibility)
1. **Are all Stripe webhook operations idempotent?** (Reliability)
1. **Does every foreign key have an index?** (Index Design)
1. **If I change module X, how many other files change?** (Orthogonality — answer should be 1–2)

-----

## Definition of Done — V1

PrefChart V1 is done when:

1. You have used it personally in at least 5 real OR cases
1. At least 2 other reps have signed up independently and built their own profiles
1. At least 1 person is paying $15/month who is not you
1. The core flow (login → surgeon → procedure → prefs) works in under 10 seconds on LTE

That’s it. Ship that. Everything else is V2.
