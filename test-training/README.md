# AWS S3 Static Website Sample

A minimal static web app deployed to an Amazon S3 bucket configured for static website hosting.

## Project files

- `index.html` — sample website homepage
- `deploy.sh` — creates/configures the bucket and uploads the website

## Prerequisites

- AWS CLI v2 installed
- AWS credentials configured with permission to create and configure S3 buckets and policies
- A globally unique S3 bucket name

Check your AWS identity:

```bash
aws sts get-caller-identity
```

## Deploy

From this directory:

```bash
chmod +x deploy.sh
./deploy.sh <globally-unique-bucket-name> [aws-region]
```

Example:

```bash
./deploy.sh l4dx-sample-site-unique-12345 ap-south-1
```

If the region is omitted, the script uses `ap-south-1`.

After deployment, open the S3 website endpoint printed by the script.

## Important security note

This example makes website objects publicly readable and disables the bucket's S3 Block Public Access settings so the direct S3 website endpoint can serve the page. Use a dedicated bucket containing only public website assets. Do not upload secrets, credentials, private files, or application data.

The S3 static website endpoint supports HTTP, not HTTPS. For a production website, use CloudFront with a private S3 origin and Origin Access Control instead of public bucket access.

## Update the website

Edit `index.html`, then run the same deployment command again. The script syncs the project files to the bucket.
