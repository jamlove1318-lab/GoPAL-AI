# Cassidy Production Factory — Quality Correction

The automated factory remains the builder/orchestrator, while the existing Cassidy contracts and acceptance architecture remain authoritative.

This correction removes several false-positive paths discovered in the first automated run:

- true triangle counting uses triangulation rather than polygon count;
- the acceptance gate performs a real GLB import round-trip;
- package manifests enumerate actual expression names;
- LOD0/LOD1/LOD2 are actual geometry copies with budgets, not metadata only;
- checkpoints are unique per stage and bound to the current production-job hash;
- local Git synchronization is safe, fast-forward-only, and enabled by default;
- Cassidy's canonical palette is restored to the approved chocolate/emerald/gold identity;
- rig binding uses multiple deform-bone influences instead of one-bone rigid assignment;
- required animation clips have distinct body/head/arm motion rather than one generic head rotation;
- a hard production floor prevents the former 684-polygon scaffold from being certified.

A successful structural build is no longer equivalent to production acceptance. A run is accepted only when the strict scene gate, artifact/package gate, and GLB round-trip all pass.
