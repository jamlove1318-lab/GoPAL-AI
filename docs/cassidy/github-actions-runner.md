# Cassidy GitHub Actions Runner

## Purpose

This repository can use a self-hosted GitHub Actions runner on the Ubuntu/ARM64 machine that already contains Blender. GitHub Actions becomes the control plane; Blender and the Cassidy factory execute on the local machine.

## Runner labels

Register the machine with these labels:

- `self-hosted`
- `linux`
- `ARM64`
- `cassidy-blender`

The workflow intentionally does not run on pull requests. This keeps an internet-facing public repository from allowing untrusted fork code to execute on the local Blender machine.

## One-time setup

On GitHub, open **GoPAL-AI → Settings → Actions → Runners → New self-hosted runner**, select Linux/ARM64, and follow GitHub's generated registration commands on the Ubuntu machine. The registration token shown by GitHub is short-lived and must not be committed to the repository.

After registration, keep the runner process active. For a persistent Linux installation, GitHub supports installing the runner as a service so it starts with the machine.

## Running Cassidy

After this workflow is merged into the default `main` branch:

1. Open **Actions**.
2. Select **Cassidy Blender Production**.
3. Click **Run workflow**.
4. Choose `build` for a production build/preparation run.
5. The job is routed to the matching self-hosted Ubuntu/ARM64 runner.
6. Blender executes `tools/blender/characters/cassidy_ci_entry.py`.
7. Validation remains fail-closed. A missing/incomplete authored Cassidy asset blocks export.
8. Logs, the prepared `.blend`, and machine-readable reports are uploaded as workflow artifacts.

The current Cassidy authoring pipeline deliberately does not fabricate a finished humanoid from primitive geometry. The automation is therefore responsible for execution, validation, packaging, and evidence; a genuine authored Cassidy asset must still satisfy every production gate before a runtime GLB can be exported.
