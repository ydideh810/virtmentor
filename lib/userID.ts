// lib/userId.ts
import { v4 as uuidv4 } from 'uuid'; // Use uuid library to generate unique IDs

export function getOrCreateUserId(): string {
  const storedUserId = localStorage.getItem('userId');
  if (storedUserId) {
    return storedUserId;
  } else {
    const newUserId = uuidv4();
    localStorage.setItem('userId', newUserId);
    return newUserId;
  }
}
