# Engineering Metrics Dashboard

Open the dashboard at `/engineering-dashboard` when the Vite dev server or
preview server is running.

Refresh the snapshot with:

```sh
npm run metrics:dashboard
```

Generate the shareable Markdown and Excel reports with:

```sh
npm run metrics:export
```

Refresh the data and regenerate both report formats in one command:

```sh
npm run metrics:report
```

The report command writes dated files under `frontend/reports/` and also updates
stable attachment paths:

- `frontend/reports/engineering-metrics-report-latest.md`
- `frontend/reports/engineering-metrics-report-latest.xlsx`

The generator uses the authenticated `gh` CLI for pull requests, reviews,
workflow runs, and PR commits, then uses local `git log --all` for commit
timestamps. Weekly buckets are ISO weeks in `Europe/Chisinau`.

Metric definitions:

- PR cycle time: merged PR `created_at` to `merged_at`, grouped by merge week.
- Lead time for changes: earliest PR commit author timestamp to `merged_at`.
- Review latency: PR `created_at` to first non-author review submission.
- Pipeline pass rate: successful completed workflow runs divided by completed
  applicable runs; cancelled, neutral, and skipped runs are excluded.
- Bus-factor hotspots: weekly share of review submissions by reviewer.
- Individual performance: weekly contributor totals for activities, authored
  commits, submitted reviews, added lines, and deleted lines. Activities equal
  authored commits plus submitted reviews.
- After-hours work: share of commits authored at or after 18:00 local time.

Override defaults when regenerating:

```sh
DASHBOARD_TIMEZONE=Europe/Chisinau AFTER_HOURS_START=18 npm run metrics:dashboard
```
