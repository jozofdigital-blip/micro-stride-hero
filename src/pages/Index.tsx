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

  useEffect(() => {
    const savedHabit = loadHabit();
    if (savedHabit) {
      setSelectedHabit(savedHabit);
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
  };

  const handleUpdateHabit = (updatedHabit: Habit) => {
    saveHabit(updatedHabit);
    setSelectedHabit(updatedHabit);
  };

  const handleResetHabit = () => {
    clearHabit();
    setSelectedHabit(null);
    toast({
      title: "🔄 Прогресс сброшен",
      description: "Начните новое путешествие!",
    });
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-foreground mb-4">
            MyFocus
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Выбери одну привычку и следуй микрошагам к большой цели. 
            <br />
            <span className="text-primary font-semibold">1% лучше каждый день</span>
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mb-8 text-center"
        >
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            Выбери свою цель
          </h2>
          <p className="text-muted-foreground">
            Фокус на одной привычке — залог успеха
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {habitGoals.map((goal, index) => (
            <div key={goal.category} className="relative">
              <HabitGoalCard
                goal={goal}
                onClick={() => handleGoalSelect(goal.category)}
                index={index}
              />
              {goal.isLocked && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Заблокировано</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-center mt-16 max-w-3xl mx-auto"
        >
          <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Почему только одна привычка?
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Исследования показывают: чем меньше целей, тем выше шанс успеха. 
              Каждая привычка разбита на микрошаги — крошечные действия, 
              которые легко выполнить. Каждый шаг приносит награду. 
              Так формируется настоящая привычка.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
