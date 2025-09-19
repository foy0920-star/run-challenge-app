// services/sheetService.js

const API_GET_DB_URL = '/api/getConfig';
const API_UPDATE_DB_URL = '/api/updateDatabase';

const handleResponse = async (response) => {
    const text = await response.text();
    if (!response.ok) {
      let errorMsg = `API Error: Status ${response.status}`;
      try {
        const errorData = JSON.parse(text);
        errorMsg = `API Error: ${errorData.error || errorData.message || 'Unknown error'}`;
      } catch (e) {
        errorMsg = `${errorMsg}. Response: ${text}`;
      }
      throw new Error(errorMsg);
    }
    try {
        return text ? JSON.parse(text) : {};
    } catch (e) {
        console.error('Failed to parse successful JSON response:', text);
        throw new Error(`Failed to parse response from server: ${e.message}`);
    }
};

export const sheetService = {
  getDatabase: async () => {
    const response = await fetch(`${API_GET_DB_URL}?t=${new Date().getTime()}`);
    return handleResponse(response);
  },

  addUser: async (user) => {
    const response = await fetch(API_UPDATE_DB_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'user', data: user }),
    });
    return handleResponse(response);
  },

  addRecord: async (record) => {
    const response = await fetch(API_UPDATE_DB_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'record', data: record }),
    });
    return handleResponse(response);
  }
};