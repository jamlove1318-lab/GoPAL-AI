"""Cassidy production orchestrator.

The current production authoring pipeline is intentionally atomic: the existing
Blender CI entrypoint owns the complete preparation/validation/export pass.
This layer coordinates that real pipeline from Linux, tracks job state, and
never pretends that an un-authored character passed production gates.
"""
from __future__ import annotations

import hashlib
import json
import os
import subprocess
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional

from .state import OrchestratorState

DEFAULT_JOB = Path("jobs/cassidy-production.json")
DEFAULT_STATE = Path("build/cassidy/orchestrator-state.json")
ARTIFACTS = Path("artifacts/cassidy")
CI_ENTRY = Path("tools/blender/characters/cassidy_ci_entry.py")
CI_VALIDATE = Path("tools/blender/characters/cassidy_ci_validate.py")
CI_EXPORT = Path("tools/blender/characters/cassidy_export.py")


class CassidyProductionOrchestrator:
    def __init__(self, repo_dir: Optional[Path] = None, job_path: Optional[Path] = None,
                 state_path: Optional[Path] = None):
        self.repo_dir = (repo_dir or Path(".")).resolve()
        self.job_path = (job_path or self.repo_dir / DEFAULT_JOB).resolve()
        self.state_file = (state_path or self.repo_dir / DEFAULT_STATE).resolve()
        self.artifacts_dir = (self.repo_dir / ARTIFACTS).resolve()
        self.state = OrchestratorState.load(self.state_file)
        self.job = self._load_job()

    def _load_job(self) -> dict[str, Any]:
        if not self.job_path.is_file():
            return {}
        try:
            return json.loads(self.job_path.read_text(encoding="utf-8"))
        except Exception as exc:
            raise RuntimeError(f"Invalid Cassidy job file: {exc}") from exc

    def job_hash(self) -> Optional[str]:
        if not self.job_path.is_file():
            return None
        return hashlib.sha256(self.job_path.read_bytes()).hexdigest()

    def status(self) -> dict[str, Any]:
        return {
            "character": self.job.get("character", "Cassidy"),
            "job_id": self.job.get("job_id"),
            "job_hash": self.job_hash(),
            "current_stage": self.state.current_stage,
            "stage_statuses": self.state.stage_statuses,
            "diagnostics": self.state.diagnostics[-20:],
            "state_file": str(self.state_file),
            "artifacts_dir": str(self.artifacts_dir),
        }

    def _run_blender(self, script: Path, blend: Optional[Path] = None) -> tuple[bool, str]:
        self.artifacts_dir.mkdir(parents=True, exist_ok=True)
        log_path = self.artifacts_dir / "orchestrator-blender.log"
        env = os.environ.copy()
        env["PYTHONPATH"] = os.pathsep.join((str(self.repo_dir / "tools/blender"), str(self.repo_dir), env.get("PYTHONPATH", "")))
        cmd = ["blender", "--background"]
        if blend:
            cmd.append(str(blend))
        else:
            cmd.append("--factory-startup")
        cmd += ["--python", str(script)]
        proc = subprocess.run(cmd, cwd=str(self.repo_dir), env=env, stdout=subprocess.PIPE,
                              stderr=subprocess.STDOUT, text=True)
        output = proc.stdout or ""
        log_path.write_text(output, encoding="utf-8")
        return proc.returncode == 0, output

    def _record(self, stage: str, status: str, diagnostic: Optional[str] = None) -> None:
        self.state.mark_stage(stage, status)
        if diagnostic:
            self.state.add_diagnostic(diagnostic)
        self.state.job_hash = self.job_hash()
        self.state.save(self.state_file)

    def build(self, from_scratch: bool = False) -> bool:
        if not self.job:
            self._record("INIT", "FAILED", "jobs/cassidy-production.json is missing")
            return False
        if from_scratch:
            self.state = OrchestratorState(job_id=self.job.get("job_id", "default"))
            self.state.job_hash = self.job_hash()
            self.state.save(self.state_file)

        self._record("PRODUCTION", "RUNNING")
        started = datetime.now(timezone.utc).isoformat()
        ok, output = self._run_blender(self.repo_dir / CI_ENTRY)
        report = {
            "orchestrator_version": "3N.40-atomic",
            "character": self.job.get("character", "Cassidy"),
            "job_id": self.job.get("job_id"),
            "job_hash": self.job_hash(),
            "started_at": started,
            "completed_at": datetime.now(timezone.utc).isoformat(),
            "status": "COMPLETED" if ok else "BLOCKED",
            "blender_exit_code": 0 if ok else 1,
            "pipeline": "tools/blender/characters/cassidy_ci_entry.py",
            "note": "Production stages are currently executed by the existing atomic Blender pipeline; no stage is marked complete independently of its real gate.",
        }
        (self.artifacts_dir / "orchestrator-report.json").write_text(json.dumps(report, indent=2, sort_keys=True) + "\n", encoding="utf-8")
        if ok:
            self._record("DONE", "COMPLETED")
            return True
        tail = "\n".join(output.splitlines()[-40:])
        self._record("PRODUCTION", "FAILED", tail or "Blender production pipeline failed")
        return False

    def resume(self) -> bool:
        # The current authoring implementation is atomic, so resume safely
        # re-enters the real pipeline instead of claiming a partial checkpoint.
        return self.build(from_scratch=False)

    def repair(self, stage: Optional[str] = None) -> bool:
        requested = (stage or "PRODUCTION").upper()
        self.state.add_diagnostic(f"Repair requested for {requested}; rerunning atomic production pipeline.")
        return self.build(from_scratch=False)

    def validate(self) -> bool:
        blend = self.artifacts_dir / "cassidy-production.blend"
        if not blend.is_file():
            self._record("VALIDATION", "FAILED", "No prepared Cassidy Blender scene exists.")
            return False
        self._record("VALIDATION", "RUNNING")
        ok, output = self._run_blender(self.repo_dir / CI_VALIDATE, blend)
        self._record("VALIDATION", "COMPLETED" if ok else "FAILED", None if ok else output[-4000:])
        return ok

    def export(self) -> bool:
        blend = self.artifacts_dir / "cassidy-production.blend"
        if not blend.is_file():
            self._record("EXPORT", "FAILED", "No prepared Cassidy Blender scene exists.")
            return False
        self._record("EXPORT", "RUNNING")
        ok, output = self._run_blender(self.repo_dir / CI_EXPORT, blend)
        self._record("EXPORT", "COMPLETED" if ok else "FAILED", None if ok else output[-4000:])
        return ok
