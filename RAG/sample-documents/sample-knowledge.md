# Sample Knowledge Base Document

## About L4DX

L4DX is a practical learning program focused on cloud, DevOps, Kubernetes and modern application development. Training combines guided explanations with hands-on exercises.

## Cloud and DevOps learning path

A typical cloud and DevOps learning path includes:
1. Linux fundamentals and networking.
2. AWS core services such as IAM, VPC, EC2 and S3.
3. Git and collaborative source control.
4. CI/CD pipelines and automation.
5. Docker containers and container registries.
6. Kubernetes fundamentals and application deployment.
7. Monitoring, logging and operational troubleshooting.

## AWS S3

Amazon Simple Storage Service (Amazon S3) is an object storage service. A bucket is a container for objects. Objects are addressed by keys. S3 can store static website assets, application files, backups and documents.

## Retrieval Augmented Generation

Retrieval Augmented Generation (RAG) combines information retrieval with a generative language model. A typical RAG workflow:
1. Documents are stored in a data source.
2. Documents are parsed and split into chunks.
3. An embedding model converts chunks into vectors.
4. Vectors and source text are stored in a vector index.
5. A user question is embedded and matched against relevant chunks.
6. A language model generates an answer grounded in retrieved context.
7. The application returns the answer and source references.

## Amazon Bedrock Knowledge Bases and S3 Vectors

Amazon Bedrock Knowledge Bases can manage ingestion and retrieval for supported data sources and vector stores. With an S3 data source, a synchronization job indexes document changes. Amazon S3 Vectors can store the embeddings used by a Bedrock Knowledge Base.

## Security basics

- Use IAM roles rather than long-lived access keys in application code.
- Grant only the permissions required by each service.
- Keep document buckets private.
- Require authentication for protected application APIs.
- Never store passwords or access keys in source control.
