#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${UNREAL_ENGINE_ROOT:-}" ]]; then
  echo "[ABORT] UNREAL_ENGINE_ROOT is not configured on this runner."
  echo "[INFO] GoPAL keeps Unreal as an optional remote production toolchain."
  exit 2
fi

UAT="${UNREAL_ENGINE_ROOT}/Engine/Build/BatchFiles/RunUAT.sh"
if [[ ! -x "$UAT" ]]; then
  echo "[FAIL] Unreal AutomationTool not found: $UAT"
  exit 3
fi

if [[ $# -eq 0 ]]; then
  echo "[INFO] Unreal AutomationTool is available."
  echo "[INFO] Pass UAT arguments after this script, for example: BuildCookRun ..."
  exit 0
fi

echo "[INFO] Running Unreal AutomationTool..."
"$UAT" "$@"
