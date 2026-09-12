"""
GoPAL-AI Local Cassidy Factory Agent.
Persistent watcher and autonomous execution agent for Ubuntu/Blender environment.
"""

import hashlib
import json
import signal
import sys
import time
from pathlib import Path
from typing import Optional

from factory.agent.sync import commit_and_push_reports, fetch_and_pull
from factory.orchestrator.orchestrator import CassidyProductionOrchestrator


class CassidyFactoryAgent:
    def __init__(
        self,
        repo_dir: Optional[Path] = None,
        poll_interval_seconds: int = 10,
        sync_with_github: bool = False,
    ):
        self.repo_dir = (repo_dir or Path(".")).resolve()
        self.poll_interval = poll_interval_seconds
        self.sync_with_github = sync_with_github
        self.running = False
        self.orchestrator = CassidyProductionOrchestrator(repo_dir=self.repo_dir)
        self.last_job_hash: Optional[str] = self.orchestrator.state.job_hash

    def _hash_job(self) -> Optional[str]:
        job_file = self.repo_dir / "jobs/cassidy-production.json"
        if not job_file.is_file():
            return None
        with open(job_file, "rb") as f:
            return hashlib.sha256(f.read()).hexdigest()

    def run_once(self) -> str:
        """Evaluate factory state and execute appropriate action."""
        if self.sync_with_github:
            fetch_and_pull(self.repo_dir)

        current_hash = self._hash_job()
        if not current_hash:
            print("[GoPAL-AGENT] [State: NO_JOB] No active job found in jobs/cassidy-production.json. Waiting...", flush=True)
            return "NO_JOB"

        # Check state file
        state = self.orchestrator.state
        current_stage = state.current_stage
        stage_status = state.stage_statuses.get(current_stage)

        # 1. Check if already done and hash matches
        if stage_status == "COMPLETED" and current_stage == "DONE" and current_hash == state.job_hash:
            print("[GoPAL-AGENT] [State: IDLE] Production job is fully completed, verified, and packaged. Standing by.", flush=True)
            return "IDLE_COMPLETED"

        # 2. Check if an interrupted run exists
        if stage_status == "RUNNING":
            print(f"[GoPAL-AGENT] [State: INTERRUPTED] Detected incomplete run at stage '{current_stage}'. Resuming...", flush=True)
            success = self.orchestrator.resume()
            if success:
                state.job_hash = current_hash
                state.save(self.orchestrator.state_file)
                if self.sync_with_github:
                    commit_and_push_reports(self.repo_dir)
            return "RESUMED" if success else "RESUME_FAILED"

        # 3. Check if validation previously failed
        if stage_status == "FAILED":
            if current_hash != self.last_job_hash and self.last_job_hash is not None:
                print(f"[GoPAL-AGENT] [State: FIXED_JOB] Job file updated since previous failure. Resuming...", flush=True)
                self.last_job_hash = current_hash
                success = self.orchestrator.resume()
                if success:
                    state.job_hash = current_hash
                    state.save(self.orchestrator.state_file)
                    if self.sync_with_github:
                        commit_and_push_reports(self.repo_dir)
                return "FIXED_JOB_RESUMED" if success else "FIXED_JOB_FAILED"
            else:
                print(f"[GoPAL-AGENT] [State: VALIDATION_FAILED] Stage '{current_stage}' failed. Preserving checkpoints. Waiting for fix...", flush=True)
                return "VALIDATION_FAILED"

        # 4. Check if new job detected
        if current_hash != state.job_hash:
            print(f"[GoPAL-AGENT] [State: NEW_JOB] Detected new or modified job ({current_hash[:8]}). Starting build...", flush=True)
            self.last_job_hash = current_hash
            success = self.orchestrator.build(from_scratch=False)
            if success:
                state.job_hash = current_hash
                state.save(self.orchestrator.state_file)
                if self.sync_with_github:
                    commit_and_push_reports(self.repo_dir)
            return "BUILD_SUCCESS" if success else "BUILD_FAILED"

        # 4. Check if already done
        if stage_status == "COMPLETED" and current_stage == "DONE":
            print("[GoPAL-AGENT] [State: IDLE] Production job is fully completed, verified, and packaged. Standing by.", flush=True)
            return "IDLE_COMPLETED"

        print(f"[GoPAL-AGENT] [State: IDLE] Standing by at stage '{current_stage}' ({stage_status}).", flush=True)
        return "IDLE"

    def watch(self):
        """Persistent loop watching for repository jobs."""
        self.running = True
        print(f"[GoPAL-AGENT] === Cassidy Factory Agent Active (Polling every {self.poll_interval}s) ===", flush=True)

        def sig_handler(sig, frame):
            print("\n[GoPAL-AGENT] Gracefully stopping factory agent...", flush=True)
            self.running = False

        signal.signal(signal.SIGINT, sig_handler)
        signal.signal(signal.SIGTERM, sig_handler)

        while self.running:
            try:
                self.run_once()
            except Exception as e:
                print(f"[GoPAL-AGENT] Error during watch cycle: {e}", flush=True)

            if not self.running:
                break

            time.sleep(self.poll_interval)

        print("[GoPAL-AGENT] Agent stopped.", flush=True)
