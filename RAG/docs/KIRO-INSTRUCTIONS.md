# KIRO Instructions - AWS Serverless RAG Chatbot

Implement the application according to the BRD at `../../Day7/1-RAG-using-KIRO-BRD.md` (repository path: `Day7/1-RAG-using-KIRO-BRD.md`).

## Frozen requirements

- Frontend: HTML5, CSS3 and vanilla JavaScript. Do not introduce React, Angular or Vue.
- Hosting: private S3 bucket behind CloudFront with Origin Access Control.
- Authentication: Amazon Cognito User Pool.
- API: API Gateway REST API with Cognito User Pool authorizer.
- Backend: Python Lambda.
- RAG: Amazon Bedrock Knowledge Bases backed by Amazon S3 Vectors.
- Documents: private S3 source bucket.
- Use AWS SAM/CloudFormation. Do not introduce Terraform.
- Region default: ap-south-1.
- Keep implementation small. Perform only minimum functional and integration tests; avoid elaborate testing.

## Implementation tasks

1. Read the BRD and inspect all files already in `RAG/`. Preserve the frozen architecture.
2. Complete Cognito sign-in, refresh/session handling and logout. Prefer Cognito authorization-code flow with PKCE and Hosted UI for production. Never store passwords. The current direct password flow is only a training scaffold.
3. Ensure API requests use an appropriate Cognito token in the Authorization header and API Gateway validates it through the Cognito User Pool authorizer.
4. Implement Lambda request validation and Bedrock Knowledge Bases `RetrieveAndGenerate` integration. Return answer text and available source citations.
5. Provision/document the S3 Vectors vector bucket/index and Bedrock Knowledge Base/data source. Use supported CloudFormation resources or explicit AWS CLI/console steps only after checking current AWS service support.
6. Configure least-privilege IAM for the Lambda execution role and Bedrock Knowledge Base service role. Avoid wildcard resources where resource ARNs are known and supported.
7. Complete deployment instructions, upload the sample document, run ingestion sync, and test authenticated chat.
8. Run minimum checks only: SAM validate/build, one unauthenticated API request (must fail), one authenticated chat request, and one logout/session check.

Do not hardcode account IDs, secrets, passwords, bucket names, user pool IDs, Knowledge Base IDs, or model ARNs. Use parameters, outputs and environment variables. Explain any manual Bedrock/S3 Vectors setup prerequisite clearly.
