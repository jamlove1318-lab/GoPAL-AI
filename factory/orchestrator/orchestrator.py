"""Cassidy production orchestrator and Linux/Git control plane."""
from __future__ import annotations
import hashlib,json,os,subprocess
from datetime import datetime,timezone
from pathlib import Path
from typing import Any,Optional
from .state import OrchestratorState
DEFAULT_JOB=Path("jobs/cassidy-production.json"); DEFAULT_STATE=Path("build/cassidy/orchestrator-state.json"); ARTIFACTS=Path("artifacts/cassidy"); CI_ENTRY=Path("tools/blender/characters/cassidy_ci_entry.py"); CI_VALIDATE=Path("tools/blender/characters/cassidy_ci_validate.py"); CI_EXPORT=Path("tools/blender/characters/cassidy_ci_export.py")
class CassidyProductionOrchestrator:
    def __init__(self,repo_dir:Optional[Path]=None,job_path:Optional[Path]=None,state_path:Optional[Path]=None):
        self.repo_dir=(repo_dir or Path(".")).resolve(); self.job_path=(job_path or self.repo_dir/DEFAULT_JOB).resolve(); self.state_file=(state_path or self.repo_dir/DEFAULT_STATE).resolve(); self.artifacts_dir=(self.repo_dir/ARTIFACTS).resolve(); self.state=OrchestratorState.load(self.state_file); self.job=self._load_job()
    def _load_job(self)->dict[str,Any]:
        if not self.job_path.is_file():return {}
        try:return json.loads(self.job_path.read_text(encoding="utf-8"))
        except Exception as exc:raise RuntimeError(f"Invalid Cassidy job file: {exc}") from exc
    def job_hash(self)->Optional[str]:return hashlib.sha256(self.job_path.read_bytes()).hexdigest() if self.job_path.is_file() else None
    def factory_hash(self)->Optional[str]:
        try:return subprocess.run(["git","rev-parse","HEAD"],cwd=str(self.repo_dir),capture_output=True,text=True,check=True).stdout.strip()
        except Exception:return None
    def _source_asset(self)->Optional[Path]:
        raw=os.environ.get("CASSIDY_SOURCE_BLEND") or os.environ.get("CASSIDY_SOURCE_ASSET")
        if not raw:
            candidate=Path("/root/gopal-ai/build/cassidy/checkpoints/10-final.blend")
            if candidate.is_file():return candidate.resolve()
            return None
        path=Path(raw).expanduser().resolve()
        if not path.is_file():raise FileNotFoundError(f"Cassidy source asset not found: {path}")
        return path
    def source_hash(self)->Optional[str]:
        path=self._source_asset()
        return hashlib.sha256(path.read_bytes()).hexdigest() if path else None
    def status(self)->dict[str,Any]:
        return {"character":self.job.get("character","Cassidy"),"job_id":self.job.get("job_id"),"job_hash":self.job_hash(),"factory_hash":self.factory_hash(),"source_hash":self.source_hash(),"current_stage":self.state.current_stage,"stage_statuses":self.state.stage_statuses,"diagnostics":self.state.diagnostics[-20:],"state_file":str(self.state_file),"artifacts_dir":str(self.artifacts_dir)}
    def _run_blender(self,script:Path,blend:Optional[Path]=None)->tuple[bool,str]:
        self.artifacts_dir.mkdir(parents=True,exist_ok=True); env=os.environ.copy(); env["PYTHONPATH"]=os.pathsep.join((str(self.repo_dir/"tools/blender"),str(self.repo_dir),env.get("PYTHONPATH","")))
        source=self._source_asset()
        if source:env["CASSIDY_SOURCE_ASSET"]=str(source)
        cmd=["blender","--background"]
        if blend:cmd.append(str(blend))
        else:cmd.append("--factory-startup")
        cmd += ["--python",str(script)]
        proc=subprocess.run(cmd,cwd=str(self.repo_dir),env=env,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,text=True); output=proc.stdout or ""; (self.artifacts_dir/"orchestrator-blender.log").write_text(output,encoding="utf-8")
        failed=("Traceback (most recent call last)" in output or "PRODUCTION_BLOCKED" in output or "CASSIDY_PRODUCTION_GATE_BLOCKED" in output)
        return proc.returncode==0 and not failed,output
    def _record(self,stage:str,status:str,diagnostic:Optional[str]=None)->None:
        self.state.mark_stage(stage,status); self.state.job_hash=self.job_hash(); self.state.factory_hash=self.factory_hash(); self.state.source_hash=self.source_hash()
        if diagnostic:self.state.add_diagnostic(diagnostic)
        self.state.save(self.state_file)
    def build(self,from_scratch:bool=False)->bool:
        if not self.job:self._record("INIT","FAILED","jobs/cassidy-production.json is missing"); return False
        if from_scratch:self.state=OrchestratorState(job_id=self.job.get("job_id","default"),job_hash=self.job_hash(),factory_hash=self.factory_hash(),source_hash=self.source_hash()); self.state.save(self.state_file)
        self._record("PRODUCTION","RUNNING"); started=datetime.now(timezone.utc).isoformat(); source=self._source_asset(); ok,output=self._run_blender(self.repo_dir/CI_ENTRY)
        report={"orchestrator_version":"3N.43-automatic-source-aware","character":self.job.get("character","Cassidy"),"job_id":self.job.get("job_id"),"job_hash":self.job_hash(),"factory_hash":self.factory_hash(),"source_hash":self.source_hash(),"started_at":started,"completed_at":datetime.now(timezone.utc).isoformat(),"status":"COMPLETED" if ok else "BLOCKED","blender_exit_code":0 if ok else 1,"pipeline":str(CI_ENTRY),"source_asset":str(source) if source else None,"note":"GitHub is the control plane and the Ubuntu polling agent is the execution plane. Real source intake is automatic and production gates remain fail-closed."}
        (self.artifacts_dir/"orchestrator-report.json").write_text(json.dumps(report,indent=2,sort_keys=True)+"\n",encoding="utf-8")
        if ok:self._record("PRODUCTION","COMPLETED"); self._record("DONE","COMPLETED"); return True
        self._record("PRODUCTION","FAILED","\n".join(output.splitlines()[-60:]) or "Blender production pipeline failed"); return False
    def resume(self)->bool:return self.build(False)
    def repair(self,stage:Optional[str]=None)->bool:
        requested=(stage or "PRODUCTION").upper(); self.state.add_diagnostic(f"Repair requested for {requested}; rerunning authoritative source-aware production pipeline."); self.state.save(self.state_file); return self.build(False)
    def validate(self)->bool:
        blend=self.artifacts_dir/"cassidy-production.blend"
        if not blend.is_file():self._record("VALIDATION","FAILED","No prepared Cassidy Blender scene exists.");return False
        self._record("VALIDATION","RUNNING");ok,out=self._run_blender(self.repo_dir/CI_VALIDATE,blend);self._record("VALIDATION","COMPLETED" if ok else "FAILED",None if ok else out[-4000:]);return ok
    def export(self)->bool:
        blend=self.artifacts_dir/"cassidy-production.blend"
        if not blend.is_file():self._record("EXPORT","FAILED","No prepared Cassidy Blender scene exists.");return False
        self._record("EXPORT","RUNNING");ok,out=self._run_blender(self.repo_dir/CI_EXPORT,blend);self._record("EXPORT","COMPLETED" if ok else "FAILED",None if ok else out[-4000:]);return ok
