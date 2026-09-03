"""Persistent state for the Cassidy local production agent."""
from __future__ import annotations
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional

DEFAULT_STATE_PATH = Path("build/cassidy/orchestrator-state.json")


class OrchestratorState:
    def __init__(self, job_id: str = "default", current_stage: str = "INIT",
                 stage_statuses: Optional[dict[str, str]] = None,
                 checkpoints: Optional[dict[str, str]] = None,
                 diagnostics: Optional[list[str]] = None,
                 job_hash: Optional[str] = None):
        self.job_id = job_id
        self.current_stage = current_stage
        self.stage_statuses = stage_statuses or {}
        self.checkpoints = checkpoints or {}
        self.diagnostics = diagnostics or []
        self.job_hash = job_hash
        self.last_updated = datetime.now(timezone.utc).isoformat()

    def mark_stage(self, stage: str, status: str, checkpoint: Optional[str] = None) -> None:
        self.stage_statuses[stage] = status
        self.current_stage = stage
        if checkpoint:
            self.checkpoints[stage] = checkpoint
        self.last_updated = datetime.now(timezone.utc).isoformat()

    def add_diagnostic(self, message: str) -> None:
        self.diagnostics.append(f"[{datetime.now(timezone.utc).strftime('%H:%M:%S')}] {message}")
        self.last_updated = datetime.now(timezone.utc).isoformat()

    def to_dict(self) -> dict[str, Any]:
        return {
            "job_id": self.job_id, "job_hash": self.job_hash,
            "current_stage": self.current_stage,
            "stage_statuses": self.stage_statuses,
            "checkpoints": self.checkpoints,
            "diagnostics": self.diagnostics,
            "last_updated": self.last_updated,
        }

    def save(self, filepath: Path = DEFAULT_STATE_PATH) -> None:
        filepath.parent.mkdir(parents=True, exist_ok=True)
        tmp = filepath.with_suffix(filepath.suffix + ".tmp")
        tmp.write_text(json.dumps(self.to_dict(), indent=2, sort_keys=True) + "\n", encoding="utf-8")
        tmp.replace(filepath)

    @classmethod
    def load(cls, filepath: Path = DEFAULT_STATE_PATH) -> "OrchestratorState":
        if not filepath.is_file():
            return cls()
        try:
            data = json.loads(filepath.read_text(encoding="utf-8"))
            inst = cls(data.get("job_id", "default"), data.get("current_stage", "INIT"),
                       data.get("stage_statuses", {}), data.get("checkpoints", {}),
                       data.get("diagnostics", []), data.get("job_hash"))
            inst.last_updated = data.get("last_updated", inst.last_updated)
            return inst
        except Exception:
            return cls()
