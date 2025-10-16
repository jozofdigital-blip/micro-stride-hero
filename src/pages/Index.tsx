import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HabitGoalCard } from '@/components/HabitGoalCard';
import { Dashboard } from './Dashboard';
import { habitGoals, microStepsByCategory } from '@/data/habitGoals';
import { Habit, HabitCategory } from '@/types/habit';
import { ArrowLeft, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { loadHabit, saveHabit, clearHabit } from '@/utils/habitStorage';
import { toast } from '@/components/ui/use-toast';

const Index = () => {
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [savedHabit, setSavedHabit] = useState<Habit | null>(null);

  useEffect(() => {
    const storedHabit = loadHabit();
    if (storedHabit) {
      setSavedHabit(storedHabit);
    }
  }, []);

  const handleGoalSelect = (category: HabitCategory) => {
    const goal = habitGoals.find(g => g.category === category);
    if (goal?.isLocked) {
      toast({
        title: "🔒 Привычка заблокирована",
        description: "Завершите первую привычку, чтобы разблокировать остальные!",
        variant: "destructive",
      });
      return;
    }
    
    if (!goal) return;

    const microSteps = microStepsByCategory[category] || [];
    const newHabit: Habit = {
      id: `habit-${Date.now()}`,
      category,
      title: goal.title,
      icon: goal.icon,
      gradient: goal.gradient,
      currentDay: 1,
      streak: 0,
      microSteps: [...microSteps],
      startDate: new Date(),
      isActive: true,
    };
    
    saveHabit(newHabit);
    setSelectedHabit(newHabit);
    setSavedHabit(newHabit);
  };

  const handleUpdateHabit = (updatedHabit: Habit) => {
    saveHabit(updatedHabit);
    setSelectedHabit(updatedHabit);
    setSavedHabit(updatedHabit);
  };

  const handleResetHabit = () => {
    clearHabit();
    setSelectedHabit(null);
    setSavedHabit(null);
    toast({
      title: "🔄 Прогресс сброшен",
      description: "Начните новое путешествие!",
    });
  };

  const handleContinueHabit = () => {
    if (savedHabit) {
      setSelectedHabit(savedHabit);
    }
  };

  if (selectedHabit) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="flex gap-4 mb-6">
          <Button
            variant="ghost"
            onClick={() => setSelectedHabit(null)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад к выбору целей
          </Button>
          <Button
            variant="destructive"
            onClick={handleResetHabit}
          >
            Сбросить прогресс
          </Button>
        </div>
        <Dashboard 
          habit={selectedHabit} 
          onUpdateHabit={handleUpdateHabit}
        />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-background">
      <div className="mx-auto flex w-full max-w-md flex-col gap-8 px-4 py-6 sm:max-w-3xl sm:py-10">
        {savedHabit && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="rounded-2xl border border-primary/20 bg-card/80 px-4 py-3 shadow-sm backdrop-blur sm:flex sm:items-center sm:justify-between"
          >
            <div className="text-sm text-muted-foreground">
              <p className="font-semibold text-foreground">{savedHabit.icon} {savedHabit.title}</p>
              <p className="text-xs opacity-80">Продолжите с того же места</p>
            </div>
            <Button size="sm" className="mt-3 w-full sm:mt-0 sm:w-auto" onClick={handleContinueHabit}>
              Продолжить
            </Button>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-3"
        >
          <h1 className="text-4xl font-bold text-foreground sm:text-5xl">
            MyFocus
          </h1>
          <p className="mx-auto max-w-sm text-base text-muted-foreground sm:max-w-2xl sm:text-xl">
            Выбери одну привычку и следуй микрошагам к большой цели.
            <br />
            <span className="text-primary font-semibold">1% лучше каждый день</span>
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-xl font-semibold text-foreground sm:text-2xl">
            Выбери свою цель
          </h2>
          <p className="text-sm text-muted-foreground sm:text-base">
            Фокус на одной привычке — залог успеха
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {habitGoals.map((goal, index) => (
            <div key={goal.category} className="relative">
              <HabitGoalCard
                goal={goal}
                onClick={() => handleGoalSelect(goal.category)}
                index={index}
                isLocked={goal.isLocked}
              />
              {goal.isLocked && (
                <>
                  <div className="pointer-events-none absolute inset-0 rounded-lg bg-background/75 backdrop-blur-sm" />
                  <div className="pointer-events-none absolute inset-0 rounded-lg">
                    <div className="absolute right-3 top-3 flex items-center gap-2 rounded-full bg-background/95 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
                      <Lock className="h-4 w-4" />
                      <span>Заблокировано</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="rounded-3xl bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 p-6 text-center sm:p-8"
        >
          <h3 className="text-lg font-semibold text-foreground sm:text-2xl">
            Почему только одна привычка?
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Микрошаги помогают встроить новые действия в повседневность. Сфокусируйтесь на одной цели, выполняйте небольшие шаги и фиксируйте прогресс каждый день.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
