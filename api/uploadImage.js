// api/uploadImage.js
const { put } = require('@vercel/blob');

const createResponse = (statusCode, body) => {
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  };
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return createResponse(204, {});
  }
  if (event.httpMethod !== 'GET') {
    return createResponse(405, { error: 'Method Not Allowed' });
  }
  
  const filename = event.queryStringParameters.filename;
  const contentType = event.queryStringParameters.contentType;

  if (!filename) {
    return createResponse(400, { error: 'Missing filename query parameter' });
  }

  try {
    // The Vercel Blob SDK uses the BLOB_READ_WRITE_TOKEN from environment variables automatically
    const blob = await put(filename, '', {
      access: 'public',
      contentType: contentType,
      addRandomSuffix: true, // To prevent overwriting files with the same name
    });

    // The 'url' from the SDK is the one we can PUT to.
    // The 'downloadUrl' is the permanent public URL.
    return createResponse(200, { url: blob.url, downloadUrl: blob.downloadUrl });

  } catch (error) {
    console.error('Error creating blob upload URL:', error);
    return createResponse(500, { error: 'Failed to create upload URL.', details: error.message });
  }
};