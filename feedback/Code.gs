/**
 * AI STARTER PROGRAM - Feedback survey response collector
 *
 * Setup:
 * 1. Create a new Google Sheet.
 * 2. Open Extensions > Apps Script.
 * 3. Replace the editor contents with this file.
 * 4. Deploy > New deployment > Web app.
 * 5. Execute as: Me. Who has access: Anyone.
 * 6. Copy the Web app URL into GOOGLE_SCRIPT_URL in feedback/index.html.
 */
function doPost(e) {
  try {
    var raw = e && e.parameter && e.parameter.payload;
    if (!raw) throw new Error("Missing payload");
    var payload = JSON.parse(raw);
    var answers = payload.answers || {};
    var lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var sheet = ss.getSheetByName("Responses") || ss.insertSheet("Responses");
      var keys = Object.keys(answers);
      var headers = ["Submitted At", "Form", "Participant Name", "Email", "Participant Category"].concat(keys);
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(headers);
      } else {
        var existing = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
        headers.forEach(function(h) {
          if (existing.indexOf(h) === -1) {
            sheet.getRange(1, sheet.getLastColumn() + 1).setValue(h);
            existing.push(h);
          }
        });
      }
      var currentHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      var rowData = {
        "Submitted At": payload.submittedAt || new Date().toISOString(),
        "Form": payload.form || "AI STARTER PROGRAM Feedback",
        "Participant Name": answers.name || "",
        "Email": answers.email || "",
        "Participant Category": answers.status || ""
      };
      keys.forEach(function(k) { rowData[k] = answers[k]; });
      var row = currentHeaders.map(function(h) {
        var value = rowData[h] === undefined ? "" : rowData[h];
        if (Array.isArray(value)) value = value.join(", ");
        value = String(value);
        if (/^[=+\-@]/.test(value)) value = "'" + value;
        return value;
      });
      sheet.appendRow(row);
    } finally {
      lock.releaseLock();
    }
    return ContentService.createTextOutput(JSON.stringify({ok:true})).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ok:false,error:String(err)})).setMimeType(ContentService.MimeType.JSON);
  }
}
function doGet() {
  return ContentService.createTextOutput("AI STARTER PROGRAM feedback collector is running.");
}