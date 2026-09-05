"""
Orchestrator State Persistence.
Tracks stage progress, checkpoints, and diagnostics.
"""

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

DEFAULT_STATE_PATH = Path("build/cassidy/orchestrator-state.json")


class OrchestratorState:
    def __init__(
        self,
        job_id: str = "default",
        current_stage: str = "INIT",
        stage_statuses: Optional[Dict[str, str]] = None,
        checkpoints: Optional[Dict[str, str]] = None,
        diagnostics: Optional[List[str]] = None,
        job_hash: Optional[str] = None,
    ):
        self.job_id = job_id
        self.current_stage = current_stage
        self.stage_statuses = stage_statuses or {}
        self.checkpoints = checkpoints or {}
        self.diagnostics = diagnostics or []
        self.job_hash = job_hash
        self.last_updated = datetime.now(timezone.utc).isoformat()

    def mark_stage(self, stage: str, status: str, checkpoint: Optional[str] = None):
        self.stage_statuses[stage] = status
        self.current_stage = stage
        if checkpoint:
            self.checkpoints[stage] = str(checkpoint)
        self.last_updated = datetime.now(timezone.utc).isoformat()

    def add_diagnostic(self, message: str):
        entry = f"[{datetime.now(timezone.utc).strftime('%H:%M:%S')}] {message}"
        self.diagnostics.append(entry)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "job_id": self.job_id,
            "job_hash": self.job_hash,
            "current_stage": self.current_stage,
            "stage_statuses": self.stage_statuses,
            "checkpoints": self.checkpoints,
            "diagnostics": self.diagnostics,
            "last_updated": self.last_updated,
        }

    def save(self, filepath: Path = DEFAULT_STATE_PATH):
        filepath.parent.mkdir(parents=True, exist_ok=True)
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(self.to_dict(), f, indent=2)

    @classmethod
    def load(cls, filepath: Path = DEFAULT_STATE_PATH) -> "OrchestratorState":
        if not filepath.is_file():
            return cls()
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                data = json.load(f)
            inst = cls(
                job_id=data.get("job_id", "default"),
                current_stage=data.get("current_stage", "INIT"),
                stage_statuses=data.get("stage_statuses", {}),
                checkpoints=data.get("checkpoints", {}),
                diagnostics=data.get("diagnostics", []),
                job_hash=data.get("job_hash"),
            )
            inst.last_updated = data.get("last_updated", inst.last_updated)
            return inst
        except Exception:
            return cls()
