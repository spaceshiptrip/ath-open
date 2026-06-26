// ATH Open Pickleball Tournament — Google Apps Script Backend
// Deploy as Web App: Execute as "Me", Access "Anyone"
// Paste the Web App URL into VITE_SHEETS_API_URL in your .env file (or GitHub secret)
//
// Schedule sheet columns:
//   A=id  B=round  C=court  D=isMix
//   E=teamAP1  F=teamAP2  G=teamBP1  H=teamBP2
//   I=winner  J=scoreA  K=scoreB

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
      case 'updatePlayer':
        result = updatePlayer(e.parameter);
        break;
      case 'updateScore':
        result = updateScore(
          e.parameter.matchId,
          e.parameter.winner,
          e.parameter.scoreA,
          e.parameter.scoreB
        );
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
    .filter(r => r[0])
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
      obj.isMix  = obj.isMix === 'TRUE' || obj.isMix === true;
      obj.round  = Number(obj.round);
      obj.scoreA = obj.scoreA === '' || obj.scoreA === null ? '' : String(obj.scoreA);
      obj.scoreB = obj.scoreB === '' || obj.scoreB === null ? '' : String(obj.scoreB);
      return obj;
    });

  return { success: true, data };
}

// Updates firstName, lastName, and/or headshotUrl for a player by id.
function updatePlayer(params) {
  const sheet = getSpreadsheet().getSheetByName('Players');
  if (!sheet) return { success: false, error: 'Players sheet not found.' };
  const data   = sheet.getDataRange().getValues();
  const header = data[0];
  const idCol  = header.indexOf('id');

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idCol]) === String(params.id)) {
      ['firstName', 'lastName', 'headshotUrl'].forEach(field => {
        const col = header.indexOf(field);
        if (col >= 0 && params[field] !== undefined) {
          sheet.getRange(i + 1, col + 1).setValue(params[field]);
        }
      });
      return { success: true };
    }
  }
  return { success: false, error: 'Player not found: ' + params.id };
}

// Updates winner and (optionally) scoreA / scoreB for a match.
// scoreA and scoreB can be empty strings to clear or omitted to leave unchanged.
function updateScore(matchId, winner, scoreA, scoreB) {
  const sheet  = getSpreadsheet().getSheetByName('Schedule');
  const data   = sheet.getDataRange().getValues();
  const header = data[0];
  const idCol     = header.indexOf('id');
  const winCol    = header.indexOf('winner');
  const scoreACol = header.indexOf('scoreA');
  const scoreBCol = header.indexOf('scoreB');

  for (let i = 1; i < data.length; i++) {
    if (data[i][idCol] === matchId) {
      sheet.getRange(i + 1, winCol + 1).setValue(winner || '');
      if (scoreACol >= 0 && scoreA !== undefined)
        sheet.getRange(i + 1, scoreACol + 1).setValue(scoreA);
      if (scoreBCol >= 0 && scoreB !== undefined)
        sheet.getRange(i + 1, scoreBCol + 1).setValue(scoreB);
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

  // Schedule sheet — pre-populate with all 18 matches
  // Columns: id, round, court, isMix, teamAP1, teamAP2, teamBP1, teamBP2, winner, scoreA, scoreB
  const scheduleSheet = ensureSheet(ss, 'Schedule', [
    'id','round','court','isMix',
    'teamAP1','teamAP2','teamBP1','teamBP2','winner','scoreA','scoreB',
  ]);

  if (scheduleSheet.getLastRow() <= 1) {
    const matches = [
      // Round 1 — 8:30 AM — Men's Doubles
      ['m1',  1,'S','FALSE','a4', 'a5', 'b6', 'b8', '','',''],
      ['m2',  1,'N','FALSE','a6', 'a7', 'b7', 'b11','','',''],
      // Round 2 — 8:50 AM — Men's Doubles
      ['m3',  2,'S','FALSE','a8', 'a9', 'b4', 'b12','','',''],
      ['m4',  2,'N','FALSE','a10','a11','b3', 'b5', '','',''],
      // Round 3 — 9:15 AM — Men's Doubles
      ['m5',  3,'S','FALSE','a7', 'a10','b8', 'b11','','',''],
      ['m6',  3,'N','FALSE','a6', 'a12','b2', 'b7', '','',''],
      // Round 4 — 9:40 AM — Mixed Doubles ★ both courts
      ['m7',  4,'S','TRUE', 'a4', 'a1', 'b12','b10','','',''],
      ['m8',  4,'N','TRUE', 'a5', 'a2', 'b3', 'b9', '','',''],
      // Round 5 — 10:10 AM — Mixed South ★, Men's North
      ['m9',  5,'S','TRUE', 'a5', 'a3', 'b6', 'b1', '','',''],
      ['m10', 5,'N','FALSE','a12','a9', 'b2', 'b8', '','',''],
      // Round 6 — 10:30 AM — Men's Doubles
      ['m11', 6,'S','FALSE','a11','a7', 'b4', 'b7', '','',''],
      ['m12', 6,'N','FALSE','a4', 'a8', 'b5', 'b11','','',''],
      // Round 7 — 11:00 AM — Mixed Doubles ★ both courts
      ['m13', 7,'S','TRUE', 'a12','a2', 'b2', 'b13','','',''],
      ['m14', 7,'N','TRUE', 'a8', 'a3', 'b12','b10','','',''],
      // Round 8 — 11:30 AM — Men's Doubles
      ['m15', 8,'S','FALSE','a10','a6', 'b4', 'b11','','',''],
      ['m16', 8,'N','FALSE','a11','a5', 'b5', 'b8', '','',''],
      // Round 9 — Mixed Doubles ★ both courts
      ['m17', 9,'S','TRUE', 'a9', 'a2', 'b6', 'b1', '','',''],
      ['m18', 9,'N','TRUE', 'a4', 'a3', 'b3', 'b9', '','',''],
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
    obj[key] = row[i] !== undefined ? row[i] : '';
    return obj;
  }, {});
}
