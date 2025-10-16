import { Habit } from '@/types/habit';

const STORAGE_KEY = 'myFocusHabit';

export const saveHabit = (habit: Habit): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(habit));
  } catch (error) {
    console.error('Failed to save habit:', error);
  }
};

export const loadHabit = (): Habit | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    const habit = JSON.parse(stored);
    // Convert date string back to Date object
    if (habit.startDate) {
      habit.startDate = new Date(habit.startDate);
    }
    return habit;
  } catch (error) {
    console.error('Failed to load habit:', error);
    return null;
  }
};

export const clearHabit = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear habit:', error);
  }
};
