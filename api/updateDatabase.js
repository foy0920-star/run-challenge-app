// api/appendToSheet.js (repurposed from updateDatabase.js)
const { google } = require('googleapis');

// Helper to create a standardized response
const createResponse = (statusCode, body) => ({
  statusCode,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(body),
});

// Helper to authenticate with Google Sheets
const getGoogleSheetsClient = () => {
  const { GOOGLE_SHEETS_CREDENTIALS } = process.env;
  if (!GOOGLE_SHEETS_CREDENTIALS) {
    throw new Error('Missing GOOGLE_SHEETS_CREDENTIALS environment variable');
  }
  const credentials = JSON.parse(GOOGLE_SHEETS_CREDENTIALS);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return auth.getClient();
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return createResponse(204, {});
  if (event.httpMethod !== 'POST') return createResponse(405, { error: 'Method Not Allowed' });

  const { SPREADSHEET_ID } = process.env;
  if (!SPREADSHEET_ID) {
    return createResponse(500, { error: 'Server configuration error: Missing SPREADSHEET_ID.' });
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch (error) {
    return createResponse(400, { error: 'Invalid JSON body' });
  }
  
  const { type, data } = body;
  if (!type || !data || (type !== 'user' && type !== 'record')) {
      return createResponse(400, { error: 'Invalid request body: "type" and "data" are required.' });
  }
  
  const sheetName = type === 'user' ? 'Users' : 'Records';
  
  let values;
  if (type === 'user') {
      // Order must match the sheet columns: id, name, photoUrl
      values = [[data.id, data.name, data.photoUrl]];
  } else { // record
      // Order must match the sheet columns: id, userId, distance, date, ranWithOthers, recordPhotoUrls, togetherPhotoUrls
      values = [[
          data.id,
          data.userId,
          data.distance,
          data.date,
          data.ranWithOthers,
          JSON.stringify(data.recordPhotoUrls),
          JSON.stringify(data.togetherPhotoUrls)
      ]];
  }

  try {
    const authClient = await getGoogleSheetsClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient });

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!A:A`,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values,
      },
    });

    return createResponse(200, { success: true, added: data });

  } catch (error) {
    console.error('Google Sheets API Error:', error);
    return createResponse(500, { error: 'Failed to append data to Google Sheets.', details: error.message });
  }
};