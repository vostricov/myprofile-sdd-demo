# MyProfile SDD Demo

This repository is a demo project that showcases Git branching fundamentals and the capabilities of the Spec-Driven Development (SDD) framework.

The project uses Spec Kit artifacts to drive implementation from a written specification through a plan, task breakdown, isolated task branches, commits, and pull requests. The current application is a React + TypeScript single-page profile viewer/editor built with Vite.

## Project Structure

- `frontend/` - React 19 + TypeScript + Vite application.
- `specs/001-view-business-profile/spec.md` - feature specification.
- `specs/001-view-business-profile/plan.md` - implementation plan and technical context.
- `specs/001-view-business-profile/tasks.md` - task list, branch policy, and acceptance criteria.
- `initial input/` - source input material used to define the profile data.

## Prerequisites

- Node.js and npm
- Git

## How To Run The Project

Install frontend dependencies:

```sh
cd frontend
npm install
```

Start the development server:

```sh
npm run dev
```

Vite prints the local URL in the terminal, usually `http://localhost:5173`.

## Useful Commands

Run the production build:

```sh
cd frontend
npm run build
```

Run tests:

```sh
cd frontend
npm run test
```

Preview the production build locally:

```sh
cd frontend
npm run preview
```

## Development Workflow

This repository demonstrates a branch-per-task workflow. Each implementation task is expected to use a dedicated branch named with the spec ID and task ID, for example `feature/spec-001/t001-scaffold-frontend`.

Before starting a task, read the current Spec Kit plan and task list:

```sh
sed -n '1,220p' specs/001-view-business-profile/plan.md
sed -n '1,260p' specs/001-view-business-profile/tasks.md
```

Task commits use the format `[SPEC-001/T###] concise description`, and each pull request should stay scoped to a single task or focused documentation update.
