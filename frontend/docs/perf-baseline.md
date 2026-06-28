# Performance Baseline

Task: SPEC-001/T020, SPEC-002/T023

## Command

Run the Lighthouse CI budget locally from `frontend/`:

```sh
npm run lhci
```

The command builds the production bundle and runs Lighthouse CI against `dist/`
using `ci/lighthouseci.yml`.

## Budgets

- Lighthouse Performance: `>= 90`
- Lighthouse Accessibility: `>= 90`
- Lighthouse Best Practices: `>= 90`
- Simulated 3G-equivalent largest contentful paint: `<= 2s`
- Simulated 3G-equivalent time to interactive: warning at `> 2s`

## Night Mode Acceptance

The SPEC-002 night-mode toggle must preserve the existing Lighthouse budgets.
The implementation adds CSS token overrides, a small display-mode context, and
browser-local preference persistence only; it does not add network requests or
backend dependencies.

Final SPEC-002 validation records the current `npm run lhci` result in
`frontend/docs/night-mode-qa.md`. The target remains Performance,
Accessibility, and Best Practices at or above 90, with the 3G-equivalent load
metrics inside the existing 2-second budget.

## Latest Baseline

Local run from `npm run lhci` on 2026-06-22:

| Metric | Result |
|--------|--------|
| Performance | 90 |
| Accessibility | 100 |
| Best Practices | 96 |
| SEO | 90 |
| First Contentful Paint | 1.4s |
| Largest Contentful Paint | 1.5s |
| Time to Interactive | 1.5s |
| Speed Index | 1.4s |
| Total Blocking Time | 0ms |
| Cumulative Layout Shift | 0 |
