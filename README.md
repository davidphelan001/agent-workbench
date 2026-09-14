# Agent Workbench

An experimental prototype exploring what it means for a human to manage and
work alongside an organisation of AI agents: what should the human see, and
when should they need to intervene.

Built on the [QuantumBlack Design System](https://github.com/mckinsey/quantumblack-design-system)
(QBDS) — components, design tokens, typography, and interaction conventions
are used as shipped, not reinvented.

## What this is

Five agents (Planner, Research, Customer, Operations, Reviewer) work
continuously against mocked data. Most of their work never surfaces. The
prototype is built around the moments it does:

- **Overview** — what the organisation is doing, and what actually needs you.
- **Judgement queue** — decisions genuinely requiring human input: what
  happened, what's recommended, the evidence and policy behind it, and why
  it was escalated.
- **Investigate** — a five-stage chain (customer history → knowledge → policy
  → agent reasoning → recommendation) for inspecting how a recommendation
  was reached.
- **Agent disagreement** — when two agents reach different conclusions from
  the same evidence, both positions are shown side by side.
- **Agent activity** — a chronological stream of what agents have done,
  requested of each other, and escalated.
- **Audit history** — resolved decisions, including cases where a human
  overrode the agent's recommendation.

All data is mocked (`src/data/`) and state lives in `App.tsx`. There is no
backend — the shape of `Decision` and `ActivityEvent` in `src/types/domain.ts`
is meant to be what a real agent orchestration layer would eventually
populate.

## Running it

```bash
npm install
npm run dev
```

Then open the printed local URL (defaults to `http://localhost:5173`).

```bash
npm run build      # production build
npm run typecheck  # tsc --noEmit
```

## Notes

- Material Symbols Sharp and Inter/Roboto Mono are self-hosted (via the
  `material-symbols` and `@fontsource/*` packages) rather than loaded from
  Google Fonts, so the UI doesn't depend on an external font CDN at runtime.
- QBDS component source lives in `src/components/ui/` and is used unmodified
  from the upstream registry, per its "copy, don't install" model.
