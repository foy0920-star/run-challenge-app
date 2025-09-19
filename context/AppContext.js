import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { sheetService } from '../services/sheetService.js';
import { uploadImage } from '../services/storageService.js';
import { resizeImage } from '../utils.js';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isConfigured, setIsConfigured] = useState(true); // Assume configured unless initial load fails

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const db = await sheetService.getDatabase();
      setUsers(db.users || []);
      setRecords(db.records || []);
      setIsConfigured(true);
    } catch (err) {
      console.error("Failed to load data:", err);
      // Any failure on initial load is a configuration error
      setIsConfigured(false);
      setError('데이터를 불러오는 데 실패했습니다. 서버 설정을 확인해주세요.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addUser = useCallback(async (name, photoFile) => {
    const tempId = uuidv4();
    let tempPhotoUrl = 'https://images.unsplash.com/photo-1593085512500-5d55148d6f0d?q=80&w=1780&auto=format&fit=crop'; // Default Minion
    
    try {
      if (photoFile) {
        tempPhotoUrl = await resizeImage(photoFile, 200, 200);
      }
    } catch (e) {
      console.error("Error creating temporary photo URL:", e);
      setError("사진 미리보기를 생성하는 데 실패했습니다.");
      return false;
    }
    
    const newUser = { id: tempId, name, photoUrl: tempPhotoUrl };
    
    // Optimistic UI update
    setUsers(currentUsers => [...currentUsers, newUser]);

    try {
      let finalPhotoUrl = 'https://images.unsplash.com/photo-1593085512500-5d55148d6f0d?q=80&w=1780&auto=format&fit=crop';
      if (photoFile) {
        finalPhotoUrl = await uploadImage(photoFile);
      }

      const finalUser = { ...newUser, photoUrl: finalPhotoUrl };
      
      // Send only the new user to the backend
      await sheetService.addUser(finalUser);
      
      // Update local state with the final user
      setUsers(currentUsers => currentUsers.map(u => u.id === tempId ? finalUser : u));
      return true;

    } catch (err) {
      console.error("Failed to add user:", err);
      setError(`사용자 등록에 실패했습니다: ${err.message}`);
      // Revert optimistic update
      setUsers(currentUsers => currentUsers.filter(u => u.id !== tempId));
      return false;
    }
  }, []);

 const addRecord = useCallback(async (userId, distance, recordPhotoFiles, togetherPhotoFiles) => {
    const tempId = uuidv4();
    
    // Create temporary preview URLs for optimistic UI
    const tempRecordPreviews = await Promise.all(recordPhotoFiles.map(file => resizeImage(file, 200, 200)));
    const tempTogetherPreviews = await Promise.all(togetherPhotoFiles.map(file => resizeImage(file, 200, 200)));
    
    const newRecord = {
        id: tempId,
        userId,
        distance,
        date: new Date().toISOString(),
        ranWithOthers: togetherPhotoFiles.length > 0,
        recordPhotoUrls: tempRecordPreviews,
        togetherPhotoUrls: tempTogetherPreviews,
    };
    
    // Optimistic UI update
    setRecords(prev => [...prev, newRecord]);

    try {
      // Upload images to get final URLs
      const recordPhotoUrls = await Promise.all(recordPhotoFiles.map(uploadImage));
      const togetherPhotoUrls = await Promise.all(togetherPhotoFiles.map(uploadImage));

      // Create the final record object with permanent URLs
      const finalRecord = {
          ...newRecord,
          recordPhotoUrls,
          togetherPhotoUrls,
      };

      // Send only the new record to the backend
      await sheetService.addRecord(finalRecord);
      
      // Update local state with the final record
      setRecords(prev => prev.map(r => r.id === tempId ? finalRecord : r));
      return true;
      
    } catch (err) {
      console.error("Failed to add record:", err);
      setError(`기록 제출에 실패했습니다: ${err.message}`);
      // Revert optimistic update
      setRecords(prev => prev.filter(r => r.id !== tempId));
      return false;
    }
  }, []);


  const value = {
    users,
    records,
    isLoading,
    error,
    addUser,
    addRecord,
    loadData,
    isConfigured
  };

  return React.createElement(AppContext.Provider, { value: value }, children);
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};