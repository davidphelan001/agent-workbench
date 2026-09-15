# Hephwerk

A personal intelligence/work environment: give it an idea, proposition, or
question you're developing, and Heph — the work system behind it —
interprets it, grounds it in relevant domain knowledge, actively challenges
it, and hands back a strengthened synthesis rather than a single answer.

Built on the [QuantumBlack Design System](https://github.com/mckinsey/quantumblack-design-system)
(QBDS) — components, design tokens, typography, and interaction conventions
are used as shipped, not reinvented.

## The model

```
ME → IDEAS → HEPH INVESTIGATES / DEVELOPS / CHALLENGES → CRIT → MY INPUT → STRONGER THINKING → HISTORY
```

Heph works through three specialists (Planner, Research, Reviewer) rather
than exposing a single black box. Submitting an idea walks it through:

1. **Interpretation** — Planner decomposes the idea: core claim, assumptions,
   ambiguities, concepts that need defining, alternative readings.
2. **Domain experts** — Research identifies which bodies of knowledge are
   actually relevant (picked by matching the submission's text against a
   catalog of disciplines, not a fixed generic list) and what each contributes.
3. **Critique** — Reviewer actively challenges it: weak assumptions,
   contradictions, missing evidence, failure modes, where the framing itself
   may be wrong. Never auto-agrees.
4. **Systems lens** — second-order effects across technology, organisation,
   people, economics, governance, and experience.
5. **Synthesis** — what's well supported, uncertain, contested, or missing.
   No single confidence number pretending false precision.
6. **Reframe** — a strengthened version of the original idea.
7. **Your input** — Accept, Challenge, ask to go deeper, ask for more
   evidence, or revise the proposition entirely.

## Navigation

- **At a glance** — what you're working on, what's changed, what needs you.
- **Ideas** — every proposition and line of thinking you're developing.
- **Crit queue** — the ideas where your judgement could materially improve
  the thinking, right now.
- **Heph's activity** — a chronological stream of what Heph has actually
  done: investigating, connecting, challenging.
- **History** — accepted syntheses, and how your thinking on them evolved.

All data is mocked (`src/data/`) and state lives in `App.tsx`. There is no
backend — the shape of `Inquiry` and `ActivityEvent` in
`src/types/domain.ts` is meant to be what a real reasoning/orchestration
layer would eventually populate.

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
