const { put } = require('@vercel/blob');

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

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return createResponse(204, {});
  }
  if (event.httpMethod !== 'GET') {
    return createResponse(405, { error: 'Method Not Allowed' });
  }
  
  const filename = event.queryStringParameters.filename;
  if (!filename) {
    return createResponse(400, { error: 'Missing filename query parameter' });
  }

  try {
    const blob = await put(filename, '', {
      access: 'public',
      contentType: event.queryStringParameters.contentType,
      addRandomSuffix: true,
    });
    return createResponse(200, { url: blob.url, downloadUrl: blob.downloadUrl });
  } catch (error) {
    console.error('Error creating blob upload URL:', error);
    return createResponse(500, { error: 'Failed to create upload URL.', details: error.message });
  }
};