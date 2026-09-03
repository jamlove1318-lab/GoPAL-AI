#!/usr/bin/env bash
set -euo pipefail

REPO="jamlove1318-lab/GoPAL-AI"
RUNNER_DIR="${CASSIDY_RUNNER_DIR:-$HOME/actions-runner-gopal}"
RUNNER_LABELS="self-hosted,linux,ARM64,cassidy-blender"

printf '\n=== GoPAL-AI Cassidy Runner Bootstrap ===\n'
printf 'Repository: %s\n' "$REPO"
printf 'Runner directory: %s\n\n' "$RUNNER_DIR"

if [[ "$(uname -m)" != "aarch64" ]]; then
  echo "ERROR: Cassidy runner requires ARM64/aarch64." >&2
  exit 1
fi

if ! command -v curl >/dev/null 2>&1; then
  echo "ERROR: curl is required." >&2
  exit 1
fi

if ! command -v tar >/dev/null 2>&1; then
  echo "ERROR: tar is required." >&2
  exit 1
fi

if ! command -v blender >/dev/null 2>&1; then
  echo "ERROR: Blender is not installed or is not on PATH." >&2
  exit 1
fi

BLENDER_VERSION="$(blender --background --factory-startup --python-expr 'import bpy; print(bpy.app.version_string)' 2>/dev/null | tail -n 1)"
echo "Blender: $BLENDER_VERSION"

if [[ -f "$RUNNER_DIR/.runner" ]]; then
  echo "Runner is already configured at $RUNNER_DIR."
  echo "If it is not running, use: cd '$RUNNER_DIR' && ./run.sh"
  exit 0
fi

mkdir -p "$RUNNER_DIR"
cd "$RUNNER_DIR"

ARCHIVE_URL="$(python3 - <<'PY'
import json, urllib.request
url='https://api.github.com/repos/jamlove1318-lab/GoPAL-AI/actions/runners/downloads'
req=urllib.request.Request(url, headers={'Accept':'application/vnd.github+json','User-Agent':'GoPAL-AI-Cassidy-Runner'})
with urllib.request.urlopen(req, timeout=20) as r:
    data=json.load(r)
for item in data:
    if item.get('os') == 'linux' and item.get('architecture') == 'arm64':
        print(item['download_url'])
        break
else:
    raise SystemExit('No Linux ARM64 runner package returned by GitHub')
PY
)"

if [[ -z "$ARCHIVE_URL" ]]; then
  echo "ERROR: Could not determine the Linux ARM64 runner package." >&2
  exit 1
fi

echo "Downloading GitHub Actions ARM64 runner..."
curl -fL --retry 3 "$ARCHIVE_URL" -o runner.tar.gz
tar xzf runner.tar.gz
rm -f runner.tar.gz

cat <<'EOF'

The GitHub registration token is intentionally NOT stored in this repository.
Generate a fresh token in:
  GoPAL-AI -> Settings -> Actions -> Runners -> New self-hosted runner

Then run the generated ./config.sh command, adding these labels:
  self-hosted,linux,ARM64,cassidy-blender

After configuration, start the runner with:
  ./run.sh

For persistent startup on a systemd-based Ubuntu installation, GitHub's
supported service flow is:
  sudo ./svc.sh install
  sudo ./svc.sh start
EOF
