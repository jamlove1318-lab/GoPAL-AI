#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="${CASSIDY_REPO_DIR:-/root/cassidy-github-factory}"
INTERVAL="${CASSIDY_POLL_INTERVAL:-10}"

cd "$REPO_DIR"
export PYTHONPATH="$REPO_DIR/tools/blender:$REPO_DIR${PYTHONPATH:+:$PYTHONPATH}"

echo "=== GoPAL-AI Cassidy GitHub Agent ==="
echo "Repository: $REPO_DIR"
echo "Poll interval: ${INTERVAL}s"
echo "Source: automatic discovery"
echo "Control plane: GitHub"
echo "Execution plane: Ubuntu + Blender"
echo "Press Ctrl+C to stop the agent."
echo

exec python3 -m factory.cli watch --interval "$INTERVAL"
