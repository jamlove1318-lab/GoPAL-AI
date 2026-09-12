"""
Blender entry runner for Cassidy Production Orchestrator.
Parses arguments passed after '--' and dispatches to stage handler.
"""

import sys
from pathlib import Path

# Args after '--': stage, checkpoint_to_load, repo_dir
args = []
if "--" in sys.argv:
    args = sys.argv[sys.argv.index("--") + 1:]

stage = args[0] if len(args) > 0 else "INIT"
chk_arg = args[1] if len(args) > 1 and args[1] else None
repo_dir = Path(args[2]).resolve() if len(args) > 2 else Path(".").resolve()

# Add repo_dir to sys.path so factory package imports cleanly inside Blender
if str(repo_dir) not in sys.path:
    sys.path.insert(0, str(repo_dir))

from factory.orchestrator.orchestrator import CassidyProductionOrchestrator

orchestrator = CassidyProductionOrchestrator(repo_dir=repo_dir)
chk_path = Path(chk_arg) if chk_arg else None

try:
    success = orchestrator.run_stage_inside_blender(stage=stage, checkpoint_to_load=chk_path)
    if not success:
        sys.exit(1)
except Exception as e:
    import traceback
    print(f"[BLENDER-RUNNER] Unhandled Exception in stage {stage}: {e}", file=sys.stderr, flush=True)
    traceback.print_exc()
    sys.exit(1)
