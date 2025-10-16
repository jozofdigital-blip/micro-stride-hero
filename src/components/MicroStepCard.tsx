import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { MicroStep } from '@/types/habit';
import { CheckCircle2 } from 'lucide-react';

interface MicroStepCardProps {
  step: MicroStep;
  onToggle: () => void;
}

export const MicroStepCard = ({ step, onToggle }: MicroStepCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        onClick={onToggle}
        className={`p-6 cursor-pointer transition-all duration-300 ${
          step.completed 
            ? 'bg-success/10 border-success' 
            : 'bg-card hover:shadow-card'
        }`}
      >
        <div className="flex items-start gap-4">
          <div className="mt-1">
            <Checkbox
              checked={step.completed}
              className="h-6 w-6 pointer-events-none"
            />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary">
                День {step.day}
              </span>
              {step.completed && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                >
                  <CheckCircle2 className="w-5 h-5 text-success" />
                </motion.div>
              )}
            </div>
            
            <h4 className={`font-semibold mb-1 ${
              step.completed ? 'text-muted-foreground line-through' : 'text-foreground'
            }`}>
              {step.title}
            </h4>
            
            <p className="text-sm text-muted-foreground">
              {step.description}
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
