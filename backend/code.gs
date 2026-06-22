// ATH Open Pickleball Tournament — Google Apps Script Backend
// Deploy as Web App: Execute as "Me", Access "Anyone"
// Paste the Web App URL into VITE_SHEETS_API_URL in your .env file

const SS_ID = ''; // ← paste your Google Spreadsheet ID here after creating it

function getSpreadsheet() {
  return SS_ID
    ? SpreadsheetApp.openById(SS_ID)
    : SpreadsheetApp.getActiveSpreadsheet();
}

// ──────────────────────────────────────────────────────────────────────────────
// Router
// ──────────────────────────────────────────────────────────────────────────────
function doGet(e) {
  const action = e.parameter.action || '';
  let result;

  try {
    switch (action) {
      case 'getPlayers':   result = getPlayers();                       break;
      case 'getMatches':   result = getMatches();                       break;
      case 'getStandings': result = getStandings();                     break;
      case 'initSheets':   result = initSheets();                       break;
      case 'registerPlayer':
        result = registerPlayer(e.parameter);
        break;
      case 'updateScore':
        result = updateScore(e.parameter.matchId, e.parameter.winner);
        break;
      default:
        result = { success: false, error: 'Unknown action: ' + action };
    }
  } catch (err) {
    result = { success: false, error: err.message };
  }

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// ──────────────────────────────────────────────────────────────────────────────
// Players
// ──────────────────────────────────────────────────────────────────────────────
function getPlayers() {
  const sheet = getSpreadsheet().getSheetByName('Players');
  if (!sheet) return { success: false, error: 'Players sheet not found. Run initSheets first.' };

  const [header, ...rows] = sheet.getDataRange().getValues();
  const data = rows
    .filter(r => r[0]) // skip empty rows
    .map(r => rowToObj(header, r));

  return { success: true, data };
}

function registerPlayer(params) {
  const sheet = getSpreadsheet().getSheetByName('Players');
  const id    = 'p' + Date.now();
  const ts    = new Date().toISOString();

  sheet.appendRow([
    id,
    params.firstName    || '',
    params.lastName     || '',
    params.team         || '',
    params.gender       || '',
    params.isCaptain === 'true' ? 'TRUE' : 'FALSE',
    params.headshotUrl  || '',
    params.phone        || '',
    params.email        || '',
    ts,
    params.partnerId    || '',
  ]);

  return { success: true, id };
}

// ──────────────────────────────────────────────────────────────────────────────
// Matches / Schedule
// ──────────────────────────────────────────────────────────────────────────────
function getMatches() {
  const sheet = getSpreadsheet().getSheetByName('Schedule');
  if (!sheet) return { success: false, error: 'Schedule sheet not found. Run initSheets first.' };

  const [header, ...rows] = sheet.getDataRange().getValues();
  const data = rows
    .filter(r => r[0])
    .map(r => {
      const obj = rowToObj(header, r);
      obj.isMix = obj.isMix === 'TRUE' || obj.isMix === true;
      return obj;
    });

  return { success: true, data };
}

function updateScore(matchId, winner) {
  const sheet = getSpreadsheet().getSheetByName('Schedule');
  const data  = sheet.getDataRange().getValues();
  const header = data[0];
  const idCol  = header.indexOf('id');
  const winCol = header.indexOf('winner');

  for (let i = 1; i < data.length; i++) {
    if (data[i][idCol] === matchId) {
      sheet.getRange(i + 1, winCol + 1).setValue(winner || '');
      return { success: true };
    }
  }
  return { success: false, error: 'Match not found: ' + matchId };
}

// ──────────────────────────────────────────────────────────────────────────────
// Standings (computed from Schedule sheet)
// ──────────────────────────────────────────────────────────────────────────────
function getStandings() {
  const matches = getMatches();
  if (!matches.success) return matches;

  const wins = { A: 0, B: 0 };
  matches.data.forEach(m => { if (m.winner) wins[m.winner]++; });

  return { success: true, data: wins };
}

// ──────────────────────────────────────────────────────────────────────────────
// Sheet initialisation — run once from the Apps Script editor
// ──────────────────────────────────────────────────────────────────────────────
function initSheets() {
  const ss = getSpreadsheet();

  // Players sheet
  ensureSheet(ss, 'Players', [
    'id','firstName','lastName','team','gender',
    'isCaptain','headshotUrl','phone','email','timestamp','partnerId',
  ]);

  // Schedule sheet — pre-populate with the 16 matches from the tournament doc
  const scheduleSheet = ensureSheet(ss, 'Schedule', [
    'id','round','court','isMix',
    'teamAP1','teamAP2','teamBP1','teamBP2','winner',
  ]);

  // Only populate if the sheet is empty (beyond the header row)
  if (scheduleSheet.getLastRow() <= 1) {
    const matches = [
      // Round 1 — Men's Doubles
      ['m1',  1,'S','FALSE','','','','',''],
      ['m2',  1,'N','FALSE','','','','',''],
      // Round 2 — Men's Doubles
      ['m3',  2,'S','FALSE','','','','',''],
      ['m4',  2,'N','FALSE','','','','',''],
      // Round 3 — Men's Doubles
      ['m5',  3,'S','FALSE','','','','',''],
      ['m6',  3,'N','FALSE','','','','',''],
      // Round 4 — Mixed Doubles ★ both courts
      ['m7',  4,'S','TRUE', '','','','',''],
      ['m8',  4,'N','TRUE', '','','','',''],
      // Round 5 — Mixed South ★, Men's North
      ['m9',  5,'S','TRUE', '','','','',''],
      ['m10', 5,'N','FALSE','','','','',''],
      // Round 6 — Men's Doubles
      ['m11', 6,'S','FALSE','','','','',''],
      ['m12', 6,'N','FALSE','','','','',''],
      // Round 7 — Mixed Doubles ★ both courts
      ['m13', 7,'S','TRUE', '','','','',''],
      ['m14', 7,'N','TRUE', '','','','',''],
      // Round 8 — Men's Doubles
      ['m15', 8,'S','FALSE','','','','',''],
      ['m16', 8,'N','FALSE','','','','',''],
      // Round 9 — Mixed Doubles ★ both courts
      ['m17', 9,'S','TRUE', '','','','',''],
      ['m18', 9,'N','TRUE', '','','','',''],
    ];
    scheduleSheet.getRange(2, 1, matches.length, matches[0].length).setValues(matches);
  }

  return { success: true, message: 'Sheets initialised.' };
}

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────
function ensureSheet(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length)
      .setFontWeight('bold')
      .setBackground('#1d4f35')
      .setFontColor('#ffffff');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function rowToObj(headers, row) {
  return headers.reduce((obj, key, i) => {
    obj[key] = row[i];
    return obj;
  }, {});
}
