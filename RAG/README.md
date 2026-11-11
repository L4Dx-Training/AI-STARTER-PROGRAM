# AWS Serverless RAG Chatbot

Implementation of [Day 7 BRD-001](../Day7/1-RAG-using-KIRO-BRD.md).

## Architecture

- **Frontend:** HTML, CSS and vanilla JavaScript hosted in private S3 and delivered through CloudFront.
- **Authentication:** Amazon Cognito User Pool. The browser uses Cognito JWT tokens.
- **API:** API Gateway REST API with a Cognito User Pool authorizer.
- **Backend:** Python 3.12 AWS Lambda.
- **Documents:** Private S3 bucket.
- **RAG:** Amazon Bedrock Knowledge Bases using Amazon S3 Vectors.
- **Model:** A Bedrock foundation model or inference profile configured for RetrieveAndGenerate.

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
├── sample-documents/
│   └── sample-knowledge.md
├── events/
│   └── chat-event.json
├── infrastructure/
│   └── template.yaml
├── scripts/
│   ├── deploy.sh
│   └── sync-knowledge-base.sh
├── docs/
│   └── KIRO-INSTRUCTIONS.md
├── .env.example
├── .gitignore
└── README.md
```

## Prerequisites

1. AWS CLI v2 configured with credentials for the target account.
2. AWS SAM CLI installed.
3. Python 3.12.
4. An Amazon Bedrock model enabled/available in the selected AWS Region.
5. Amazon Bedrock Knowledge Bases and S3 Vectors available in the selected Region.
6. Permission to create CloudFormation, Lambda, API Gateway, Cognito, S3, CloudFront and IAM resources.

Default region in examples: `ap-south-1`.

## Deployment sequence

The SAM stack creates the application foundation. The Bedrock Knowledge Base and S3 Vectors are provisioned separately because the vector bucket/index and Knowledge Base require service-specific configuration and identifiers.

1. Deploy the application infrastructure.
2. Create an S3 Vectors vector bucket and vector index.
3. Create a Bedrock Knowledge Base using the project document bucket as its S3 data source and the S3 Vectors index as its vector store.
4. Run the initial data source ingestion job.
5. Redeploy the Lambda with the Knowledge Base ID and model ARN.
6. Configure the frontend with the Cognito app client ID and API URL, then upload it to the private S3 frontend bucket.
7. Create a Cognito user with a permanent password (or complete the Hosted UI/PKCE sign-in flow when that is implemented).
8. Sign in and test a question against the indexed sample document.

## Deploy application infrastructure

From this directory:

```bash
sam validate --template-file infrastructure/template.yaml
sam build --template-file infrastructure/template.yaml
sam deploy --template-file infrastructure/template.yaml --guided
```

The template creates:
- Private frontend S3 bucket and CloudFront distribution with Origin Access Control.
- Private S3 document bucket.
- Cognito User Pool and public browser app client.
- API Gateway REST API with Cognito authorizer.
- Python Lambda chat function.

Record the CloudFormation outputs, especially `FrontendBucketName`, `DocumentsBucketName`, `UserPoolId`, `UserPoolClientId`, `ChatApiUrl`, and `CloudFrontURL`.

## Configure the Bedrock Knowledge Base

Create an S3 Vectors vector bucket and a vector index in a Region supported by both S3 Vectors and Bedrock Knowledge Bases. Configure the Knowledge Base with:

- Data source: the `DocumentsBucketName` bucket created by this stack.
- Vector store: the S3 Vectors vector index.
- Embedding model: a Bedrock embedding model supported by Knowledge Bases and S3 Vectors.
- Bedrock service role: least-privilege access to the source bucket, vector index, and embedding model.

The index must have the fields/configuration required by Bedrock Knowledge Bases. Follow the current AWS documentation linked below rather than guessing vector index field names.

After creating the Knowledge Base, note its Knowledge Base ID, data source ID and the model ARN (or inference profile ARN) selected for response generation. Set the deployment environment variables from `.env.example` or pass the equivalent SAM parameters:

- `KNOWLEDGE_BASE_ID` maps to template parameter `KnowledgeBaseId`.
- `MODEL_ARN` maps to template parameter `ModelArn`.

Then deploy again:

```bash
KNOWLEDGE_BASE_ID=<knowledge-base-id> MODEL_ARN=<model-or-inference-profile-arn> AWS_REGION=ap-south-1 ./scripts/deploy.sh
```

## Upload and index the sample document

Get the document bucket name from CloudFormation outputs, then upload:

```bash
aws s3 cp sample-documents/sample-knowledge.md s3://<DocumentsBucketName>/sample-knowledge.md --region ap-south-1
./scripts/sync-knowledge-base.sh <knowledge-base-id> <data-source-id> ap-south-1
```

Wait for the ingestion job to complete successfully before querying the chatbot.

## Configure and deploy the frontend

Edit `frontend/app.js` and set:

- `region`: the stack Region.
- `userPoolClientId`: CloudFormation output `UserPoolClientId`.
- `apiUrl`: CloudFormation output `ChatApiUrl`.

Then upload the frontend:

```bash
aws s3 sync frontend/ s3://<FrontendBucketName>/ --delete --region ap-south-1
```

Open the `CloudFrontURL` output. Do not use the S3 website endpoint; the frontend bucket is private and CloudFront serves it over HTTPS.

## Cognito user setup

The sample frontend currently uses Cognito `USER_PASSWORD_AUTH` for a simple training demonstration. Create the user administratively, then set a permanent password before attempting sign-in. The current client does not implement the `NEW_PASSWORD_REQUIRED` challenge.

For production, replace this development sign-in with Cognito Hosted UI using authorization code flow with PKCE, implement refresh-token/session handling, and validate logout/session behavior end to end.

## Security and known scaffold limitations

- Frontend and document buckets are private. CloudFront uses Origin Access Control for frontend reads.
- API Gateway requires a Cognito User Pool token.
- Lambda reads Knowledge Base/model identifiers from environment variables.
- Do not commit AWS credentials, passwords, or secrets.
- The frontend's current logout clears its browser session token; it does not implement Cognito global sign-out. A token already issued may remain usable by a Cognito authorizer until it expires. Implement Hosted UI logout/session handling and, where immediate revocation is required, an appropriate server-side revocation strategy.
- Review and tighten IAM resources for your Knowledge Base/model ARNs before production use.

## AWS references

- [Bedrock Knowledge Base with S3 Vectors prerequisites](https://docs.aws.amazon.com/bedrock/latest/userguide/knowledge-base-setup.html)
- [Create a Bedrock Knowledge Base](https://docs.aws.amazon.com/bedrock/latest/userguide/knowledge-base-create.html)
- [Query a Knowledge Base with RetrieveAndGenerate](https://docs.aws.amazon.com/bedrock/latest/userguide/kb-how-retrieval.html)
- [Sync a Knowledge Base data source](https://docs.aws.amazon.com/bedrock/latest/userguide/kb-how-data.html)

## Status

Initial implementation scaffold committed. Validate and deploy in a non-production AWS account first. End-to-end RAG testing requires the Bedrock Knowledge Base/vector index identifiers and a model ARN.
