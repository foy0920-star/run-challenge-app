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
  const [isConfigured, setIsConfigured] = useState(true);

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
    let tempPhotoUrl = 'https://images.unsplash.com/photo-1593085512500-5d55148d6f0d?q=80&w=1780&auto=format&fit=crop';
    
    if (photoFile) {
        try {
            tempPhotoUrl = await resizeImage(photoFile, 200, 200);
        } catch (e) {
            console.error("Error creating temporary photo URL:", e);
            setError("사진 미리보기를 생성하는 데 실패했습니다.");
            return false;
        }
    }
    
    const newUser = { id: tempId, name, photoUrl: tempPhotoUrl };
    setUsers(currentUsers => [...currentUsers, newUser]);

    try {
      let finalPhotoUrl = 'https://images.unsplash.com/photo-1593085512500-5d55148d6f0d?q=80&w=1780&auto=format&fit=crop';
      if (photoFile) {
        finalPhotoUrl = await uploadImage(photoFile);
      }

      const finalUser = { ...newUser, photoUrl: finalPhotoUrl };
      await sheetService.addUser(finalUser);
      setUsers(currentUsers => currentUsers.map(u => u.id === tempId ? finalUser : u));
      return true;

    } catch (err) {
      console.error("Failed to add user:", err);
      setError(`사용자 등록에 실패했습니다: ${err.message}`);
      setUsers(currentUsers => currentUsers.filter(u => u.id !== tempId));
      return false;
    }
  }, []);

 const addRecord = useCallback(async (userId, distance, recordPhotoFiles) => {
    const tempId = uuidv4();
    const tempRecordPreviews = await Promise.all(recordPhotoFiles.map(file => resizeImage(file, 400, 400)));
    
    const newRecord = {
        id: tempId,
        userId,
        distance,
        date: new Date().toISOString(),
        recordPhotoUrls: tempRecordPreviews,
    };
    
    setRecords(prev => [...prev, newRecord]);

    try {
      const recordPhotoUrls = await Promise.all(recordPhotoFiles.map(uploadImage));
      const finalRecord = { ...newRecord, recordPhotoUrls };
      await sheetService.addRecord(finalRecord);
      setRecords(prev => prev.map(r => r.id === tempId ? finalRecord : r));
      return true;
      
    } catch (err) {
      console.error("Failed to add record:", err);
      setError(`기록 제출에 실패했습니다: ${err.message}`);
      setRecords(prev => prev.filter(r => r.id !== tempId));
      return false;
    }
  }, []);

  const value = { users, records, isLoading, error, isConfigured, addUser, addRecord, loadData };

  return React.createElement(AppContext.Provider, { value: value }, children);
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};