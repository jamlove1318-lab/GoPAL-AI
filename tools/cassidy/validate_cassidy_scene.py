"""Blender-side validation starter for the Cassidy production pipeline.

Run inside Blender's Python environment after opening the production .blend.
This script validates semantic nodes/actions/morph targets; it never generates
or substitutes a character.
"""

import bpy

REQUIRED_OBJECTS = {
    "Cassidy_Root",
    "Cassidy_Body",
    "Cassidy_Head",
    "Cassidy_Face",
    "Cassidy_Eye_L",
    "Cassidy_Eye_R",
    "Cassidy_Eyelid_L",
    "Cassidy_Eyelid_R",
    "Cassidy_Hand_L",
    "Cassidy_Hand_R",
    "Cassidy_Charm",
    "Cassidy_Hair_Root",
}

REQUIRED_ANIMATIONS = {
    "idle", "walk", "run", "turn", "sit", "talk", "gesture",
    "point", "celebrate", "think", "react",
}

REQUIRED_EXPRESSIONS = {
    "neutral", "happy", "curious", "surprised", "thoughtful", "excited",
    "concerned", "playful",
}


def normalize(name: str) -> str:
    return name.strip().lower().replace(" ", "_").replace("-", "_")


def validate_objects():
    present = set(bpy.data.objects.keys())
    return sorted(REQUIRED_OBJECTS - present)


def validate_animations():
    present = {normalize(action.name) for action in bpy.data.actions}
    return sorted(REQUIRED_ANIMATIONS - present)


def validate_expressions():
    found = set()
    for obj in bpy.data.objects:
        if not obj.data or not hasattr(obj.data, "shape_keys") or not obj.data.shape_keys:
            continue
        for key in obj.data.shape_keys.key_blocks:
            name = normalize(key.name)
            if name.startswith("expression_"):
                found.add(name.removeprefix("expression_"))
    return sorted(REQUIRED_EXPRESSIONS - found)


def main():
    missing_objects = validate_objects()
    missing_animations = validate_animations()
    missing_expressions = validate_expressions()

    print("=== CASSIDY PRODUCTION VALIDATION ===")
    print("Missing objects:", missing_objects or "none")
    print("Missing animations:", missing_animations or "none")
    print("Missing expressions:", missing_expressions or "none")

    valid = not (missing_objects or missing_animations or missing_expressions)
    print("STATUS:", "PASS" if valid else "REVIEW REQUIRED")
    return valid


if __name__ == "__main__":
    main()
