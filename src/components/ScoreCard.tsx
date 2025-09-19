import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingDown, Leaf, Zap } from 'lucide-react';

interface ScoreCardProps {
  dailyScore: number;
  weeklyTotal: number;
  improvement: number;
}

const ScoreCard: React.FC<ScoreCardProps> = ({ 
  dailyScore = 12.5, 
  weeklyTotal = 89.2, 
  improvement = 15 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      whileHover={{ y: -4 }}
    >
      <Card className="relative overflow-hidden glass rounded-3xl border-0 shadow-2xl">
        <div className="absolute inset-0 gradient-teal-lime opacity-10" />
        
        <CardContent className="relative z-10 p-8">
          {/* Heartbeat animation for daily score */}
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [1, 0.8, 1]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="text-center mb-6"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 gradient-purple-pink rounded-2xl mb-4">
              <Leaf className="w-8 h-8 text-white" />
            </div>
            
            <div className="text-4xl font-poppins font-black text-primary mb-2">
              {dailyScore}
              <span className="text-lg text-muted-foreground ml-1">kg CO₂</span>
            </div>
            
            <p className="text-sm font-inter text-muted-foreground">Today's Footprint</p>
          </motion.div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-4">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center p-4 bg-white/30 rounded-2xl"
            >
              <div className="flex items-center justify-center mb-2">
                <TrendingDown className="w-5 h-5 text-secondary mr-1" />
                <span className="text-lg font-poppins font-bold text-secondary">
                  -{improvement}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground">vs last week</p>
            </motion.div>

            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-center p-4 bg-white/30 rounded-2xl"
            >
              <div className="flex items-center justify-center mb-2">
                <Zap className="w-5 h-5 text-warning mr-1" />
                <span className="text-lg font-poppins font-bold text-foreground">
                  {weeklyTotal}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Weekly total</p>
            </motion.div>
          </div>

          {/* Progress bar with animation */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 1.5, delay: 0.6 }}
            className="mt-6"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-inter font-medium">Weekly Progress</span>
              <span className="text-sm text-primary font-semibold">68%</span>
            </div>
            <div className="w-full bg-white/30 rounded-full h-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '68%' }}
                transition={{ duration: 2, delay: 0.8 }}
                className="gradient-teal-lime h-3 rounded-full shadow-lg"
              />
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ScoreCard;