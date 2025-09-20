import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Participant, RunRecord } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface ParticipantsContextType {
  participants: Participant[];
  addParticipant: (name: string, photo: string) => void;
  addRun: (participantId: string, distance: number, photo: string, togetherPhoto?: string) => void;
  getParticipantById: (id: string) => Participant | undefined;
  updateRun: (participantId: string, runId: string, updatedData: Partial<Omit<RunRecord, 'id' | 'date'>>) => void;
  deleteRun: (participantId: string, runId: string) => void;
  deleteParticipant: (participantId: string) => void;
}

const ParticipantsContext = createContext<ParticipantsContextType | undefined>(undefined);

const STORAGE_KEY = 'son-goku-run-challenge-data';

export const ParticipantsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [participants, setParticipants] = useState<Participant[]>(() => {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      return storedData ? JSON.parse(storedData) : [];
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(participants));
    } catch (error) {
      console.error("Failed to save data to localStorage", error);
    }
  }, [participants]);

  const addParticipant = (name: string, photo: string) => {
    const newParticipant: Participant = {
      id: uuidv4(),
      name,
      photo,
      runs: [],
    };
    setParticipants(prev => [...prev, newParticipant]);
  };

  const addRun = (participantId: string, distance: number, photo: string, togetherPhoto?: string) => {
    const newRun: RunRecord = {
      id: uuidv4(),
      distance,
      photo,
      togetherPhoto: togetherPhoto || '',
      date: new Date().toISOString(),
    };
    setParticipants(prev =>
      prev.map(p =>
        p.id === participantId
          ? { ...p, runs: [...p.runs, newRun].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) }
          : p
      )
    );
  };

  const updateRun = (participantId: string, runId: string, updatedData: Partial<Omit<RunRecord, 'id' | 'date'>>) => {
    setParticipants(prev => prev.map(p => {
      if (p.id === participantId) {
        const updatedRuns = p.runs.map(run => 
          run.id === runId ? { ...run, ...updatedData } : run
        );
        return { ...p, runs: updatedRuns };
      }
      return p;
    }));
  };

  const deleteRun = (participantId: string, runId: string) => {
     if (window.confirm('정말로 이 기록을 삭제하시겠습니까?')) {
        setParticipants(prev => prev.map(p => {
            if (p.id === participantId) {
                const updatedRuns = p.runs.filter(run => run.id !== runId);
                return { ...p, runs: updatedRuns };
            }
            return p;
        }));
     }
  };

  const deleteParticipant = (participantId: string) => {
    if (window.confirm('정말로 이 참가자를 삭제하시겠습니까? 모든 관련 기록이 영구적으로 삭제됩니다.')) {
        setParticipants(prev => prev.filter(p => p.id !== participantId));
    }
  };

  const getParticipantById = (id: string) => {
    return participants.find(p => p.id === id);
  };

  return (
    <ParticipantsContext.Provider value={{ participants, addParticipant, addRun, getParticipantById, updateRun, deleteRun, deleteParticipant }}>
      {children}
    </ParticipantsContext.Provider>
  );
};

export const useParticipants = () => {
  const context = useContext(ParticipantsContext);
  if (context === undefined) {
    throw new Error('useParticipants must be used within a ParticipantsProvider');
  }
  return context;
};