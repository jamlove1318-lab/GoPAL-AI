"""Safe Git synchronization for the local Cassidy production agent."""
from __future__ import annotations
import subprocess
from pathlib import Path
from typing import Optional

def _run(repo:Path,*args:str,check=True):
    return subprocess.run(list(args),cwd=str(repo),capture_output=True,text=True,check=check)

def get_git_head_commit(repo_dir:Path)->Optional[str]:
    try:return _run(repo_dir,"git","rev-parse","HEAD").stdout.strip()
    except Exception:return None

def fetch_and_pull(repo_dir:Path)->bool:
    """Fast-forward local checkout only when origin is ahead; never overwrite local work."""
    try:
        _run(repo_dir,"git","fetch","origin","--prune")
        branch=_run(repo_dir,"git","branch","--show-current").stdout.strip()
        if not branch:return False
        remote=f"origin/{branch}"
        ahead=int(_run(repo_dir,"git","rev-list","--count",f"HEAD..{remote}").stdout.strip() or "0")
        behind=int(_run(repo_dir,"git","rev-list","--count",f"{remote}..HEAD").stdout.strip() or "0")
        if behind: print(f"[GO PAL-SYNC] Local branch is {behind} commit(s) ahead; refusing destructive sync.",flush=True); return False
        if ahead:
            if _run(repo_dir,"git","status","--porcelain").stdout.strip():
                print("[GOPAL-SYNC] Local working tree is dirty; refusing automatic pull.",flush=True); return False
            _run(repo_dir,"git","merge","--ff-only",remote); print(f"[GOPAL-SYNC] Fast-forwarded {ahead} commit(s).",flush=True); return True
        return False
    except Exception as exc:
        print(f"[GOPAL-SYNC] Sync deferred: {exc}",flush=True); return False

def commit_and_push_reports(repo_dir:Path,message:str="chore(cassidy): update production reports") -> bool:
    """Commit only generated Cassidy reports and push if the branch is fast-forward safe."""
    try:
        _run(repo_dir,"git","add","artifacts/cassidy/*.json")
        status=_run(repo_dir,"git","status","--porcelain","artifacts/cassidy").stdout.strip()
        if not status:return True
        _run(repo_dir,"git","commit","-m",message)
        proc=_run(repo_dir,"git","push",check=False)
        if proc.returncode==0:return True
        print(f"[GOPAL-SYNC] Push deferred: {proc.stderr.strip()}",flush=True); return False
    except Exception as exc:
        print(f"[GOPAL-SYNC] Report sync failed: {exc}",flush=True); return False
