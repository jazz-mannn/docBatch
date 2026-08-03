# Contributing

DocBatch is an open-source project released under the MIT License. Contributions are welcome through focused pull requests.

By submitting a contribution, you agree that your contribution will be licensed under the same MIT License that covers the project.

## Workflow

1. Create a branch from `main`.
2. Use a focused branch name such as `feature/pdf-field-editor`.
3. Keep changes scoped to one feature or fix.
4. Run type checking, tests, and the production build.
5. Open a pull request with the problem, solution, and validation results.

## Code standards

- Use TypeScript strict mode.
- Keep file processing client-side unless a feature explicitly requires a server.
- Validate every uploaded file before processing.
- Avoid logging spreadsheet records or document contents.
- Add tests for reusable calculations and filename handling.
- Do not remove third-party copyright or licence notices.
