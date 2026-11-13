# AI STARTER PROGRAM – Feedback & Impact Survey

## Current setup: Google Apps Script + Google Sheets

The survey website is hosted on GitHub Pages. Google Apps Script receives each submission and appends it to a Google Sheet. The response spreadsheet is private to the Google account that deploys the script; it is not published in this GitHub repository.

### 1. Create the Apps Script backend

1. Sign in to the Google account that should own the responses.
2. Open [Google Apps Script](https://script.google.com/home).
3. Click **New project**.
4. Replace the contents of `Code.gs` with the code in this folder's `Code.gs` file.
5. Click **Save** and name the project `AI Starter Program Feedback`.

### 2. Deploy it as a Web App

1. Click **Deploy → New deployment**.
2. Click the gear icon and choose **Web app**.
3. Set **Execute as** to **Me**.
4. Set **Who has access** to **Anyone**.
5. Click **Deploy** and approve the Google permissions.
6. Copy the Web App URL ending in `/exec`.
7. Open that URL in a browser. It should show a setup page with a link to the newly created response spreadsheet. Keep that spreadsheet private.

### 3. Connect the website

In `feedback/index.html`, replace:

```js
const APPS_SCRIPT_URL = "PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE";
```

with your Web App URL, including `/exec`, and commit the change to `main`. GitHub Actions will redeploy the site.

### 4. Test

Open the live survey, submit one clearly marked test response, and check that a new row appears in the Google Sheet. Delete the test row afterward if desired.

## Important privacy and security notes

- The Google Sheet is private by default; do not change its sharing to public.
- The Apps Script Web App must be accessible to anyone so learners can submit without signing in. The script runs as its owner and writes to the owner's private sheet.
- The form sends a simple cross-origin POST because browsers do not reliably expose Apps Script responses to GitHub Pages. The page can detect network failure, but cannot read the Apps Script response body; verify the first test in the spreadsheet.
- Do not collect passwords, financial details, health information, or other sensitive personal information.
- The former Cloudflare Worker is no longer used by the form. No GitHub token is required for this Google Sheets approach.

## Publish the form

The existing GitHub Actions workflow publishes this folder to GitHub Pages. The live site is:

https://l4dx-training.github.io/AI-STARTER-PROGRAM/feedback/
