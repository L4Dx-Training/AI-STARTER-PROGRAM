#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REGION="${AWS_REGION:-ap-south-1}"
STACK_NAME="${STACK_NAME:-rag-chatbot}"
ENV_FILE="${ROOT_DIR}/.env.deploy"

if ! command -v sam >/dev/null 2>&1; then
  echo "AWS SAM CLI is required."
  exit 1
fi
if ! command -v aws >/dev/null 2>&1; then
  echo "AWS CLI is required."
  exit 1
fi

aws sts get-caller-identity --region "$REGION" >/dev/null
cd "$ROOT_DIR"

sam build --template-file infrastructure/template.yaml
sam deploy --template-file .aws-sam/build/template.yaml \
  --stack-name "$STACK_NAME" \
  --region "$REGION" \
  --capabilities CAPABILITY_IAM \
  --resolve-s3 \
  --no-confirm-changeset \
  --parameter-overrides \
    KnowledgeBaseId="${KNOWLEDGE_BASE_ID:-}" \
    ModelArn="${MODEL_ARN:-}" \
    AllowedOrigin="${ALLOWED_ORIGIN:-*}"

echo
echo "Stack outputs:"
aws cloudformation describe-stacks --stack-name "$STACK_NAME" --region "$REGION" \
  --query 'Stacks[0].Outputs[*].[OutputKey,OutputValue]' --output table
