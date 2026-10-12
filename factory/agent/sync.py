"""
GoPAL-AI Factory Git Synchronization Subsystem.
Keeps local production workspace aligned with GitHub repository.
"""

import subprocess
from pathlib import Path
from typing import Dict, Optional


def get_git_head_commit(repo_dir: Path) -> Optional[str]:
    """Retrieve current HEAD commit hash."""
    try:
        res = subprocess.run(
            ["git", "rev-parse", "HEAD"],
            cwd=str(repo_dir),
            capture_output=True,
            text=True,
            check=True,
        )
        return res.stdout.strip()
    except Exception:
        return None


def fetch_and_pull(repo_dir: Path) -> bool:
    """Pull latest changes from origin tracking branch."""
    try:
        subprocess.run(["git", "fetch", "origin"], cwd=str(repo_dir), check=True, capture_output=True)
        res = subprocess.run(
            ["git", "status", "-uno"],
            cwd=str(repo_dir),
            capture_output=True,
            text=True,
            check=True,
        )
        if "behind" in res.stdout:
            print("[GoPAL-SYNC] Remote is ahead, pulling latest changes...", flush=True)
            subprocess.run(["git", "pull", "--ff-only"], cwd=str(repo_dir), check=True, capture_output=True)
            return True
        return False
    except Exception as e:
        print(f"[GoPAL-SYNC] Sync note: {e}", flush=True)
        return False


def commit_and_push_reports(repo_dir: Path, message: str = "chore(cassidy): update production reports and manifest") -> bool:
    """Stage and commit machine-readable reports and push to origin."""
    try:
        # Only stage reports and manifests
        subprocess.run(
            ["git", "add", "artifacts/cassidy/*.json", "jobs/*.json"],
            cwd=str(repo_dir),
            check=True,
            capture_output=True,
        )
        status_proc = subprocess.run(
            ["git", "status", "--porcelain", "artifacts/cassidy", "jobs"],
            cwd=str(repo_dir),
            capture_output=True,
            text=True,
            check=True,
        )
        if not status_proc.stdout.strip():
            print("[GoPAL-SYNC] No new reports to commit.", flush=True)
            return True

        subprocess.run(["git", "commit", "-m", message], cwd=str(repo_dir), check=True, capture_output=True)
        print(f"[GoPAL-SYNC] Committed reports: {message}", flush=True)

        push_proc = subprocess.run(["git", "push"], cwd=str(repo_dir), capture_output=True, text=True)
        if push_proc.returncode == 0:
            print("[GoPAL-SYNC] Reports successfully pushed to GitHub.", flush=True)
            return True
        else:
            print(f"[GoPAL-SYNC] Note: Git push deferred ({push_proc.stderr.strip()})", flush=True)
            return False
    except Exception as e:
        print(f"[GoPAL-SYNC] Commit/push error: {e}", flush=True)
        return False
