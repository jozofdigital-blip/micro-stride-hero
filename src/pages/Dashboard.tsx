import { motion } from 'framer-motion';
import { Habit } from '@/types/habit';
import { ProgressPath } from '@/components/ProgressPath';
import { MicroStepCard } from '@/components/MicroStepCard';
import { MotivationalQuote } from '@/components/MotivationalQuote';
import { useToast } from '@/hooks/use-toast';
import { Award, Sparkles } from 'lucide-react';

interface DashboardProps {
  habit: Habit;
  onUpdateHabit: (habit: Habit) => void;
}

const Dashboard = ({ habit, onUpdateHabit }: DashboardProps) => {
  const { toast } = useToast();
  
  const todayStep = habit.microSteps[habit.currentDay - 1];
  const nextSteps = habit.microSteps.slice(habit.currentDay, habit.currentDay + 3);

  const handleToggleStep = (stepDay: number) => {
    const updatedSteps = habit.microSteps.map(step => 
      step.day === stepDay ? { ...step, completed: !step.completed } : step
    );

    const stepBeingCompleted = !habit.microSteps[stepDay - 1].completed;
    
    const updatedHabit = {
      ...habit,
      microSteps: updatedSteps,
      currentDay: stepBeingCompleted ? Math.min(stepDay + 1, habit.microSteps.length) : habit.currentDay,
      streak: stepBeingCompleted ? habit.streak + 1 : Math.max(0, habit.streak - 1),
    };

    onUpdateHabit(updatedHabit);

    if (stepBeingCompleted) {
      const congratsMessages = [
        "Отлично! Минус 1% сопротивления! 🎉",
        "Ты движешься вперёд! Так держать! ✨",
        "Каждый шаг приближает к цели! 🎯",
        "Прогресс! Ты становишься лучше! 🌟",
        "Ещё один шаг к новой привычке! 💪",
      ];
      
      toast({
        title: congratsMessages[Math.floor(Math.random() * congratsMessages.length)],
        description: `Серия: ${updatedHabit.streak} дней подряд`,
        duration: 3000,
      });
    }
  };

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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="space-y-6"
      >
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">
            Микрошаг на сегодня
          </h2>
        </div>

        {todayStep && !todayStep.completed && (
          <MicroStepCard
            step={todayStep}
            onToggle={() => handleToggleStep(todayStep.day)}
          />
        )}

        {todayStep?.completed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center p-12 bg-gradient-to-br from-success/10 to-primary/10 rounded-2xl border-2 border-success"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 360, 0] 
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3
              }}
            >
              <Award className="w-16 h-16 text-success mx-auto mb-4" />
            </motion.div>
            <h3 className="text-2xl font-bold text-foreground mb-2">
              Задание на сегодня выполнено!
            </h3>
            <p className="text-muted-foreground">
              Отдохни и возвращайся завтра за новым микрошагом 🌟
            </p>
          </motion.div>
        )}
      </motion.div>

      {nextSteps.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="space-y-6"
        >
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
              <span className="text-sm text-muted-foreground">↓</span>
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              Следующие шаги
            </h2>
          </div>

          <div className="space-y-4 opacity-60">
            {nextSteps.map((step) => (
              <MicroStepCard
                key={step.day}
                step={step}
                onToggle={() => {}}
              />
            ))}
          </div>
        </motion.div>
      )}

      {habit.currentDay === habit.microSteps.length && todayStep?.completed && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: 'spring' }}
          className="text-center p-16 bg-gradient-to-br from-primary via-secondary to-accent rounded-3xl"
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
            Привычка сформирована. Продолжай в том же духе!
          </p>
          <p className="text-lg text-white/80">
            Серия: {habit.streak} дней подряд 🔥
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;
