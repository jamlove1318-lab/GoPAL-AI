#!/usr/bin/env bash
# Launch persistent Cassidy Factory Agent on local Ubuntu
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

echo "Starting Cassidy Factory Agent in ${REPO_DIR}..."
cd "${REPO_DIR}"

exec ./bin/cassidy watch "$@"
