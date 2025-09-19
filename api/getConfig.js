// api/getDatabase.js (repurposed from getConfig.js)
const { google } = require('googleapis');

// Helper to create a standardized response
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

// Helper to convert sheet data (array of arrays) to array of objects
const sheetDataToObjects = (data) => {
  if (!data || data.length < 2) return [];
  const headers = data[0];
  const rows = data.slice(1);
  return rows.map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  });
};

exports.handler = async () => {
  const { SPREADSHEET_ID } = process.env;
  if (!SPREADSHEET_ID) {
    return createResponse(500, { error: 'Server configuration error: Missing SPREADSHEET_ID.' });
  }

  try {
    const authClient = await getGoogleSheetsClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient });

    const ranges = ['Users!A:Z', 'Records!A:Z'];
    const response = await sheets.spreadsheets.values.batchGet({
      spreadsheetId: SPREADSHEET_ID,
      ranges,
    });

    const valueRanges = response.data.valueRanges || [];
    const usersData = valueRanges.length > 0 ? valueRanges[0].values : [];
    const recordsData = valueRanges.length > 1 ? valueRanges[1].values : [];

    const users = sheetDataToObjects(usersData);
    const records = sheetDataToObjects(recordsData);

    // Data type conversion for records
    records.forEach(r => {
      r.distance = parseFloat(r.distance) || 0;
      r.ranWithOthers = r.ranWithOthers === 'TRUE';
      r.recordPhotoUrls = r.recordPhotoUrls ? JSON.parse(r.recordPhotoUrls) : [];
      r.togetherPhotoUrls = r.togetherPhotoUrls ? JSON.parse(r.togetherPhotoUrls) : [];
    });

    return createResponse(200, { users, records });

  } catch (error) {
    console.error('Google Sheets API Error:', error);
    return createResponse(500, { error: 'Failed to fetch data from Google Sheets.', details: error.message });
  }
};