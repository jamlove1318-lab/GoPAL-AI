"""Safe Git synchronization for the local Cassidy production agent."""
from __future__ import annotations
import subprocess
from pathlib import Path
from typing import Optional

GENERATED_PREFIXES=("artifacts/cassidy/",)

def _run(repo:Path,*args:str,check=True):
    return subprocess.run(list(args),cwd=str(repo),capture_output=True,text=True,check=check)

def get_git_head_commit(repo_dir:Path)->Optional[str]:
    try:return _run(repo_dir,"git","rev-parse","HEAD").stdout.strip()
    except Exception:return None

def _dirty_paths(repo_dir:Path)->list[str]:
    # `git status --porcelain` may collapse an entirely untracked directory to
    # a single `?? artifacts/` entry. That hides the actual generated paths and
    # makes the safety classifier reject a directory that contains only allowed
    # generated Cassidy output. `-uall` expands untracked directories to files,
    # allowing the generated-prefix check to remain strict and path-specific.
    output=_run(repo_dir,"git","status","--porcelain","-uall").stdout
    paths=[]
    for line in output.splitlines():
        if len(line)>=4:
            path=line[3:].strip().strip('"')
            # Renames can contain "old -> new"; both are generated only when
            # the destination remains under the generated prefix.
            if " -> " in path:path=path.split(" -> ")[-1]
            paths.append(path)
    return paths

def _only_generated_dirty(paths:list[str])->bool:
    return bool(paths) and all(any(path.startswith(prefix) for prefix in GENERATED_PREFIXES) for path in paths)

def fetch_and_pull(repo_dir:Path)->bool:
    """Fast-forward local checkout without destroying local source work.

    Generated Cassidy reports are disposable working output. When origin has
    moved, they are temporarily stashed so they cannot block control-plane
    synchronization. Human/source edits remain a hard stop.
    """
    stash_created=False
    try:
        _run(repo_dir,"git","fetch","origin","--prune")
        branch=_run(repo_dir,"git","branch","--show-current").stdout.strip()
        if not branch:return False
        remote=f"origin/{branch}"
        ahead=int(_run(repo_dir,"git","rev-list","--count",f"HEAD..{remote}").stdout.strip() or "0")
        behind=int(_run(repo_dir,"git","rev-list","--count",f"{remote}..HEAD").stdout.strip() or "0")
        if behind:
            print(f"[GOPAL-SYNC] Local branch is {behind} commit(s) ahead; refusing destructive sync.",flush=True)
            return False
        if not ahead:return False

        dirty=_dirty_paths(repo_dir)
        if dirty:
            if not _only_generated_dirty(dirty):
                print("[GOPAL-SYNC] Local working tree contains non-generated changes; refusing automatic pull.",flush=True)
                return False
            stash=_run(repo_dir,"git","stash","push","-u","-m","gopal-cassidy-generated-sync",*GENERATED_PREFIXES)
            stash_created="No local changes to save" not in stash.stdout
            if stash_created:print("[GOPAL-SYNC] Temporarily stashed generated Cassidy outputs.",flush=True)

        _run(repo_dir,"git","merge","--ff-only",remote)
        print(f"[GOPAL-SYNC] Fast-forwarded {ahead} commit(s).",flush=True)
        return True
    except Exception as exc:
        print(f"[GOPAL-SYNC] Sync deferred: {exc}",flush=True)
        return False
    finally:
        if stash_created:
            restored=_run(repo_dir,"git","stash","pop",check=False)
            if restored.returncode!=0:
                print("[GOPAL-SYNC] Generated-output stash could not be restored cleanly; it remains in git stash.",flush=True)
            else:
                print("[GOPAL-SYNC] Restored generated Cassidy outputs.",flush=True)

def commit_and_push_reports(repo_dir:Path,message:str="chore(cassidy): update production reports") -> bool:
    """Commit only generated Cassidy JSON reports and push if fast-forward safe."""
    try:
        _run(repo_dir,"git","add","artifacts/cassidy/*.json")
        status=_run(repo_dir,"git","status","--porcelain","artifacts/cassidy").stdout.strip()
        if not status:return True
        _run(repo_dir,"git","commit","-m",message)
        proc=_run(repo_dir,"git","push",check=False)
        if proc.returncode==0:return True
        print(f"[GOPAL-SYNC] Push deferred: {proc.stderr.strip()}",flush=True);return False
    except Exception as exc:
        print(f"[GOPAL-SYNC] Report sync failed: {exc}",flush=True);return False
