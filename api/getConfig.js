const { google } = require('googleapis');

const createResponse = (statusCode, body) => ({
  statusCode,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(body),
});

const getGoogleSheetsClient = () => {
  const { GOOGLE_SHEETS_CREDENTIALS } = process.env;
  if (!GOOGLE_SHEETS_CREDENTIALS) throw new Error('Missing GOOGLE_SHEETS_CREDENTIALS');
  const credentials = JSON.parse(GOOGLE_SHEETS_CREDENTIALS);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  return auth.getClient();
};

const sheetDataToObjects = (data) => {
  if (!data || data.length < 2) return [];
  const headers = data[0];
  const rows = data.slice(1);
  return rows.map(row => headers.reduce((obj, header, index) => {
    obj[header] = row[index];
    return obj;
  }, {}));
};

exports.handler = async () => {
  const { SPREADSHEET_ID } = process.env;
  if (!SPREADSHEET_ID) {
    return createResponse(500, { error: 'Server configuration error: Missing SPREADSHEET_ID.' });
  }

  try {
    const authClient = await getGoogleSheetsClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient });

    const { data } = await sheets.spreadsheets.values.batchGet({
      spreadsheetId: SPREADSHEET_ID,
      ranges: ['Users!A:Z', 'Records!A:Z'],
    });

    const [usersData, recordsData] = (data.valueRanges || []).map(range => range.values);

    const users = sheetDataToObjects(usersData);
    const records = sheetDataToObjects(recordsData).map(r => ({
      ...r,
      distance: parseFloat(r.distance) || 0,
      recordPhotoUrls: r.recordPhotoUrls ? JSON.parse(r.recordPhotoUrls) : [],
    }));

    return createResponse(200, { users, records });

  } catch (error) {
    console.error('Google Sheets API Error:', error);
    return createResponse(500, { error: 'Failed to fetch data from Google Sheets.', details: error.message });
  }
};