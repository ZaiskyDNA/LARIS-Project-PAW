#!/usr/bin/env bash
# Membuat paket ZIP backend untuk diunggah ke AWS Lambda (hanya dependensi produksi).
set -euo pipefail
cd "$(dirname "$0")/.."

KELUARAN=dist-lambda
rm -rf "$KELUARAN"
mkdir -p "$KELUARAN/paket"
cp -r lambda.js server.js package.json package-lock.json src "$KELUARAN/paket/"
(cd "$KELUARAN/paket" && npm ci --omit=dev --no-audit --no-fund --loglevel=error)
(cd "$KELUARAN/paket" && zip -qr ../laris-backend.zip .)
echo "Paket siap: $(pwd)/$KELUARAN/laris-backend.zip ($(du -h "$KELUARAN/laris-backend.zip" | cut -f1))"
