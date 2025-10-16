import { Habit } from '@/types/habit';
import { ProgressPath } from '@/components/ProgressPath';
import { MicroStepCard } from '@/components/MicroStepCard';
import { MotivationalQuote } from '@/components/MotivationalQuote';
import { toast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle, Lock } from 'lucide-react';

interface DashboardProps {
  habit: Habit;
  onUpdateHabit: (habit: Habit) => void;
}

export const Dashboard = ({ habit, onUpdateHabit }: DashboardProps) => {
  const getDaysSinceStart = () => {
    const today = new Date();
    const start = new Date(habit.startDate);
    const diffTime = Math.abs(today.getTime() - start.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1;
  };

  const isStepAvailable = (stepDay: number) => {
    const daysSinceStart = getDaysSinceStart();
    return stepDay <= daysSinceStart;
  };

  const handleToggleStep = (stepDay: number) => {
    if (!isStepAvailable(stepDay)) {
      toast({
        title: "⏳ Рано!",
        description: "Этот шаг станет доступен завтра. Сосредоточься на сегодняшнем!",
        variant: "destructive",
      });
      return;
    }

    const updatedMicroSteps = habit.microSteps.map(step => {
      if (step.day === stepDay) {
        const newCompleted = !step.completed;
        return { 
          ...step, 
          completed: newCompleted,
          completedDate: newCompleted ? new Date().toISOString() : undefined
        };
      }
      return step;
    });

    const completedSteps = updatedMicroSteps.filter(s => s.completed).length;
    const newStreak = completedSteps;
    const newCurrentDay = Math.min(completedSteps + 1, habit.microSteps.length);

    const updatedHabit: Habit = {
      ...habit,
      microSteps: updatedMicroSteps,
      currentDay: newCurrentDay,
      streak: newStreak,
    };

    onUpdateHabit(updatedHabit);

    if (!habit.microSteps.find(s => s.day === stepDay)?.completed) {
      toast({
        title: "🎉 Отлично!",
        description: "Ещё один шаг к новой привычке!",
      });
    }
  };

  const currentDayStep = habit.microSteps.find(s => s.day === habit.currentDay);
  const upcomingSteps = habit.microSteps.slice(habit.currentDay, habit.currentDay + 5);
  const completedSteps = habit.microSteps.filter(s => s.completed);
  const allCompleted = completedSteps.length === habit.microSteps.length;

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <ProgressPath habit={habit} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <MotivationalQuote />
      </motion.div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground mb-4">
          Микрошаги
        </h2>
        
        {/* Current Day Step */}
        {currentDayStep && !currentDayStep.completed && isStepAvailable(currentDayStep.day) && (
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-primary mb-3">
                Сегодняшнее задание:
              </h3>
              <MicroStepCard
                step={currentDayStep}
                onToggle={() => handleToggleStep(currentDayStep.day)}
              />
            </div>
          </motion.div>
        )}

        {/* Completed Today Message */}
        {currentDayStep?.completed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center p-8 bg-gradient-to-br from-success/10 to-primary/10 rounded-2xl border-2 border-success mb-6"
          >
            <CheckCircle className="w-12 h-12 text-success mx-auto mb-3" />
            <h3 className="text-xl font-bold text-foreground mb-2">
              Задание на сегодня выполнено!
            </h3>
            <p className="text-muted-foreground">
              Отдохни и возвращайся завтра за новым микрошагом 🌟
            </p>
          </motion.div>
        )}

        {/* Upcoming Steps */}
        <div>
          <h3 className="text-lg font-semibold text-muted-foreground mb-3">
            Следующие шаги:
          </h3>
          <div className="space-y-3">
            {upcomingSteps.map(step => (
              <div key={step.day} className="relative">
                <MicroStepCard
                  step={step}
                  onToggle={() => handleToggleStep(step.day)}
                />
                {!isStepAvailable(step.day) && (
                  <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] rounded-lg flex items-center justify-center">
                    <div className="text-center bg-card/90 px-4 py-2 rounded-lg border">
                      <Lock className="w-6 h-6 text-muted-foreground mx-auto mb-1" />
                      <p className="text-xs text-muted-foreground">Доступно завтра</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Completion Message */}
        {allCompleted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
            className="text-center p-16 bg-gradient-to-br from-primary via-secondary to-accent rounded-3xl mt-8"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.3, 1],
                rotate: [0, 720, 0] 
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                repeatDelay: 2
              }}
            >
              <span className="text-8xl block mb-6">🏆</span>
            </motion.div>
            <h2 className="text-4xl font-bold text-white mb-4">
              Поздравляю! Ты сделал это!
            </h2>
            <p className="text-xl text-white/90 mb-6">
              90 дней — движение стало тобой. Привычка сформирована!
            </p>
            <p className="text-lg text-white/80">
              Серия: {habit.streak} дней подряд 🔥
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
