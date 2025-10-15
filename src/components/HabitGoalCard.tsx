import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { HabitGoal } from '@/types/habit';

interface HabitGoalCardProps {
  goal: HabitGoal;
  onClick: () => void;
  index: number;
}

export const HabitGoalCard = ({ goal, onClick, index }: HabitGoalCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        onClick={onClick}
        className="relative overflow-hidden cursor-pointer border-none shadow-card hover:shadow-hover transition-all duration-300 p-8 h-64 flex flex-col justify-between"
        style={{ 
          background: `var(--${goal.gradient})` 
        }}
      >
        <div className="relative z-10">
          <div className="text-6xl mb-4">{goal.icon}</div>
          <h3 className="text-2xl font-bold text-foreground mb-2">{goal.title}</h3>
          <p className="text-muted-foreground">{goal.subtitle}</p>
        </div>
        
        <div className="relative z-10 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{goal.totalDays} дней</span>
          <motion.div
            className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center"
            whileHover={{ scale: 1.2, rotate: 90 }}
          >
            <span className="text-primary text-xl">→</span>
          </motion.div>
        </div>
      </Card>
    </motion.div>
  );
};
