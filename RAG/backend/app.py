import json
import logging
import os
from typing import Any

import boto3
from botocore.exceptions import ClientError

logger = logging.getLogger()
logger.setLevel(logging.INFO)

BEDROCK_REGION = os.environ.get("BEDROCK_REGION", os.environ.get("AWS_REGION", "ap-south-1"))
KNOWLEDGE_BASE_ID = os.environ.get("KNOWLEDGE_BASE_ID", "")
MODEL_ARN = os.environ.get("MODEL_ARN", "")

bedrock_agent = boto3.client("bedrock-agent-runtime", region_name=BEDROCK_REGION)


def _response(status_code: int, body: dict[str, Any]) -> dict[str, Any]:
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": os.environ.get("ALLOWED_ORIGIN", "*"),
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
            "Access-Control-Allow-Methods": "OPTIONS,POST",
        },
        "body": json.dumps(body, default=str),
    }


def lambda_handler(event: dict[str, Any], context: Any) -> dict[str, Any]:
    if event.get("httpMethod") == "OPTIONS":
        return _response(200, {"message": "ok"})

    # API Gateway Cognito authorizer is the primary authentication boundary.
    authorizer = (
        event.get("requestContext", {})
        .get("authorizer", {})
        .get("claims", {})
    )
    if not authorizer:
        return _response(401, {"message": "Unauthorized"})

    try:
        body = event.get("body") or "{}"
        if event.get("isBase64Encoded"):
            import base64
            body = base64.b64decode(body).decode("utf-8")
        payload = json.loads(body)
        question = str(payload.get("question", "")).strip()
        if not question:
            return _response(400, {"message": "question is required"})
        if not KNOWLEDGE_BASE_ID or not MODEL_ARN:
            logger.error("Knowledge Base configuration is missing")
            return _response(500, {"message": "RAG service is not configured"})

        result = bedrock_agent.retrieve_and_generate(
            input={"text": question},
            retrieveAndGenerateConfiguration={
                "type": "KNOWLEDGE_BASE",
                "knowledgeBaseConfiguration": {
                    "knowledgeBaseId": KNOWLEDGE_BASE_ID,
                    "modelArn": MODEL_ARN,
                },
            },
        )

        output = result.get("output", {}).get("text", "")
        citations = []
        for citation in result.get("citations", []):
            for reference in citation.get("retrievedReferences", []):
                location = reference.get("location", {})
                metadata = reference.get("metadata", {})
                citations.append({
                    "location": location,
                    "title": metadata.get("title") or metadata.get("x-amz-bedrock-kb-source-uri"),
                })

        return _response(200, {"answer": output, "citations": citations})
    except json.JSONDecodeError:
        return _response(400, {"message": "Request body must be valid JSON"})
    except ClientError as exc:
        logger.exception("Bedrock Knowledge Bases request failed")
        error = exc.response.get("Error", {})
        code = error.get("Code", "ServiceError")
        if code in {"AccessDeniedException", "UnauthorizedException"}:
            return _response(502, {"message": "RAG service is not authorized to access the Knowledge Base"})
        return _response(502, {"message": "Unable to retrieve an answer from the RAG service"})
    except Exception:
        logger.exception("Unexpected error while processing chat request")
        return _response(500, {"message": "Internal server error"})
