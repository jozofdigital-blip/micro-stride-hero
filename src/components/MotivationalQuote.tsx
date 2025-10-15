import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Quote } from 'lucide-react';

const quotes = [
  {
    text: "Минус 1% сопротивления — ты уже двигаешься!",
    author: "MyFocus"
  },
  {
    text: "Каждый маленький шаг приближает тебя к большой цели.",
    author: "Джеймс Клир"
  },
  {
    text: "Привычка — это выбор, который ты делаешь снова и снова.",
    author: "MyFocus"
  },
  {
    text: "Не стремись к совершенству, стремись к прогрессу.",
    author: "MyFocus"
  },
  {
    text: "Ты не поднимаешься до уровня своих целей. Ты опускаешься до уровня своих систем.",
    author: "Джеймс Клир"
  },
];

export const MotivationalQuote = () => {
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20 shadow-card">
        <div className="flex gap-4">
          <Quote className="w-8 h-8 text-primary flex-shrink-0" />
          <div>
            <p className="text-lg font-medium text-foreground mb-2 leading-relaxed">
              "{randomQuote.text}"
            </p>
            <p className="text-sm text-muted-foreground">— {randomQuote.author}</p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
