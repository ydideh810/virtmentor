import { openDB } from 'idb';

const dbName = 'VirtualMentorDB';
const dbVersion = 2; // Increment version to trigger upgrade

let dbPromise: Promise<any> | null = null;

const initDB = async () => {
  if (!dbPromise) {
    dbPromise = openDB(dbName, dbVersion, {
      upgrade(db) {
        // Create stores if they don't exist
        if (!db.objectStoreNames.contains('learningPaths')) {
          db.createObjectStore('learningPaths', { keyPath: 'skill' });
        }
        if (!db.objectStoreNames.contains('weeklyGoals')) {
          db.createObjectStore('weeklyGoals', { keyPath: 'skill' });
        }
        if (!db.objectStoreNames.contains('monthlyGoals')) {
          db.createObjectStore('monthlyGoals', { keyPath: 'skill' });
        }
        if (!db.objectStoreNames.contains('yearlyGoals')) {
          db.createObjectStore('yearlyGoals', { keyPath: 'skill' });
        }
      },
      blocked() {
        console.warn('Database upgrade blocked. Please close other tabs/windows.');
      },
      blocking() {
        dbPromise = null;
      },
      terminated() {
        dbPromise = null;
      },
    });
  }
  return dbPromise;
};

export async function saveLearningPath(skill: string, path: string) {
  try {
    const db = await initDB();
    await db.put('learningPaths', { skill, path, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Error saving learning path:', error);
    throw new Error('Failed to save learning path. Please try again.');
  }
}

export async function saveWeeklyGoals(skill: string, goals: string) {
  try {
    const db = await initDB();
    await db.put('weeklyGoals', { skill, goals, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Error saving weekly goals:', error);
    throw new Error('Failed to save weekly goals. Please try again.');
  }
}

export async function saveMonthlyGoals(skill: string, goals: string) {
  try {
    const db = await initDB();
    await db.put('monthlyGoals', { skill, goals, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Error saving monthly goals:', error);
    throw new Error('Failed to save monthly goals. Please try again.');
  }
}

export async function saveYearlyGoals(skill: string, goals: string) {
  try {
    const db = await initDB();
    await db.put('yearlyGoals', { skill, goals, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Error saving yearly goals:', error);
    throw new Error('Failed to save yearly goals. Please try again.');
  }
}

export async function getLearningPath(skill: string): Promise<string | undefined> {
  try {
    const db = await initDB();
    const result = await db.get('learningPaths', skill);
    return result?.path;
  } catch (error) {
    console.error('Error retrieving learning path:', error);
    throw new Error('Failed to retrieve learning path. Please try again.');
  }
}

export async function getWeeklyGoals(skill: string): Promise<string | undefined> {
  try {
    const db = await initDB();
    const result = await db.get('weeklyGoals', skill);
    return result?.goals;
  } catch (error) {
    console.error('Error retrieving weekly goals:', error);
    throw new Error('Failed to retrieve weekly goals. Please try again.');
  }
}

export async function getMonthlyGoals(skill: string): Promise<string | undefined> {
  try {
    const db = await initDB();
    const result = await db.get('monthlyGoals', skill);
    return result?.goals;
  } catch (error) {
    console.error('Error retrieving monthly goals:', error);
    throw new Error('Failed to retrieve monthly goals. Please try again.');
  }
}

export async function getYearlyGoals(skill: string): Promise<string | undefined> {
  try {
    const db = await initDB();
    const result = await db.get('yearlyGoals', skill);
    return result?.goals;
  } catch (error) {
    console.error('Error retrieving yearly goals:', error);
    throw new Error('Failed to retrieve yearly goals. Please try again.');
  }
}