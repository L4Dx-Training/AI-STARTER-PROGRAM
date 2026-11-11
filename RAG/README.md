# AWS Serverless RAG Chatbot

Implementation of [Day 7 BRD-001](../Day7/1-RAG-using-KIRO-BRD.md).

## Architecture

- **Frontend:** HTML, CSS and vanilla JavaScript hosted in private S3 and delivered through CloudFront.
- **Authentication:** Amazon Cognito User Pool. The browser uses Cognito JWT tokens.
- **API:** API Gateway REST API with a Cognito User Pool authorizer.
- **Backend:** Python 3.12 AWS Lambda.
- **Documents:** Private S3 bucket.
- **RAG:** Amazon Bedrock Knowledge Bases using Amazon S3 Vectors.
- **Model:** A Bedrock model selected/configured for the Knowledge Base.

## Project structure

```text
RAG/
├── frontend/
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── backend/
│   ├── app.py
│   └── requirements.txt
├── events/
│   └── chat-event.json
├── infrastructure/
│   └── template.yaml
├── scripts/
│   ├── deploy.sh
│   └── sync-knowledge-base.sh
├── docs/
│   └── KI​​RO-INSTRUCTIONS.md
├── .gitignore
└── README.md
```

## Deployment prerequisites

1. AWS CLI v2 configured with credentials for the target account.
2. AWS SAM CLI installed.
3. Python 3.12 and Node.js/npm available (for Cognito browser SDK dependency if you choose to bundle it locally).
4. An Amazon Bedrock model enabled/available in the selected AWS Region.
5. S3 Vectors and Bedrock Knowledge Bases available in the selected Region.
6. Permission to create CloudFormation, Lambda, API Gateway, Cognito, S3, CloudFront and IAM resources.

Default region in examples: `ap-south-1`.

## Important implementation order

This repository provides the application and SAM stack foundation. The Bedrock Knowledge Base and S3 Vectors setup is intentionally a separate prerequisite because its vector index and Knowledge Base identifiers are regional resources with service-specific configuration.

1. Review `infrastructure/template.yaml` and deploy the application stack.
2. Create/configure an S3 Vectors vector bucket and vector index, then create a Bedrock Knowledge Base using the project document bucket as its data source.
3. Run the Knowledge Base data source sync.
4. Add the Knowledge Base ID and model ID to the Lambda environment through SAM parameters.
5. Build and deploy the frontend to the S3 bucket output by CloudFormation.
6. Create a Cognito user using the AWS Console or CLI, then sign in through the frontend.

## Deploy the application infrastructure

From this directory:

```bash
sam build --template-file infrastructure/template.yaml
sam deploy --template-file infrastructure/template.yaml --guided
```

The SAM template creates the frontend bucket, document bucket, Cognito User Pool/client, chat Lambda, REST API with Cognito authorization, and CloudFront distribution.

## Configure the Bedrock Knowledge Base

Create an S3 Vectors vector bucket and vector index in the same Region as the Bedrock Knowledge Base. Configure the Knowledge Base with:
- Data source: the DocumentsBucket created by this stack.
- Vector store: the S3 Vectors vector index.
- Embedding model: a Bedrock embedding model supported by Knowledge Bases and S3 Vectors.
- IAM role: least-privilege access to the source bucket, vector index, and embedding model.

After creating the Knowledge Base, set `KnowledgeBaseId` and `BedrockModelId` during the next deployment. Run a data source ingestion/sync after uploading source documents.

## Deploy frontend

After SAM deployment, use the CloudFormation output `FrontendBucketName`:

```bash
aws s3 sync frontend/ s3://<FrontendBucketName>/ --delete --region ap-south-1
```

Open the `CloudFrontURL` output. Do not use the S3 website endpoint; CloudFront serves the private bucket.

## Upload documents and sync

Upload source files to the `DocumentsBucketName` output. Then run:

```bash
./scripts/sync-knowledge-base.sh <knowledge-base-id> <data-source-id> ap-south-1
```

## Security

- Frontend bucket is private; CloudFront uses Origin Access Control.
- API Gateway requires a Cognito User Pool JWT.
- Lambda reads Knowledge Base/model identifiers from environment variables.
- Do not commit AWS credentials, Cognito user passwords, or other secrets.
- The API response includes source references returned by Bedrock Knowledge Bases.

## Current implementation status

This is the initial project scaffold. Validate the SAM template and deploy in a non-production AWS account before using it with real documents. Create the Knowledge Base/vector index and provide their identifiers before end-to-end RAG testing.
