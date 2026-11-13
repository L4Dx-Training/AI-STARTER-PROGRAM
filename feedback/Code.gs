/**
 * AI STARTER PROGRAM – Feedback collection
 * Deploy as a Web app: Execute as Me; access: Anyone.
 * Creates a private response spreadsheet automatically on first visit.
 */
const SHEET_NAME = "Feedback Responses";
const PROPERTY_KEY = "AI_STARTER_FEEDBACK_SPREADSHEET_ID";

function doGet() {
  const sheet = getOrCreateSheet_();
  const url = sheet.getParent().getUrl();
  return HtmlService.createHtmlOutput(
    '<!doctype html><html><body style="font:16px Arial;padding:32px">' +
    '<h2>AI Starter Program feedback backend is ready</h2>' +
    '<p>Your response spreadsheet has been created.</p>' +
    '<p><a href="' + url + '" target="_blank">Open feedback response spreadsheet</a></p>' +
    '<p>Copy this Web App URL ending in <code>/exec</code> into feedback/index.html in GitHub.</p>' +
    '</body></html>'
  ).setTitle("AI Starter Program – Setup");
}

function doPost(e) {
  try {
    const raw = e && e.parameter && e.parameter.payload;
    if (!raw || raw.length > 50000) throw new Error("Invalid or oversized submission.");
    const payload = JSON.parse(raw);
    if (!payload || !payload.answers || typeof payload.answers !== "object") {
      throw new Error("Invalid submission.");
    }
    const sheet = getOrCreateSheet_();
    const answers = payload.answers;
    const row = [
      payload.submittedAt || new Date().toISOString(),
      payload.form || "AI STARTER PROGRAM Feedback",
      answers.name || "",
      answers.email || "",
      answers.status || "",
      JSON.stringify(answers)
    ];
    sheet.appendRow(row);
    return ContentService.createTextOutput(JSON.stringify({ok:true}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    console.error(err);
    return ContentService.createTextOutput(JSON.stringify({ok:false,error:String(err)}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getOrCreateSheet_() {
  const props = PropertiesService.getScriptProperties();
  let id = props.getProperty(PROPERTY_KEY);
  let ss = null;
  if (id) {
    try { ss = SpreadsheetApp.openById(id); } catch (err) { ss = null; }
  }
  if (!ss) {
    ss = SpreadsheetApp.create("AI STARTER PROGRAM – Feedback Responses");
    props.setProperty(PROPERTY_KEY, ss.getId());
  }
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Submitted At", "Form", "Participant Name", "Email", "Participant Category", "All Answers (JSON)"]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}
