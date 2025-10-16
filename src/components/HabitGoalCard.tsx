import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { HabitGoal } from '@/types/habit';
import { cn } from '@/lib/utils';

interface HabitGoalCardProps {
  goal: HabitGoal;
  onClick: () => void;
  index: number;
  isLocked?: boolean;
}

export const HabitGoalCard = ({ goal, onClick, index, isLocked = false }: HabitGoalCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      whileHover={isLocked ? undefined : { scale: 1.02, y: -5 }}
      whileTap={isLocked ? undefined : { scale: 0.98 }}
    >
      <Card
        onClick={onClick}
        className={cn(
          'relative flex h-64 cursor-pointer flex-col justify-between overflow-hidden border-none p-8 shadow-card transition-all duration-300',
          !isLocked && 'hover:shadow-hover',
          isLocked && 'cursor-not-allowed opacity-80',
        )}
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
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full bg-primary/20',
              isLocked && 'bg-muted/60 text-muted-foreground',
            )}
            whileHover={isLocked ? undefined : { scale: 1.2, rotate: 90 }}
          >
            <span
              className={cn(
                'text-xl text-primary',
                isLocked && 'text-muted-foreground',
              )}
            >
              →
            </span>
          </motion.div>
        </div>
      </Card>
    </motion.div>
  );
};
