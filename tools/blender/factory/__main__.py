"""Command-line entry point for the Blender production factory.

Usage inside Blender:
  blender --background --factory-startup --python tools/blender/factory/__main__.py
"""

from bootstrap import initialize
from validation import validate_production_scene


def main() -> int:
    initialize()
    errors = validate_production_scene()

    if errors:
        print("[GoPAL-FACTORY] VALIDATION_FAILED")
        for error in errors:
            print(f"[GoPAL-FACTORY] ERROR: {error}")
        return 1

    print("[GoPAL-FACTORY] VALIDATION_OK")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
