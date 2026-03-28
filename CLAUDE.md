# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (Vite, hot reload)
npm run build     # Production build to dist/
npm run lint      # ESLint
npx tsc --noEmit  # Type check without building
```

## Stack

- **Vite + React + TypeScript + Tailwind CSS v4** (`@tailwindcss/vite` plugin)
- **Zustand** for global state (no React context or Redux)
- No backend — all state is in-memory per session

## Architecture

The app is a single-page meeting utility for Toastmasters role-holders.

**Session lifecycle**: `App.tsx` gates on `store.started`. Until started, `Setup.tsx` is shown (add members one-by-one → Start Session). Once started, the tab shell renders.

**State** lives entirely in `src/store/session.ts` (Zustand). All role data (ah counts, timer slots, grammarian notes, evaluator fields, topics) is keyed off session members. Actions that run `setInterval` (timers) store the interval ID in the slot object so it can be cleared on pause/reset/remove.

**Role tabs** (`src/components/roles/`):
- `AhCounter.tsx` — keyboard shortcuts (`A/U/E/S/B/K`) increment filler word counts for the selected member row; listen via `window.addEventListener('keydown')` scoped to the active tab
- `Timer.tsx` — per-slot countdown with traffic light (green ≥ min, yellow ≥ max−60s, red ≥ max); slots are editable inline
- `Grammarian.tsx` — Word of the Day tracking + per-member usage tally + notes
- `GeneralEvaluator.tsx` — structured note sections + star rating
- `TopicsMaster.tsx` — question list with per-topic timers and done toggle

**Export** (`src/utils/export.ts`) — formats all role state as a text report and triggers a browser file download via `URL.createObjectURL`.

## Key conventions

- Tailwind utility classes only — no `App.css` or component CSS files
- Filler word keyboard map is defined in `store/session.ts` (`FILLER_KEY_MAP`) and imported by `AhCounter.tsx`
- Timer interval IDs are stored on the slot object (`intervalId?: ReturnType<typeof setInterval>`); always clear them before removing or resetting a slot
