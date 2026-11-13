# AI STARTER PROGRAM – Feedback & Impact Survey

A mobile-friendly feedback questionnaire for the AI STARTER PROGRAM.

## Files
- \`index.html\`: Static survey UI.
- \`Code.gs\`: Google Apps Script endpoint that writes responses to a Google Sheet.

## 1. Connect response storage (Google Sheets)

GitHub Pages only hosts static files; it does not store form submissions. Connect the survey to a Google Sheet:

1. Create a new Google Sheet, for example **AI STARTER PROGRAM - Feedback Responses**.
2. In the sheet, select **Extensions → Apps Script**.
3. Replace the editor contents with the code from [Code.gs](./Code.gs).
4. Save the Apps Script project.
5. Select **Deploy → New deployment**.
6. Select type **Web app**.
7. Set **Execute as** to **Me**.
8. Set **Who has access** to **Anyone**. This is required for students to submit without signing in. Do not put confidential data in this sheet.
9. Deploy and authorize the script.
10. Copy the Web app URL ending in \`/exec\`.
11. In \`index.html\`, replace \`PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE\` in \`GOOGLE_SCRIPT_URL\` with the deployed URL.
12. Commit the updated \`index.html\` to GitHub.

The first submission creates a \`Responses\` tab and writes the survey responses as rows. Protect the response spreadsheet and share it only with authorized training administrators.

## 2. Publish with GitHub Pages

1. Open the repository **Settings → Pages**.
2. Under **Build and deployment → Source**, select **GitHub Actions**.
3. The workflow in \`.github/workflows/deploy-feedback-pages.yml\` will publish the contents of this \`feedback\` folder.
4. Push a change to \`feedback/**\` or run the workflow manually from the Actions tab.
5. Once the workflow succeeds, the site will be available at:

   \`https://l4dx-training.github.io/AI-STARTER-PROGRAM/\`

If the repository already has a Pages site, check its current deployment configuration before changing it.

## Privacy and response handling

- Name and email are optional.
- The form does not request passwords or sensitive personal information.
- Anyone with the published form URL can submit a response.
- The Google Apps Script endpoint is public so students can submit without Google sign-in. Protect the destination Sheet and review submissions for spam.
- The browser uses a no-CORS form POST; the page confirms that the request was sent, but cannot read a server-side error response. Check the Google Sheet to verify receipt.
