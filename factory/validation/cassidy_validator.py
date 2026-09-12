"""
Cassidy production validation adapter.
Directly honors and enforces canonical GoPAL-AI character identity contracts.
"""

from typing import Dict, List, Set, Tuple

REQUIRED_NODES = (
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
)

REQUIRED_ANIMATIONS = (
    "idle",
    "walk",
    "run",
    "turn",
    "sit",
    "talk",
    "gesture",
    "point",
    "celebrate",
    "think",
    "react",
)

REQUIRED_EXPRESSIONS = (
    "expression_neutral",
    "expression_happy",
    "expression_curious",
    "expression_surprised",
    "expression_thoughtful",
    "expression_excited",
    "expression_concerned",
    "expression_playful",
)

MAX_MOBILE_TRIANGLES = 25000


def collect_scene_names():
    import bpy

    nodes = set()
    animations = set()
    morphs = set()
    total_triangles = 0

    for obj in bpy.data.objects:
        nodes.add(obj.name)

        if obj.type == "MESH" and obj.data:
            total_triangles += len(obj.data.polygons)
            if obj.data.shape_keys and obj.data.shape_keys.key_blocks:
                for key in obj.data.shape_keys.key_blocks:
                    morphs.add(key.name)

        if obj.animation_data:
            action = obj.animation_data.action
            if action:
                animations.add(action.name)

    for action in bpy.data.actions:
        animations.add(action.name)

    return nodes, animations, morphs, total_triangles


def validate_cassidy_scene() -> dict:
    nodes, animations, morphs, total_triangles = collect_scene_names()

    missing_nodes = sorted(set(REQUIRED_NODES) - nodes)
    missing_animations = sorted(set(REQUIRED_ANIMATIONS) - animations)
    missing_expressions = sorted(set(REQUIRED_EXPRESSIONS) - morphs)

    budget_exceeded = total_triangles > MAX_MOBILE_TRIANGLES
    errors: List[str] = []

    if missing_nodes:
        errors.append(f"Missing required nodes: {', '.join(missing_nodes)}")
    if missing_animations:
        errors.append(f"Missing required animations: {', '.join(missing_animations)}")
    if missing_expressions:
        errors.append(f"Missing required expressions: {', '.join(missing_expressions)}")
    if budget_exceeded:
        errors.append(f"Polygon budget exceeded: {total_triangles} > {MAX_MOBILE_TRIANGLES}")

    is_valid = not bool(errors)

    return {
        "valid": is_valid,
        "errors": errors,
        "missing_nodes": missing_nodes,
        "missing_animations": missing_animations,
        "missing_expressions": missing_expressions,
        "total_triangles": total_triangles,
        "budget_limit": MAX_MOBILE_TRIANGLES,
    }
