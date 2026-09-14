# GoPAL-AI Remote Blender Factory

This directory contains repository-owned Blender automation. Blender itself is **not committed to the repository** and does not need to be installed on the user's phone.

The GitHub Actions runner can download a pinned Blender build temporarily, run it headlessly, validate scenes, render production previews, and publish selected outputs as workflow artifacts.

## Intended uses

- world/environment asset generation
- prop and landmark validation
- animation preview renders
- scene inspection
- deterministic asset checks
- future Emerald Valley production work

## Local command shape on a runner

```bash
./tools/blender/install-blender.sh
"$BLENDER_ROOT/blender" --background --python tools/blender/validate_headless.py
```

Blender supports background/headless command-line operation, including scripted rendering and automation.

The mobile app remains Expo/React Native. Blender is a production toolchain, not a runtime dependency.
