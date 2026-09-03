"""Persistent local Cassidy production agent.

GitHub is the control plane; Ubuntu is the execution plane. The agent polls
GitHub, detects job changes, automatically discovers a genuine local source
asset, runs Blender, and publishes machine-readable reports. It never invents
an asset when no real source exists.
"""
from __future__ import annotations
import hashlib, os, signal, time
from pathlib import Path
from typing import Optional
from factory.agent.sync import commit_and_push_reports, fetch_and_pull
from factory.orchestrator.orchestrator import CassidyProductionOrchestrator

class CassidyFactoryAgent:
    def __init__(self,repo_dir:Optional[Path]=None,poll_interval_seconds:int=10,sync_with_github:bool=True):
        self.repo_dir=(repo_dir or Path(".")).resolve(); self.poll_interval=max(3,poll_interval_seconds); self.sync_with_github=sync_with_github; self.running=False
        self.orchestrator=CassidyProductionOrchestrator(repo_dir=self.repo_dir); self.last_job_hash=self._hash_job()

    def _hash_job(self):
        p=self.repo_dir/"jobs/cassidy-production.json"
        return hashlib.sha256(p.read_bytes()).hexdigest() if p.is_file() else None

    def _discover_source(self)->Optional[Path]:
        configured=os.environ.get("CASSIDY_SOURCE_BLEND") or os.environ.get("CASSIDY_SOURCE_ASSET")
        candidates=[]
        if configured: candidates.append(Path(configured).expanduser())
        # Known local legacy factory source; only used when it actually exists.
        candidates.append(Path("/root/gopal-ai/build/cassidy/checkpoints/10-final.blend"))
        candidates.extend(sorted((self.repo_dir/"assets/cassidy/source").glob("*.blend")) if (self.repo_dir/"assets/cassidy/source").is_dir() else [])
        candidates.extend(sorted((self.repo_dir/"assets/cassidy/source").glob("*.glb")) if (self.repo_dir/"assets/cassidy/source").is_dir() else [])
        for candidate in candidates:
            candidate=candidate.resolve()
            if candidate.is_file() and candidate.stat().st_size>0: return candidate
        return None

    def run_once(self)->str:
        if self.sync_with_github: fetch_and_pull(self.repo_dir)
        current=self._hash_job(); state=self.orchestrator.state
        if not current:return "NO_JOB"
        source=self._discover_source()
        if source: os.environ["CASSIDY_SOURCE_ASSET"]=str(source)
        if state.current_stage=="DONE" and state.job_hash==current:return "IDLE_COMPLETED"
        if state.current_stage and state.stage_statuses.get(state.current_stage)=="FAILED":
            if current==self.last_job_hash:return "VALIDATION_FAILED"
            self.last_job_hash=current; ok=self.orchestrator.resume()
            if ok and self.sync_with_github: commit_and_push_reports(self.repo_dir)
            return "FIXED_JOB_RESUMED" if ok else "FIXED_JOB_FAILED"
        if current!=state.job_hash:
            self.last_job_hash=current; ok=self.orchestrator.build(from_scratch=False)
            if ok:
                state=self.orchestrator.state; state.job_hash=current; state.save(self.orchestrator.state_file)
                if self.sync_with_github: commit_and_push_reports(self.repo_dir)
            return "BUILD_SUCCESS" if ok else "BUILD_FAILED"
        return "IDLE"

    def watch(self):
        self.running=True
        def stop(sig,frame): self.running=False
        signal.signal(signal.SIGINT,stop); signal.signal(signal.SIGTERM,stop)
        while self.running:
            try:
                result=self.run_once(); print(f"[GOPAL-AGENT] {result}",flush=True)
            except Exception as exc: print(f"[GOPAL-AGENT] cycle error: {exc}",flush=True)
            if self.running: time.sleep(self.poll_interval)
