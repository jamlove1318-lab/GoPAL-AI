"""Persistent GitHub↔Ubuntu Cassidy production agent."""
from __future__ import annotations
import hashlib,os,signal,time
from pathlib import Path
from typing import Optional
from factory.agent.sync import commit_and_push_reports,fetch_and_pull
from factory.orchestrator.orchestrator import CassidyProductionOrchestrator

class CassidyFactoryAgent:
    def __init__(self,repo_dir:Optional[Path]=None,poll_interval_seconds:int=10,sync_with_github:bool=True):
        self.repo_dir=(repo_dir or Path(".")).resolve();self.poll_interval=max(3,poll_interval_seconds);self.sync_with_github=sync_with_github;self.running=False;self.orchestrator=CassidyProductionOrchestrator(repo_dir=self.repo_dir)
    def _hash_job(self):
        p=self.repo_dir/"jobs/cassidy-production.json";return hashlib.sha256(p.read_bytes()).hexdigest() if p.is_file() else None
    def _discover_source(self)->Optional[Path]:
        configured=os.environ.get("CASSIDY_SOURCE_BLEND") or os.environ.get("CASSIDY_SOURCE_ASSET")
        candidates=[Path(configured).expanduser()] if configured else []
        candidates += [Path("/root/gopal-ai/build/cassidy/checkpoints/10-final.blend")]
        source_dir=self.repo_dir/"assets/cassidy/source"
        if source_dir.is_dir():candidates += sorted(source_dir.glob("*.blend"))+sorted(source_dir.glob("*.glb"))
        for candidate in candidates:
            candidate=candidate.resolve()
            if candidate.is_file() and candidate.stat().st_size>0:return candidate
        return None
    def _fingerprint(self):
        source=self._discover_source();return (self._hash_job(),self.orchestrator.factory_hash(),hashlib.sha256(source.read_bytes()).hexdigest() if source else None)
    def _repair_marker(self,fingerprint) -> str:
        return "AUTO_REPAIR_ATTEMPT:" + ":".join(str(value) for value in fingerprint)
    def _repair_already_attempted(self,fingerprint) -> bool:
        marker=self._repair_marker(fingerprint)
        return any(marker in diagnostic for diagnostic in self.orchestrator.state.diagnostics)
    def run_once(self)->str:
        if self.sync_with_github:fetch_and_pull(self.repo_dir)
        self.orchestrator=CassidyProductionOrchestrator(repo_dir=self.repo_dir)
        current_job,current_factory,current_source=self._fingerprint();state=self.orchestrator.state
        fingerprint=(current_job,current_factory,current_source)
        if not current_job:return "NO_JOB"
        source=self._discover_source()
        if source:os.environ["CASSIDY_SOURCE_ASSET"]=str(source)
        changed=(state.job_hash!=current_job or state.factory_hash!=current_factory or state.source_hash!=current_source)
        if not changed and state.current_stage=="DONE":return "IDLE_COMPLETED"
        if not changed and state.current_stage and state.stage_statuses.get(state.current_stage)=="FAILED":
            if not self._repair_already_attempted(fingerprint):
                state.add_diagnostic(self._repair_marker(fingerprint))
                state.save(self.orchestrator.state_file)
                ok=self.orchestrator.repair("PRODUCTION")
                if ok:
                    if self.sync_with_github:commit_and_push_reports(self.repo_dir)
                    return "AUTO_REPAIR_SUCCESS"
                return "AUTO_REPAIR_BLOCKED"
            return "WAITING_FOR_CHANGE"
        ok=self.orchestrator.build(from_scratch=False)
        if ok:
            if self.sync_with_github:commit_and_push_reports(self.repo_dir)
            return "BUILD_SUCCESS"
        return "BUILD_BLOCKED"
    def watch(self):
        self.running=True
        def stop(sig,frame):self.running=False
        signal.signal(signal.SIGINT,stop);signal.signal(signal.SIGTERM,stop)
        while self.running:
            try:print(f"[GOPAL-AGENT] {self.run_once()}",flush=True)
            except Exception as exc:print(f"[GOPAL-AGENT] cycle error: {exc}",flush=True)
            if self.running:time.sleep(self.poll_interval)

if __name__ == "__main__":
    CassidyFactoryAgent().watch()
