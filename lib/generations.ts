import { useState, useEffect } from 'react';

const DAILY_LIMIT = 10;
const STORAGE_KEY = 'virtualMentorGenerations';

interface GenerationData {
  count: number;
  lastResetDate: string;
}

export function useGenerations() {
  const [generationsLeft, setGenerationsLeft] = useState(DAILY_LIMIT);

  useEffect(() => {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
      const data: GenerationData = JSON.parse(storedData);
      const today = new Date().toDateString();
      
      if (data.lastResetDate !== today) {
        // Reset generations if it's a new day
        saveGenerationData(DAILY_LIMIT);
      } else {
        setGenerationsLeft(data.count);
      }
    } else {
      saveGenerationData(DAILY_LIMIT);
    }
  }, []);

  const saveGenerationData = (count: number) => {
    const data: GenerationData = {
      count,
      lastResetDate: new Date().toDateString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setGenerationsLeft(count);
  };

  const useGeneration = () => {
    if (generationsLeft > 0) {
      saveGenerationData(generationsLeft - 1);
      return true;
    }
    return false;
  };

  const addGenerations = (amount: number) => {
    saveGenerationData(generationsLeft + amount);
  };

  return { generationsLeft, useGeneration, addGenerations };
}