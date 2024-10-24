import { openDB } from 'idb';
import { getOrCreateUserId } from './userID';  // Import the helper function

const dbName = 'VirtualMentorDB';
const dbVersion = 3; // Increment version to trigger upgrade

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
        // Update the 'credits' store to use 'userId' as the key
        if (!db.objectStoreNames.contains('credits')) {
          db.createObjectStore('credits', { keyPath: 'userId' });
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

// Save or update user credits using userId
export async function updateUserCreditsInIndexedDB(credits: number) {
  try {
    const db = await initDB();
    const userId = getOrCreateUserId();  // Get the unique userId
    const user = await db.get('credits', userId);

    if (user) {
      // Update credits if user exists
      const newCreditBalance = (user.credits || 0) + credits;
      await db.put('credits', { userId, credits: newCreditBalance, updatedAt: new Date().toISOString() });
    } else {
      // Create new user record with initial credits
      await db.put('credits', { userId, credits, updatedAt: new Date().toISOString() });
    }
  } catch (error) {
    console.error('Error updating user credits:', error);
    throw new Error('Failed to update user credits. Please try again.');
  }
}

// Get user credits using userId
export async function getUserCredits(): Promise<number | undefined> {
  try {
    const db = await initDB();
    const userId = getOrCreateUserId();  // Get the unique userId
    const user = await db.get('credits', userId);
    return user?.credits;
  } catch (error) {
    console.error('Error retrieving user credits:', error);
    throw new Error('Failed to retrieve user credits. Please try again.');
  }
}
