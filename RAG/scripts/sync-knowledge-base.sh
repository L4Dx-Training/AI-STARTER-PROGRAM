#!/usr/bin/env bash
set -euo pipefail

KB_ID="${1:-}"
DATA_SOURCE_ID="${2:-}"
REGION="${3:-ap-south-1}"

if [[ -z "$KB_ID" || -z "$DATA_SOURCE_ID" ]]; then
  echo "Usage: $0 <knowledge-base-id> <data-source-id> [region]"
  exit 1
fi

aws bedrock-agent start-ingestion-job \
  --knowledge-base-id "$KB_ID" \
  --data-source-id "$DATA_SOURCE_ID" \
  --region "$REGION"
