#!/bin/bash
set -euo pipefail

export HOME=/root

# shellcheck source=/dev/fd/xx
source <(fnm env --shell bash)

npm run build
