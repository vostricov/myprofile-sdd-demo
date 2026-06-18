<!--
Sync Impact Report
Version change: 1.0.0 -> 1.1.0
Modified principles:
- Template principle 1 -> I. Specification Authority
- Template principle 2 -> II. One Task, One Feature Branch
- III. Traceable Implementation expanded with commit message format
- Template principle 4 -> IV. Verification Before Completion
- Template principle 5 -> V. Repository Hygiene
Added sections:
- Implementation Constraints
- Development Workflow
Removed sections:
- Template placeholder sections
Templates requiring updates:
- Updated: .specify/templates/plan-template.md
- Updated: .specify/templates/tasks-template.md
- Reviewed, no change required: .specify/templates/spec-template.md
Runtime guidance updated:
- AGENTS.md
- .github/copilot-instructions.md
Deferred items:
- None
-->
# MyProfile SDD Demo Constitution

## Core Principles

### I. Specification Authority
The active feature specification, implementation plan, and task list are the
source of truth for implementation. Work MUST be traceable to the current
`spec.md`, `plan.md`, and `tasks.md` artifacts under the active feature
directory. Material scope or architecture changes MUST update the relevant
artifact before implementation continues.

### II. One Task, One Feature Branch
Each implementation task MUST be completed in its own feature branch. A branch
MUST contain only the changes required for one task ID from `tasks.md`, plus
directly required documentation or generated lockfile updates. Branch names MUST
start with `feature/` and SHOULD include the task ID and a short slug, for
example `feature/t001-scaffold-frontend`.

### III. Traceable Implementation
Every task MUST keep its task ID visible in the task list, related issue or pull
request, branch name, and commit messages. Commit messages for task work MUST
start with the task ID in square brackets followed by a concise description of
the change, for example `[T001] scaffold project`. Task completion MUST be
recorded by changing only the completed task checkbox from `[ ]` to `[X]` in
`tasks.md`. Unrelated tasks MUST remain unchecked until they are implemented and
verified.

### IV. Verification Before Completion
A task MUST NOT be marked complete until its acceptance criteria have been
verified. Verification MAY include automated tests, build commands, browser
checks, or documented manual validation appropriate to the task. Any skipped or
unavailable validation MUST be reported with a reason.

### V. Repository Hygiene
Changes MUST be scoped to the active task and preserve unrelated user or
workspace changes. Generated artifacts, dependency directories, build outputs,
logs, local environment files, and editor metadata MUST be ignored unless they
are explicitly required source artifacts. Destructive git operations MUST NOT be
used to clean up unrelated work.

## Implementation Constraints

- Implementation starts from the current feature plan and task list.
- Each task branch MUST be created before editing files for that task.
- Branch names MUST use the form `feature/t###-short-task-slug`.
- Commit messages MUST use the form `[T###] concise task-specific message`.
- If one task depends on another task branch, the dependent branch SHOULD be
  created from the completed dependency branch or from the integration branch
  after the dependency has merged.
- A pull request SHOULD reference the task ID and related GitHub issue.

## Development Workflow

- Read the active feature plan before implementing a task.
- Confirm checklist status before implementation when checklists exist.
- Create or switch to the dedicated `feature/` branch for the specific task.
- Implement only that task's required files and direct supporting artifacts.
- Run the task's acceptance validation.
- Commit with a task-prefixed message, for example `[T001] scaffold project`.
- Mark the task `[X]` in `tasks.md` only after validation passes.
- Report changed files, validation commands, and any remaining risks.

## Governance

This constitution supersedes informal project practices for specification,
planning, task execution, branching, and verification. Amendments require an
explicit constitution update, a version bump, and propagation to affected
templates or runtime guidance.

Versioning follows semantic versioning:
- MAJOR for incompatible governance changes or principle removals.
- MINOR for new principles, required workflow additions, or materially expanded
  constraints.
- PATCH for wording clarifications that do not change required behavior.

Compliance is reviewed during planning, task generation, implementation, and
pull request review. Constitution conflicts MUST be resolved by updating the
feature artifacts or the proposed implementation before work is considered
complete.

**Version**: 1.1.0 | **Ratified**: 2026-06-18 | **Last Amended**: 2026-06-18
