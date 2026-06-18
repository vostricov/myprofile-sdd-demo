# MyProfileSDDDemo Constitution

## Core Principles

- Code quality: All code MUST follow the repository style guide (see CONTRIBUTING.md). Every PR requires at least one approving reviewer and a green CI run. Static analysis (linters, type checks) MUST pass on CI. Maintainability goals: modular functions, modules kept concise (preferably <=200 LOC), documented public APIs. Technical debt MUST be recorded in issues and justified in PRs.

- Testing standards: Minimum overall test coverage target is 80%, with 90% for security/critical modules. Required test types: unit tests for logic, integration tests for service contracts, and end-to-end tests for critical user journeys. Test data MUST be deterministic and checked into fixtures where needed. Flaky tests MUST be quarantined, annotated, and fixed within one sprint; flaky tests must not be allowed to pass the main branch gating checks. CI MUST fail on regressions in required test suites.

- User experience consistency: Projects MUST use shared design tokens and approved component libraries when available. Accessibility baseline: WCAG 2.1 AA for public-facing surfaces; automated a11y checks run in CI. Interaction patterns (navigation, form handling, errors, loading states) MUST follow documented patterns in the style guide and include examples.

- Performance requirements: Define measurable budgets for key metrics (e.g., TTFB, First Contentful Paint, Lighthouse score). New features MUST include a performance assessment and local profiling where applicable. Regressions >5% vs. baseline on tracked KPIs require remediation before merge. Production monitoring and alerts MUST be configured for critical performance indicators.

## Purpose

Provide concise, enforceable standards that ensure high-quality, maintainable software, consistent user experience, and measurable performance.

## Contribution rules

Follow CONTRIBUTING.md: link an issue, include tests, ensure CI passes, obtain required approvals, and add an appropriate changelog entry for non-trivial changes.

## Testing & CI requirements

CI must run linters, type checks, unit/integration/e2e suites where applicable, and automated accessibility checks. Protected branches require green pipelines before merging.

## Release/versioning policy

Use semantic versioning. Breaking changes require a MAJOR bump and migration notes. Minor releases for new functionality; patch releases for fixes. Publish changelogs and upgrade guidance with each release.

## Security & vulnerability reporting

Report vulnerabilities per SECURITY.md. Critical vulnerabilities require immediate triage and an embargoed remediation/release process.

## Required repository files

README.md, LICENSE, CONTRIBUTING.md, SECURITY.md, CODE_OF_CONDUCT.md, and CI configuration MUST be present and kept current.

## License

Project license is declared in LICENSE at the repository root; contributions are accepted under that license.

## Enforcement / Exceptions

Exceptions require documented approval from maintainers and a timeboxed mitigation plan. Non-compliance may block merges until resolved.

## Governance

Amendments: propose via an issue and obtain maintainer approval; significant changes require a migration plan. Compliance: reviewers and CI enforce rules. Versioning: increment MINOR for principle additions/expansions, PATCH for wording/clarifications, MAJOR for breaking governance changes.

**Version**: 1.1.0 | **Ratified**: TODO(RATIFICATION_DATE): confirm original adoption date | **Last Amended**: 2026-06-18
