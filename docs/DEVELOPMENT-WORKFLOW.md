# GoPAL-AI Development Workflow

## CI policy

Direct pushes to `main` intentionally do **not** start the expensive APK build or the full validation workflows.

- `Build Release APK`: manual (`workflow_dispatch`) only.
- `World Final Validation`: manual plus pull-request validation.
- `World Integration Typecheck`: manual plus pull-request validation.
- `verify-world-modal`: pull-request/manual verification only.

This keeps implementation batches cheap while retaining an explicit validation gate before device builds.

## Recommended cycle

1. Implement a coherent batch on a development branch.
2. Run local TypeScript checks when possible.
3. Open/update a PR against `main` for automatic validation.
4. Fix all validation failures in the same batch.
5. Merge only when validation is green.
6. Run the release APK workflow manually only when the batch is ready for device testing.
