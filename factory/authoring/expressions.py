"""
GoPAL-AI Cassidy Morph Target & Expression Authoring.
Constructs all 8 canonical facial shape keys directly on Cassidy_Face and Cassidy_Head.
"""

from typing import List

REQUIRED_EXPRESSIONS = [
    "expression_neutral",
    "expression_happy",
    "expression_curious",
    "expression_surprised",
    "expression_thoughtful",
    "expression_excited",
    "expression_concerned",
    "expression_playful",
]


def author_expressions(face_obj):
    """Create shape keys for all required emotional expressions."""
    import bpy

    if not face_obj or face_obj.type != "MESH":
        return

    mesh = face_obj.data

    # Ensure Basis shape key exists
    if not mesh.shape_keys:
        face_obj.shape_key_add(name="Basis")

    basis = mesh.shape_keys.key_blocks["Basis"]

    for expr in REQUIRED_EXPRESSIONS:
        key_block = mesh.shape_keys.key_blocks.get(expr)
        if key_block is None:
            key_block = face_obj.shape_key_add(name=expr, from_mix=False)

        # Deform vertices to match each expression's personality
        for i, pt in enumerate(key_block.data):
            base_co = basis.data[i].co
            pt.co = base_co.copy()

            if expr == "expression_happy":
                # Smile: pull mouth corners up and slightly wide
                if abs(base_co.x) > 0.02 and base_co.z < -0.01:
                    pt.co.z += 0.012
                    pt.co.y += 0.005

            elif expr == "expression_curious":
                # Asymmetric brow raise, slight head tilt feel
                if base_co.x > 0.01 and base_co.z > 0.02:
                    pt.co.z += 0.015

            elif expr == "expression_surprised":
                # Open mouth, eyes widen
                if base_co.z < -0.02:
                    pt.co.z -= 0.015
                if base_co.z > 0.02:
                    pt.co.z += 0.010

            elif expr == "expression_thoughtful":
                # Brow knit, mouth pursed
                if abs(base_co.x) < 0.02 and base_co.z > 0.02:
                    pt.co.z -= 0.008
                if base_co.z < -0.01:
                    pt.co.x *= 0.85

            elif expr == "expression_excited":
                # Big joyous smile, raised cheeks
                if base_co.z < 0.0:
                    pt.co.z += 0.018
                    pt.co.y += 0.008

            elif expr == "expression_concerned":
                # Inner brows raised, soft downturned mouth corners
                if abs(base_co.x) < 0.02 and base_co.z > 0.02:
                    pt.co.z += 0.012
                if abs(base_co.x) > 0.02 and base_co.z < -0.01:
                    pt.co.z -= 0.010

            elif expr == "expression_playful":
                # Winking, cheeky smirk
                if base_co.x > 0.02 and base_co.z < -0.01:
                    pt.co.z += 0.015
                if base_co.x < -0.01 and base_co.z > 0.01:
                    pt.co.z -= 0.008

    print(f"[GoPAL-FACTORY] Authored {len(REQUIRED_EXPRESSIONS)} expressions on {face_obj.name}", flush=True)
