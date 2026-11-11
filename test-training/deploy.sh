#!/usr/bin/env bash
set -euo pipefail

# Usage: ./deploy.sh <globally-unique-bucket-name> [aws-region]
BUCKET_NAME="${1:-}"
AWS_REGION="${2:-ap-south-1}"

if [[ -z "$BUCKET_NAME" ]]; then
  echo "Usage: $0 <globally-unique-bucket-name> [aws-region]"
  echo "Example: $0 my-training-site-12345 ap-south-1"
  exit 1
fi

if ! command -v aws >/dev/null 2>&1; then
  echo "Error: AWS CLI is not installed."
  exit 1
fi

echo "Checking AWS credentials..."
aws sts get-caller-identity >/dev/null

echo "Creating S3 bucket: $BUCKET_NAME"
if aws s3api head-bucket --bucket "$BUCKET_NAME" 2>/dev/null; then
  echo "Bucket already exists and is accessible; continuing."
else
  if [[ "$AWS_REGION" == "us-east-1" ]]; then
    aws s3api create-bucket --bucket "$BUCKET_NAME" --region "$AWS_REGION"
  else
    aws s3api create-bucket --bucket "$BUCKET_NAME" --region "$AWS_REGION" \
      --create-bucket-configuration LocationConstraint="$AWS_REGION"
  fi
fi

echo "Configuring static website hosting..."
aws s3 website "s3://$BUCKET_NAME/" --index-document index.html --error-document index.html

echo "Allowing public website reads (required for a direct S3 website endpoint)..."
aws s3api put-public-access-block --bucket "$BUCKET_NAME" \
  --public-access-block-configuration \
  'BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false'

aws s3api put-bucket-policy --bucket "$BUCKET_NAME" --policy "{
  \"Version\": \"2012-10-17\",
  \"Statement\": [{
    \"Sid\": \"PublicReadForWebsite\",
    \"Effect\": \"Allow\",
    \"Principal\": \"*\",
    \"Action\": \"s3:GetObject\",
    \"Resource\": \"arn:aws:s3:::$BUCKET_NAME/*\"
  }]
}"

echo "Uploading website files..."
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
aws s3 sync "$SCRIPT_DIR" "s3://$BUCKET_NAME/" \
  --exclude "deploy.sh" \
  --exclude "README.md" \
  --exclude ".git/*" \
  --delete

echo
echo "Deployment complete."
echo "S3 website endpoint:"
echo "http://$BUCKET_NAME.s3-website-$AWS_REGION.amazonaws.com"
echo
echo "Note: S3 website endpoints use HTTP. For HTTPS, put CloudFront in front of the bucket."
