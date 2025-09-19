// services/storageService.js
const API_UPLOAD_URL = '/api/uploadImage';

export const uploadImage = async (file) => {
  if (!file) {
    throw new Error('No file provided to upload.');
  }

  try {
    // 1. Get a secure signed URL from our backend serverless function
    const params = new URLSearchParams({
      filename: file.name,
      contentType: file.type,
    });
    
    const response = await fetch(`${API_UPLOAD_URL}?${params.toString()}`);
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to get upload URL: ${errorData.error || response.statusText}`);
    }
    
    const { url, downloadUrl } = await response.json();

    // 2. Upload the file directly to the blob storage provider using the signed URL
    const uploadResponse = await fetch(url, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(`File upload failed with status: ${uploadResponse.statusText}. Details: ${errorText}`);
    }

    // CRITICAL FIX: Always consume the response body, even on success, to prevent stream-related errors.
    // The body from the PUT request is likely empty, but not consuming it can leave the underlying HTTP connection in a bad state.
    await uploadResponse.text();

    // 3. Return the permanent, public URL of the uploaded file
    return downloadUrl;
    
  } catch (error) {
    console.error('Image upload process failed:', error);
    throw error; // Re-throw the error to be caught by the calling function
  }
};