"""Unified Cassidy production factory CLI."""
from __future__ import annotations
import argparse
import sys
from pathlib import Path

from factory.agent.watcher import CassidyFactoryAgent
from factory.orchestrator.orchestrator import CassidyProductionOrchestrator


def main() -> int:
    parser = argparse.ArgumentParser(prog="cassidy", description="GoPAL-AI Cassidy Automated Production Factory")
    sub = parser.add_subparsers(dest="command")
    build = sub.add_parser("build")
    build.add_argument("--clean", action="store_true", help="reset and rebuild the Blender scene")
    sub.add_parser("validate")
    sub.add_parser("resume")
    repair = sub.add_parser("repair")
    repair.add_argument("stage", nargs="?", help="stage label for diagnostics; current pipeline reruns atomically")
    sub.add_parser("export")
    sub.add_parser("status")
    watch = sub.add_parser("watch")
    watch.add_argument("--once", action="store_true")
    watch.add_argument("--no-sync", action="store_true", help="disable automatic Git synchronization")
    watch.add_argument("--interval", type=int, default=10)

    args = parser.parse_args()
    repo = Path(".").resolve()
    if not args.command:
        parser.print_help()
        return 0

    if args.command == "watch":
        agent = CassidyFactoryAgent(repo_dir=repo, poll_interval_seconds=args.interval, sync_with_github=not args.no_sync)
        if args.once:
            print(agent.run_once())
            return 0
        agent.watch()
        return 0

    orchestrator = CassidyProductionOrchestrator(repo_dir=repo)
    if args.command == "build":
        ok = orchestrator.build(from_scratch=args.clean)
    elif args.command == "resume":
        ok = orchestrator.resume()
    elif args.command == "repair":
        ok = orchestrator.repair(args.stage)
    elif args.command == "validate":
        ok = orchestrator.validate()
    elif args.command == "export":
        ok = orchestrator.export()
    elif args.command == "status":
        print(orchestrator.status())
        return 0
    else:
        return 2
    return 0 if ok else 1


if __name__ == "__main__":
    raise SystemExit(main())
