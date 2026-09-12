# Cassidy Phase 3I — Production Package Validation

## Purpose

Phase 3I closes the gap between the authored Cassidy asset and the GoPAL-AI runtime by adding a deterministic production-package validation step.

The validator is a gate, not a generator. It must never create, repair, substitute, rename, or cosmetically alter Cassidy assets.

## Authority

The existing TypeScript contracts remain authoritative:

- `src/characters/cassidyRuntimeModelContract.ts` — runtime semantic node, animation, and expression names.
- `src/characters/cassidyProductionAssetContract.ts` — production package shape, material slots, LOD requirements, controls, and package-level validation.
- `src/characters/cassidyProductionAssetRegistry.ts` — runtime asset registry and canonical reference identity.

`tools/cassidy/validate_cassidy_package.py` is an external validation adapter. It does not become a second runtime registry.

## Validation layers

### 1. Package identity

The manifest must identify `cassidy`, keep `identityLocked: true`, and provide canonical-design, production-spec, and package versions.

### 2. Coverage

The package must report the required five views, eight expressions, eleven animations, seven material slots, and three LOD tiers (`lod0`, `lod1`, `lod2`).

### 3. Controls

The package must explicitly provide facial controls, independent eye/gaze controls, hand controls, and secondary-motion controls.

### 4. File integrity

Every production file needs a unique ID, URI, version, and valid format metadata. Optional SHA-256 values are verified when supplied. Duplicate roles are rejected so a package cannot silently provide competing model/rig/animation authorities.

### 5. GLB/glTF inspection

When the canonical model is locally available, the validator reads JSON `.gltf` files or the JSON chunk of a binary `.glb` using the Python standard library. It checks:

- required semantic node names;
- eleven runtime animation clip names;
- eight `expression_*` morph target names;
- GLB v2 header and declared length;
- model checksum when supplied.

The validator fails closed on malformed or unsupported model files.

### 6. Blender authoring validation

`tools/cassidy/validate_cassidy_scene.py` remains the Blender-side scene validator. It is intentionally separate because Blender exposes authored rig/action/shape-key data that may not be fully represented in an exported package's JSON metadata.

## Execution

From a checkout containing the package manifest:

```bash
python tools/cassidy/validate_cassidy_package.py path/to/package.json
```

Exit codes:

- `0` — package passes validation.
- `1` — package is readable but requires review.
- `2` — manifest could not be read or parsed.

## Production gate

A production model should not be promoted to the runtime asset registry merely because a file exists. The intended sequence is:

`author → export → package manifest → package validation → visual review → runtime integration`

A failed gate leaves the existing runtime fallback unchanged. No automatic character substitution is permitted.

## Definition of done

Phase 3I is complete when an exported Cassidy package can be checked deterministically before runtime integration, with failures identifying the missing contract rather than silently accepting an incomplete character.
