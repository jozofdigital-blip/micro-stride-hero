import { motion } from 'framer-motion';
import { Habit } from '@/types/habit';
import { Card } from '@/components/ui/card';
import { Sparkles, Target, TrendingUp } from 'lucide-react';

interface ProgressPathProps {
  habit: Habit;
}

export const ProgressPath = ({ habit }: ProgressPathProps) => {
  const progress = (habit.currentDay / habit.microSteps.length) * 100;
  const completedSteps = habit.microSteps.filter(s => s.completed).length;

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-none shadow-card">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{habit.icon}</div>
            <div>
              <h3 className="text-xl font-bold text-foreground">{habit.title}</h3>
              <p className="text-sm text-muted-foreground">
                День {habit.currentDay} из {habit.microSteps.length}
              </p>
            </div>
          </div>
          
          <motion.div
            className="flex items-center gap-2 bg-secondary/20 px-4 py-2 rounded-full"
            whileHover={{ scale: 1.05 }}
          >
            <Sparkles className="w-4 h-4 text-secondary" />
            <span className="font-bold text-secondary">{habit.streak} дней</span>
          </motion.div>
        </div>

        {/* Progress Bar */}
        <div className="relative h-3 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-secondary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
        
        <div className="flex justify-between mt-2 text-sm">
          <span className="text-muted-foreground">{completedSteps} выполнено</span>
          <span className="font-semibold text-primary">{Math.round(progress)}%</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-4 bg-card rounded-lg">
          <Target className="w-5 h-5 text-primary mx-auto mb-2" />
          <div className="text-2xl font-bold text-foreground">{habit.currentDay}</div>
          <div className="text-xs text-muted-foreground">Текущий день</div>
        </div>
        
        <div className="text-center p-4 bg-card rounded-lg">
          <Sparkles className="w-5 h-5 text-secondary mx-auto mb-2" />
          <div className="text-2xl font-bold text-foreground">{habit.streak}</div>
          <div className="text-xs text-muted-foreground">Серия</div>
        </div>
        
        <div className="text-center p-4 bg-card rounded-lg">
          <TrendingUp className="w-5 h-5 text-success mx-auto mb-2" />
          <div className="text-2xl font-bold text-foreground">{Math.round(progress)}%</div>
          <div className="text-xs text-muted-foreground">Прогресс</div>
        </div>
      </div>
    </Card>
  );
};
