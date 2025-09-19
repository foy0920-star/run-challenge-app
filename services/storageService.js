// services/storageService.js
const API_UPLOAD_URL = '/api/uploadImage';

export const uploadImage = async (file) => {
  if (!file) {
    throw new Error('No file provided to upload.');
  }

  try {
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

    const uploadResponse = await fetch(url, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type },
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(`File upload failed: ${uploadResponse.statusText}. Details: ${errorText}`);
    }

    await uploadResponse.text();

    return downloadUrl;
    
  } catch (error) {
    console.error('Image upload process failed:', error);
    throw error;
  }
};