# Reflection

This project provided a compact implementation of the Fuel EU Maritime compliance module using a hexagonal-like structure with clear separation between core domain logic and adapters.

What I learned using AI agents:
- They greatly speed up scaffolding and boilerplate generation (Express/Vite file templates, routing).
- They are less reliable on domain-specific computations; manual verification is necessary.

Efficiency gains vs manual coding:
- Saved time writing repetitive wiring and configuration.
- Improved iteration speed when experimenting with APIs and UI components.

Improvements for next time:
- Integrate Prisma + PostgreSQL for persistence and create migration/seed scripts.
- Add comprehensive unit/integration tests and CI.
- Use stricter linting and pre-commit hooks.
