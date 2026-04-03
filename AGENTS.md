# Repository Guidelines

## Project Structure & Module Organization
This repository is a small TypeScript monorepo:

- `sinto-app/`: Vite + React frontend. Main code lives in `src/`, reusable UI in `src/components/`, route pages in `src/pages/`, shared state in `src/context/`, and static assets in `public/`.
- `sinto-api/`: Fastify API with Prisma. Feature modules live in `src/modules/`, shared middleware/utilities in `src/shared/`, config in `src/config/`, and database schema/migrations in `prisma/`.
- `sinto-cli/`: Commander-based CLI and TUI. Commands live in `src/commands/`, terminal UI code in `src/tui/`, and shared helpers in `src/lib/`.
- `docs/`, `openspec/`, and root Markdown files store architecture and implementation notes.

## Build, Test, and Development Commands
Run commands from the relevant package directory:

- `cd sinto-app && npm run dev`: start the frontend locally with Vite.
- `cd sinto-app && npm run build`: type-check and build the frontend bundle.
- `cd sinto-app && npm run lint`: lint frontend TypeScript/React files.
- `cd sinto-api && npm run dev` or `make dev`: start the API server.
- `cd sinto-api && npm run test`: run API tests with Vitest.
- `cd sinto-api && npm run test:coverage`: generate API coverage output.
- `cd sinto-api && make migrate && make seed`: apply local Prisma migrations and seed data.
- `cd sinto-cli && npm run dev`: run the CLI entrypoint with `ts-node`.

## Coding Style & Naming Conventions
Use TypeScript throughout with 2-space indentation, descriptive names, and small feature-focused modules. React components, pages, and providers use `PascalCase` filenames like `MainPage.tsx`; hooks use `camelCase` with a `use` prefix like `useCycles.ts`; CSS modules follow `ComponentName.module.css`. The API package enforces ESLint + Prettier (`singleQuote`, `semi: false`, trailing commas). The frontend has separate ESLint rules and some semicolon-based files, so match the style already present in the package you edit.

## Testing Guidelines
API tests use Vitest and live in `src/modules/**/__tests__/*.test.ts`. Add tests for new service logic, calculation rules, and bug fixes. There is no enforced global coverage threshold today, but new API behavior should ship with targeted coverage. Frontend and CLI tests are not configured yet; if you add them, keep them package-local and document the command.

## Commit & Pull Request Guidelines
Recent history follows Conventional Commits such as `feat: ...`, `fix: ...`, and `chore: ...`. Keep commit subjects short and imperative. PRs should include a brief summary, affected package(s), setup or migration notes, linked issues when applicable, and screenshots or terminal output for UI/CLI changes. Avoid mixing unrelated frontend, API, and CLI work in one PR.
