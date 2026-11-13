# AI STARTER PROGRAM – Feedback & Impact Survey

## Cloudflare Worker setup and cost

Cloudflare Workers Free is **$0** and includes 100,000 Worker requests per day and 10 ms CPU per invocation. This is normally sufficient for a short training feedback run. The free tier does not automatically upgrade to paid; requests stop working if the daily limit is exceeded. [Official pricing](https://developers.cloudflare.com/workers/platform/pricing/).

1. In Cloudflare, open **Workers & Pages → Create Worker** and name it `l4dx-feedback-api`.
2. Open **Edit Code**, replace the sample code with `worker.js` from this folder, and deploy.
3. Under Worker **Settings → Variables and Secrets**, add secret `GITHUB_TOKEN`. Create a GitHub fine-grained token restricted to this repository with **Contents: Read and write** permission.
4. Add these text variables:
   - `GITHUB_OWNER` = `L4Dx-Training`
   - `GITHUB_REPO` = `AI-STARTER-PROGRAM`
   - `GITHUB_BRANCH` = `main`
   - `ALLOWED_ORIGIN` = `https://l4dx-training.github.io`
5. Copy the Worker URL.
6. In `index.html`, replace `PASTE_YOUR_CLOUDFLARE_WORKER_URL_HERE` with your Worker URL and commit the change.

## Publish the form

In the GitHub repository, open **Settings → Pages → Build and deployment** and select **GitHub Actions** as the source. The workflow publishes this folder.

## Response storage

Each submission is appended as one JSON record per line in `feedback.txt`. The file is public, as requested. Do not collect passwords, financial details, or other sensitive personal information.
