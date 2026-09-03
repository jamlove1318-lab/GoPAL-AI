"""Cassidy production adapter.

The TypeScript production/runtime contracts remain authoritative. This module
provides Blender-side structural validation against the established semantic
node, expression, and animation names.
"""

import bpy

REQUIRED_NODES = (
    "Cassidy_Root", "Cassidy_Body", "Cassidy_Head", "Cassidy_Face",
    "Cassidy_Eye_L", "Cassidy_Eye_R", "Cassidy_Eyelid_L", "Cassidy_Eyelid_R",
    "Cassidy_Hand_L", "Cassidy_Hand_R", "Cassidy_Charm", "Cassidy_Hair_Root",
)

REQUIRED_ANIMATIONS = (
    "idle", "walk", "run", "turn", "sit", "talk", "gesture", "point",
    "celebrate", "think", "react",
)

REQUIRED_EXPRESSIONS = (
    "expression_neutral", "expression_happy", "expression_curious",
    "expression_surprised", "expression_thoughtful", "expression_excited",
    "expression_concerned", "expression_playful",
)


def collect_scene_contract_names():
    nodes = {obj.name for obj in bpy.data.objects}
    actions = {action.name for action in bpy.data.actions}
    morphs = set()

    for obj in bpy.data.objects:
        if obj.type != "MESH" or obj.data.shape_keys is None:
            continue
        morphs.update(key.name for key in obj.data.shape_keys.key_blocks)

    return nodes, actions, morphs


def validate_cassidy_scene() -> dict:
    nodes, animations, morphs = collect_scene_contract_names()
    missing_nodes = sorted(set(REQUIRED_NODES) - nodes)
    missing_animations = sorted(set(REQUIRED_ANIMATIONS) - animations)
    missing_expressions = sorted(set(REQUIRED_EXPRESSIONS) - morphs)

    return {
        "valid": not (missing_nodes or missing_animations or missing_expressions),
        "missing_nodes": missing_nodes,
        "missing_animations": missing_animations,
        "missing_expressions": missing_expressions,
    }
