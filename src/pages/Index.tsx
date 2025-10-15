import { useState } from 'react';
import { motion } from 'framer-motion';
import { HabitGoalCard } from '@/components/HabitGoalCard';
import { habitGoals, microStepsByCategory } from '@/data/habitGoals';
import { Habit, HabitCategory } from '@/types/habit';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Dashboard from './Dashboard';

const Index = () => {
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);

  const handleGoalSelect = (category: HabitCategory) => {
    const goal = habitGoals.find(g => g.category === category);
    if (!goal) return;

    const newHabit: Habit = {
      id: Date.now().toString(),
      category,
      title: goal.title,
      icon: goal.icon,
      gradient: goal.gradient,
      currentDay: 1,
      streak: 0,
      microSteps: microStepsByCategory[category] || [],
      startDate: new Date(),
      isActive: true,
    };

    setSelectedHabit(newHabit);
  };

  if (selectedHabit) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          <Button
            variant="ghost"
            onClick={() => setSelectedHabit(null)}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Вернуться к выбору цели
          </Button>
          <Dashboard habit={selectedHabit} onUpdateHabit={setSelectedHabit} />
        </div>
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
            <HabitGoalCard
              key={goal.category}
              goal={goal}
              onClick={() => handleGoalSelect(goal.category)}
              index={index}
            />
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
