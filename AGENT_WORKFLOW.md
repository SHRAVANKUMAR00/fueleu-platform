# AI Agent Workflow Log

## Agents Used
- GitHub Copilot (inline code suggestions)
- OpenAI ChatGPT (design, scaffolding, and code generation)

## Prompts & Outputs
- Example 1: Prompt: "Create Express TypeScript endpoints for routes, compliance, banking and pooling".
  - Output: generated handlers in `backend/src/adapters/inbound/http/routes.ts`.
- Example 2: Prompt: "Create a Vite + React TypeScript app with 4 tabs and an API client".
  - Output: `frontend/src/App.tsx`, `frontend/src/adapters/infra/apiClient.ts`.

## Validation / Corrections
- I reviewed numeric formulas manually (unit conversions: g → tonnes via MJ) and fixed small edge-cases (division by zero in percent diff, bank apply validations).

## Observations
- Agents speed up boilerplate (project scaffolding, routing) but require manual review for domain-specific math.
- In-memory adapters are useful to prototype before adding Postgres/Prisma.

## Best Practices Followed
- Kept core domain functions pure and isolated in `core/`.
- Exposed a small, well-documented HTTP surface for the frontend to consume.
