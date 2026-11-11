# KIRO-INSTRUCTIONS-001: RAG Chatbot Development

Read and follow `docs/BRD-001-RAG-Chatbot.md`.

Build the application using KIRO Spec-driven Development.

## Technology Stack

- Frontend: HTML5, CSS3, Vanilla JavaScript.
- Hosting: S3 + CloudFront.
- Authentication: Amazon Cognito User Pool.
- API: API Gateway REST API with Cognito authorizer.
- Backend: Python AWS Lambda.
- Document storage: Amazon S3.
- Vector database: Amazon S3 Vectors.
- RAG: Amazon Bedrock Knowledge Bases.
- Foundation Model: Amazon Bedrock.
- Infrastructure: AWS SAM / CloudFormation.

## Development Stages

Follow these stages:

1. Requirements specification.
2. Architecture and design.
3. Task planning.
4. Implementation.
5. Functional and integration testing.
6. Deployment preparation.

## Implementation Requirements

- Read the BRD before development.
- Implement Cognito authentication and logout.
- Restrict chat access to authenticated users.
- Build a simple chatbot UI.
- Implement Python Lambda for chat processing.
- Integrate Lambda with Bedrock Knowledge Bases using RetrieveAndGenerate.
- Configure S3 as the document data source.
- Configure S3 Vectors as the Knowledge Base vector store.
- Use Bedrock embedding and foundation models.
- Display AI responses and source citations.
- Configure API Gateway Cognito authorization.
- Use environment variables for resource configuration.
- Apply least-privilege IAM permissions.
- Keep frontend, backend and infrastructure code separate.

## Testing

Perform only minimum testing:

1. Cognito login and logout.
2. Access chat after authentication.
3. Reject unauthenticated API requests.
4. Submit a question and receive an answer.
5. Verify retrieval from the Knowledge Base.
6. Verify frontend-to-backend integration.

No elaborate testing or performance benchmarking.

## Development Rules

- Follow the BRD without adding unnecessary features.
- Do not hardcode credentials or secrets.
- Use Python for backend development.
- Use AWS SAM/CloudFormation for infrastructure.
- Work one task at a time.
- Review each development stage before proceeding.
- Do not deploy to AWS without explicit approval.

**Start by inspecting the repository and creating the KIRO Requirements specification. Do not start implementation until Requirements, Design and Tasks are reviewed.**
