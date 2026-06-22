# Performance Baseline

Task: SPEC-001/T020

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
