# Main + Living World Integration Safety Record

This staging branch is based on the current `main` commit and incorporates the living-world branch as a second merge parent.

## Preservation policy

- `main` remains the protected baseline.
- Existing main-only UI and behavior are preserved where the world branch had simplified or replaced them.
- World-specific additions and validated engine fixes are layered into the main baseline.
- No files are deleted as part of this integration.
- Final merge into `main` must occur only after CI validation is green.
