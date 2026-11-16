#!/usr/bin/env bash
# Build frontend dengan alamat API produksi lalu bungkus dist/ menjadi ZIP untuk AWS Amplify.
# Pakai: npm run bundle:amplify -- https://xxxx.lambda-url.ap-southeast-1.on.aws/api
set -euo pipefail
cd "$(dirname "$0")/.."

API_URL="${1:-}"
API_URL="${API_URL%/}"
if [[ ! "$API_URL" =~ ^https://.+/api$ ]]; then
  echo "Alamat API harus diawali https:// dan diakhiri /api"
  echo "Contoh: npm run bundle:amplify -- https://xxxx.lambda-url.ap-southeast-1.on.aws/api"
  exit 1
fi

VITE_API_URL="$API_URL" npm run build
rm -f laris-frontend.zip
(cd dist && zip -qr ../laris-frontend.zip .)
echo "Paket siap: $(pwd)/laris-frontend.zip (API: $API_URL)"
