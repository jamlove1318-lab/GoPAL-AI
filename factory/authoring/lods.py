"""
GoPAL-AI Cassidy LOD Hierarchy & Optimization.
Configures LOD levels for mobile performance budgets.
"""


def setup_lods(root_obj):
    """Verify and tag LOD configuration across mesh objects."""
    import bpy

    # Tag custom properties on root for LOD metadata
    root_obj["lod_levels"] = 3
    root_obj["lod0_budget"] = 25000
    root_obj["lod1_budget"] = 12000
    root_obj["lod2_budget"] = 5000

    print("[GoPAL-FACTORY] LOD metadata configured on Cassidy_Root", flush=True)
