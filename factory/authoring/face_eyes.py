"""
GoPAL-AI Cassidy Face & Eye Authoring.
Constructs canonical Cassidy_Face, Cassidy_Eye_L, Cassidy_Eye_R,
Cassidy_Eyelid_L, and Cassidy_Eyelid_R.
"""

from typing import Dict


def create_face_and_eyes(head_obj, materials: Dict):
    """Author face surface, eyes, and eyelids under Cassidy_Head."""
    import bpy
    import bmesh

    created = {}
    coll = bpy.data.collections.get("CHARACTERS") or bpy.context.scene.collection

    # 1. Cassidy_Face
    face_obj = bpy.data.objects.get("Cassidy_Face")
    if face_obj is None:
        mesh = bpy.data.meshes.new("Cassidy_Face_Mesh")
        face_obj = bpy.data.objects.new("Cassidy_Face", mesh)
        coll.objects.link(face_obj)
        face_obj.parent = head_obj
        face_obj.location = (0.0, 0.09, 0.0)

        bm = bmesh.new()
        # Front facial plane with nose, mouth, cheeks
        bmesh.ops.create_grid(bm, x_segments=6, y_segments=6, size=0.10)
        for v in bm.verts:
            # Curve around face cylinder
            angle = (v.co.x / 0.10) * 0.7
            v.co.y = -(v.co.x ** 2) * 2.5
            # Nose ridge
            if abs(v.co.x) < 0.015 and -0.01 < v.co.y < 0.02:
                v.co.y += 0.012

        bm.to_mesh(mesh)
        bm.free()

        skin_mat = materials.get("M_Cassidy_Skin")
        if skin_mat:
            face_obj.data.materials.append(skin_mat)

    created["Cassidy_Face"] = face_obj

    # 2. Cassidy_Eye_L and Cassidy_Eye_R
    sclera_mat = materials.get("M_Cassidy_Eye_Sclera")
    iris_mat = materials.get("M_Cassidy_Eye_Iris")

    for sign, side in [(-1, "L"), (1, "R")]:
        eye_name = f"Cassidy_Eye_{side}"
        eye_obj = bpy.data.objects.get(eye_name)
        if eye_obj is None:
            mesh = bpy.data.meshes.new(f"{eye_name}_Mesh")
            eye_obj = bpy.data.objects.new(eye_name, mesh)
            coll.objects.link(eye_obj)
            eye_obj.parent = head_obj
            eye_obj.location = (sign * 0.045, 0.095, 0.01)

            bm = bmesh.new()
            # Curved eye dome
            bmesh.ops.create_uvsphere(bm, u_segments=12, v_segments=8, radius=0.022)
            for v in bm.verts:
                v.co.y *= 0.4  # Flatten along depth
            bm.to_mesh(mesh)
            bm.free()

            if sclera_mat:
                eye_obj.data.materials.append(sclera_mat)
            if iris_mat:
                eye_obj.data.materials.append(iris_mat)

        created[eye_name] = eye_obj

    # 3. Cassidy_Eyelid_L and Cassidy_Eyelid_R
    skin_mat = materials.get("M_Cassidy_Skin")

    for sign, side in [(-1, "L"), (1, "R")]:
        lid_name = f"Cassidy_Eyelid_{side}"
        lid_obj = bpy.data.objects.get(lid_name)
        if lid_obj is None:
            mesh = bpy.data.meshes.new(f"{lid_name}_Mesh")
            lid_obj = bpy.data.objects.new(lid_name, mesh)
            coll.objects.link(lid_obj)
            lid_obj.parent = head_obj
            lid_obj.location = (sign * 0.045, 0.098, 0.022)

            bm = bmesh.new()
            # Curved eyelid fold
            bmesh.ops.create_cone(bm, cap_ends=True, segments=8, radius1=0.024, radius2=0.020, depth=0.008)
            for v in bm.verts:
                v.co.y *= 0.4
            bm.to_mesh(mesh)
            bm.free()

            if skin_mat:
                lid_obj.data.materials.append(skin_mat)

        created[lid_name] = lid_obj

    return created
