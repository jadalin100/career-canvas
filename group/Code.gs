/**
 * Group compare backend for the Career Canvas quizzes.
 *
 * Deploy as a Google Apps Script bound to a Google Sheet, then paste the
 * deployed web-app URL into GROUP_ENDPOINT near the top of site/app.js.
 *
 * Storage: one row per completed quiz -- {group, quiz, top3 (3 codes), ts}.
 * Never a name, an answer, or any device identifier.
 *
 * doPost  -- a student's browser posts a completed quiz (no-cors, fire and
 *            forget; the response is never read, so it can be anything).
 * doGet   -- the Group tab reads back a tally for one group code, as JSONP
 *            (Apps Script's own CORS support is unreliable for plain fetch,
 *            so the client loads this as a <script src> and we call back).
 *
 * Setup:
 *   1. In the target Sheet: Extensions -> Apps Script, paste this file in as
 *      Code.gs.
 *   2. Deploy -> New deployment -> type "Web app".
 *      Execute as: Me. Who has access: Anyone.
 *   3. Copy the /exec URL into GROUP_ENDPOINT in site/app.js.
 *   4. Give students a group code (e.g. your period number) -- they type it
 *      once on the Group tab.
 */

const SHEET_NAME = "results";

function doPost(e) {
  const sheet = getSheet_();
  try {
    const body = JSON.parse(e.postData.contents);
    const group = String(body.group || "").slice(0, 60);
    const quiz = String(body.quiz || "").slice(0, 20);
    const top3 = Array.isArray(body.top3) ? body.top3.slice(0, 3).map(String) : [];
    if (!group || !quiz || !top3.length) throw new Error("missing fields");
    sheet.appendRow([group, quiz, top3.join(","), body.ts || new Date().toISOString()]);
  } catch (err) {
    // a bad payload should never surface to the student's browser -- the
    // fetch is no-cors, so this response is discarded either way
  }
  return ContentService.createTextOutput("ok");
}

function doGet(e) {
  const group = String((e.parameter && e.parameter.group) || "");
  const callback = String((e.parameter && e.parameter.callback) || "");
  const stats = group ? tally_(group) : { students: 0, counts: {} };
  const json = JSON.stringify(stats);
  const body = callback ? `${callback}(${json})` : json;
  return ContentService.createTextOutput(body).setMimeType(ContentService.MimeType.JAVASCRIPT);
}

function tally_(group) {
  const rows = getSheet_().getDataRange().getValues().slice(1); // drop header
  const counts = {}; // {quiz: {code: n}}
  let students = 0;
  for (const [rowGroup, quiz, top3csv] of rows) {
    if (rowGroup !== group) continue;
    students++;
    const codes = String(top3csv).split(",").filter(Boolean);
    const first = codes[0]; // the student's #1 match counts toward the class distribution
    if (!first) continue;
    counts[quiz] = counts[quiz] || {};
    counts[quiz][first] = (counts[quiz][first] || 0) + 1;
  }
  return { students, counts };
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(["group", "quiz", "top3", "ts"]);
  }
  return sheet;
}
