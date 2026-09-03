"""Unified Cassidy production factory CLI."""
from __future__ import annotations
import argparse,sys
from pathlib import Path
from factory.agent.watcher import CassidyFactoryAgent
from factory.orchestrator.orchestrator import CassidyProductionOrchestrator

def main():
 p=argparse.ArgumentParser(prog="cassidy",description="GoPAL-AI Cassidy Automated Production Factory")
 s=p.add_subparsers(dest="command")
 b=s.add_parser("build"); b.add_argument("--clean",action="store_true")
 s.add_parser("validate"); s.add_parser("resume"); r=s.add_parser("repair"); r.add_argument("stage",nargs="?")
 s.add_parser("export"); s.add_parser("status")
 w=s.add_parser("watch"); w.add_argument("--once",action="store_true"); w.add_argument("--no-sync",action="store_true",help="disable automatic Git synchronization"); w.add_argument("--interval",type=int,default=10)
 a=p.parse_args(); repo=Path(".").resolve(); o=CassidyProductionOrchestrator(repo_dir=repo)
 if not a.command:p.print_help(); return 0
 if a.command=="build":ok=o.build(from_scratch=a.clean)
 elif a.command=="resume":ok=o.resume()
 elif a.command=="repair":ok=o.repair(a.stage)
 elif a.command=="validate":ok=o._execute_pipeline(start_index=16)
 elif a.command=="export":ok=o._execute_pipeline(start_index=17)
 elif a.command=="status": print(o.status()); return 0
 elif a.command=="watch":
  agent=CassidyFactoryAgent(repo_dir=repo,poll_interval_seconds=a.interval,sync_with_github=not a.no_sync)
  if a.once: agent.run_once(); return 0
  agent.watch(); return 0
 return 0 if ok else 1
if __name__=="__main__":sys.exit(main())
