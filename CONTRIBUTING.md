# Contributing to MeetFlow AI

We welcome contributions that help make professional networking smarter and more resilient!

## Code of Conduct

All contributors are expected to follow our professional Code of Conduct (Maintain respect, inclusivity, and technical integrity).

## Development Workflow

1. **Fork the repo** and create your branch from `main`.
2. **Setup environment**: Copy `.env.example` to `.env` and add your Gemini API key.
3. **Install dependencies**: `npm install`
4. **Code style**: We use ESLint and Prettier. Ensure `npm run lint` passes.
5. **Testing**: We maintain 90%+ coverage. Run `npm test` before submitting.

## Architectural Principles

- **Separation of Concerns**: Logic belongs in `src/services/` or `src/hooks/`. Components in `src/components/` should stay lean.
- **Resilience First**: Always implement fallbacks for AI calls and external services.
- **Type Safety**: Use JSDoc for complex logic and Zod for data boundary validation.

## Pull Request Process

- Ensure the PR description clearly explains the "Why" behind the change.
- Include screenshots/recordings for UI changes.
- Update the `README.md` if new Google ecosystem services are integrated.
