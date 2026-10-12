#!/usr/bin/env bash
set -euo pipefail

BLENDER_VERSION="${BLENDER_VERSION:-5.0.1}"
BLENDER_ROOT="${BLENDER_ROOT:-${RUNNER_TEMP:-/tmp}/blender-${BLENDER_VERSION}}"
ARCHIVE="${RUNNER_TEMP:-/tmp}/blender-${BLENDER_VERSION}-linux-x64.tar.xz"
URL="https://download.blender.org/release/Blender5.0/blender-${BLENDER_VERSION}-linux-x64.tar.xz"

if [[ -x "$BLENDER_ROOT/blender" ]]; then
  echo "[OK] Blender already available: $BLENDER_ROOT/blender"
  "$BLENDER_ROOT/blender" --version | head -n 1
  exit 0
fi

mkdir -p "$(dirname "$BLENDER_ROOT")"
echo "[INFO] Downloading Blender ${BLENDER_VERSION} for the remote runner..."
curl -fL --retry 3 --retry-delay 2 "$URL" -o "$ARCHIVE"
rm -rf "$BLENDER_ROOT" "${RUNNER_TEMP:-/tmp}/blender-${BLENDER_VERSION}"
tar -xJf "$ARCHIVE" -C "$(dirname "$BLENDER_ROOT")"
EXTRACTED="$(dirname "$BLENDER_ROOT")/blender-${BLENDER_VERSION}-linux-x64"
if [[ "$EXTRACTED" != "$BLENDER_ROOT" ]]; then
  mv "$EXTRACTED" "$BLENDER_ROOT"
fi
rm -f "$ARCHIVE"

"$BLENDER_ROOT/blender" --background --version | head -n 1
echo "[OK] Blender installed at $BLENDER_ROOT"
