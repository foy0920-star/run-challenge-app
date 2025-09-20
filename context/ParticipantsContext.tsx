import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Participant, RunRecord } from '../types';

interface ParticipantsContextType {
  participants: Participant[];
  addParticipant: (name: string, photo: string) => void;
  addRun: (participantId: string, distance: number, photo: string, togetherPhoto: string) => void;
  getParticipantById: (id: string) => Participant | undefined;
}

const ParticipantsContext = createContext<ParticipantsContextType | undefined>(undefined);

const STORAGE_KEY = 'son-goku-run-challenge-data';

export const ParticipantsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      if (storedData) {
        setParticipants(JSON.parse(storedData));
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(participants));
      } catch (error) {
        console.error("Failed to save data to localStorage", error);
      }
    }
  }, [participants, isLoaded]);

  const addParticipant = (name: string, photo: string) => {
    const newParticipant: Participant = {
      id: crypto.randomUUID(),
      name,
      photo,
      runs: [],
    };
    setParticipants(prev => [...prev, newParticipant]);
  };

  const addRun = (participantId: string, distance: number, photo: string, togetherPhoto: string) => {
    const newRun: RunRecord = {
      id: crypto.randomUUID(),
      distance,
      photo,
      togetherPhoto,
      date: new Date().toISOString(),
    };
    setParticipants(prev =>
      prev.map(p =>
        p.id === participantId
          ? { ...p, runs: [...p.runs, newRun] }
          : p
      )
    );
  };

  const getParticipantById = (id: string) => {
    return participants.find(p => p.id === id);
  };

  return (
    <ParticipantsContext.Provider value={{ participants, addParticipant, addRun, getParticipantById }}>
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
