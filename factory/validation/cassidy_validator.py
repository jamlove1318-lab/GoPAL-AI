"""Authoritative Cassidy scene contract validator."""
from __future__ import annotations
from typing import List
from factory.quality.placeholder_blocker import inspect_scene, REQUIRED_NODES, REQUIRED_ANIMATIONS, REQUIRED_EXPRESSIONS, true_triangle_count

MAX_MOBILE_TRIANGLES=25000

def collect_scene_names():
    import bpy
    nodes={o.name for o in bpy.data.objects}; animations={a.name for a in bpy.data.actions}; morphs=set(); total=0
    for obj in bpy.data.objects:
        if obj.type=="MESH" and obj.data:
            total += true_triangle_count(obj.data)
            if obj.data.shape_keys:
                morphs.update(k.name for k in obj.data.shape_keys.key_blocks)
    return nodes,animations,morphs,total

def validate_cassidy_scene()->dict:
    nodes,animations,morphs,total=collect_scene_names()
    missing_nodes=sorted(REQUIRED_NODES-nodes); missing_animations=sorted(REQUIRED_ANIMATIONS-animations); missing_expressions=sorted(REQUIRED_EXPRESSIONS-morphs)
    strict=inspect_scene(); errors:List[str]=[]
    if missing_nodes: errors.append(f"Missing required nodes: {', '.join(missing_nodes)}")
    if missing_animations: errors.append(f"Missing required animations: {', '.join(missing_animations)}")
    if missing_expressions: errors.append(f"Missing required expressions: {', '.join(missing_expressions)}")
    if total>MAX_MOBILE_TRIANGLES: errors.append(f"Triangle budget exceeded: {total} > {MAX_MOBILE_TRIANGLES}")
    errors.extend(strict["errors"])
    return {"valid":not errors,"errors":list(dict.fromkeys(errors)),"missing_nodes":missing_nodes,"missing_animations":missing_animations,"missing_expressions":missing_expressions,"total_triangles":total,"budget_limit":MAX_MOBILE_TRIANGLES,"strict_quality":strict}
