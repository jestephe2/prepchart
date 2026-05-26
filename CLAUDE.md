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
