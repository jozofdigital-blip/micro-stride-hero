export type HabitCategory = 'health' | 'fitness' | 'sleep' | 'mindfulness' | 'learning';

export interface MicroStep {
  day: number;
  title: string;
  description: string;
  completed: boolean;
}

export interface Habit {
  id: string;
  category: HabitCategory;
  title: string;
  icon: string;
  gradient: string;
  currentDay: number;
  streak: number;
  microSteps: MicroStep[];
  startDate: Date;
  isActive: boolean;
}

export interface HabitGoal {
  category: HabitCategory;
  title: string;
  subtitle: string;
  icon: string;
  gradient: string;
  totalDays: number;
}
