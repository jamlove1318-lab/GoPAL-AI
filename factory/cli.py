"""
GoPAL-AI Cassidy Production Factory CLI.
Unified command interface for building, validating, resuming, and watching Cassidy assets.
"""

import argparse
import json
import sys
from pathlib import Path

from factory.agent.watcher import CassidyFactoryAgent
from factory.orchestrator.orchestrator import CassidyProductionOrchestrator


def main():
    parser = argparse.ArgumentParser(
        prog="cassidy",
        description="GoPAL-AI Cassidy Automated Production Factory & Local Agent",
    )
    subparsers = parser.add_subparsers(dest="command", help="Factory command to run")

    # cassidy build
    p_build = subparsers.add_parser("build", help="Build Cassidy character asset from start or resume point")
    p_build.add_argument("--clean", action="store_true", help="Start fresh from INIT stage, ignoring existing checkpoints")

    # cassidy validate
    p_validate = subparsers.add_parser("validate", help="Run comprehensive validation and acceptance gate")

    # cassidy resume
    p_resume = subparsers.add_parser("resume", help="Resume pipeline from the last successful checkpoint")

    # cassidy repair
    p_repair = subparsers.add_parser("repair", help="Re-run a specific stage and rebuild forward")
    p_repair.add_argument("stage", nargs="?", default=None, help="Stage name to repair (e.g., ANIMATIONS, FACE, BODY_RIG)")

    # cassidy export
    p_export = subparsers.add_parser("export", help="Export GLB asset and generate package manifest")

    # cassidy status
    p_status = subparsers.add_parser("status", help="Show current factory status, checkpoints, and validation")

    # cassidy watch
    p_watch = subparsers.add_parser("watch", help="Start local Cassidy Factory Agent watcher")
    p_watch.add_argument("--once", action="store_true", help="Run a single check pass instead of infinite loop")
    p_watch.add_argument("--sync", action="store_true", help="Fetch/pull from GitHub and push generated reports")
    p_watch.add_argument("--interval", type=int, default=10, help="Polling interval in seconds (default: 10)")

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        sys.exit(0)

    repo_dir = Path(".").resolve()
    orchestrator = CassidyProductionOrchestrator(repo_dir=repo_dir)

    if args.command == "build":
        success = orchestrator.build(from_scratch=args.clean)
        sys.exit(0 if success else 1)

    elif args.command == "resume":
        success = orchestrator.resume()
        sys.exit(0 if success else 1)

    elif args.command == "repair":
        success = orchestrator.repair(target_stage=args.stage)
        sys.exit(0 if success else 1)

    elif args.command == "validate":
        success = orchestrator._execute_pipeline(start_index=16)  # VALIDATION stage
        sys.exit(0 if success else 1)

    elif args.command == "export":
        success = orchestrator._execute_pipeline(start_index=17)  # EXPORT stage
        sys.exit(0 if success else 1)

    elif args.command == "status":
        stat = orchestrator.status()
        print("\n=== CASSIDY PRODUCTION FACTORY STATUS ===")
        print(f"Character:     {stat['character']}")
        print(f"Job ID:        {stat['job_id']}")
        print(f"Current Stage: {stat['current_stage']}")
        print(f"Last Checkpoint: {stat['last_valid_checkpoint_stage']} -> {stat['last_valid_checkpoint_file']}")
        print(f"Artifacts Dir: {stat['artifacts_dir']}")
        print(f"Last Updated:  {stat['last_updated']}")
        print("\nStage Breakdown:")
        for stg, s in stat.get("stage_statuses", {}).items():
            print(f"  [{s:9s}] {stg}")
        print("=========================================\n")
        sys.exit(0)

    elif args.command == "watch":
        agent = CassidyFactoryAgent(
            repo_dir=repo_dir,
            poll_interval_seconds=args.interval,
            sync_with_github=args.sync,
        )
        if args.once:
            agent.run_once()
        else:
            agent.watch()
        sys.exit(0)


if __name__ == "__main__":
    main()
