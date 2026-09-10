# Living World Animation Assets

This directory is the shared asset boundary for animation metadata and future exported art references.

Do not put source `.blend`, Spine project files, Rive binaries, or Godot prototype projects here by default. Keep heavyweight source material in the corresponding production lane under `tools/` or in the approved art storage workflow, and keep runtime-ready exports referenced by manifests.

Every runtime-ready animation asset should be traceable to:

- semantic action from `src/engines/world/worldAnimationContract.ts`;
- target kind/id;
- source tool (`blender`, `spine`, `rive`, `godot`, or `native`);
- supported layers;
- fallback behavior;
- review/validation status.

The goal is one asset vocabulary shared by all four tools, not four independent animation systems.
