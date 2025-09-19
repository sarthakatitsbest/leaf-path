import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Trophy, Medal, Award, Crown } from 'lucide-react';

interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  rank: number;
  change: number;
}

const mockData: LeaderboardEntry[] = [
  { id: '1', name: 'Sarah', score: 245, rank: 1, change: 0 },
  { id: '2', name: 'Mike', score: 230, rank: 2, change: 1 },
  { id: '3', name: 'You', score: 215, rank: 3, change: -1 },
  { id: '4', name: 'Emma', score: 200, rank: 4, change: 0 },
  { id: '5', name: 'David', score: 185, rank: 5, change: 2 }
];

const LeaderboardWidget: React.FC = () => {
  const [showConfetti, setShowConfetti] = useState(false);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-warning" />;
      case 2:
        return <Trophy className="w-5 h-5 text-muted" />;
      case 3:
        return <Medal className="w-5 h-5 text-warning" />;
      default:
        return <Award className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getRankGradient = (rank: number) => {
    switch (rank) {
      case 1:
        return 'gradient-warm';
      case 2:
        return 'gradient-purple-pink';
      case 3:
        return 'gradient-teal-lime';
      default:
        return 'bg-muted/20';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="glass rounded-3xl border-0 shadow-2xl overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-poppins font-bold flex items-center gap-2">
            <Trophy className="w-6 h-6 text-primary" />
            Eco Leaders
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-3">
          <AnimatePresence>
            {mockData.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className={`relative p-4 rounded-2xl ${
                  entry.name === 'You' 
                    ? 'bg-primary/10 border border-primary/20' 
                    : 'bg-white/30'
                }`}
              >
                {/* Confetti effect for rank changes */}
                {entry.change > 0 && (
                  <motion.div
                    initial={{ scale: 0, rotate: 0 }}
                    animate={{ scale: 1, rotate: 360 }}
                    className="absolute -top-2 -right-2 w-6 h-6 gradient-warm rounded-full flex items-center justify-center"
                  >
                    <span className="text-xs text-white font-bold">↑</span>
                  </motion.div>
                )}

                <div className="flex items-center gap-3">
                  {/* Rank badge */}
                  <motion.div
                    whileHover={{ rotate: 10 }}
                    className={`w-12 h-12 ${getRankGradient(entry.rank)} rounded-2xl flex items-center justify-center shadow-lg`}
                  >
                    {entry.rank <= 3 ? (
                      getRankIcon(entry.rank)
                    ) : (
                      <span className="font-poppins font-bold text-foreground">
                        {entry.rank}
                      </span>
                    )}
                  </motion.div>

                  {/* Avatar and info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="gradient-teal-lime text-white font-semibold text-sm">
                          {entry.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-inter font-semibold text-foreground">
                        {entry.name}
                      </span>
                      {entry.name === 'You' && (
                        <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
                          You
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-poppins font-bold text-primary">
                        {entry.score} pts
                      </span>
                      {entry.change !== 0 && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className={`text-xs px-1.5 py-0.5 rounded-full ${
                            entry.change > 0 
                              ? 'text-secondary bg-secondary/10' 
                              : 'text-destructive bg-destructive/10'
                          }`}
                        >
                          {entry.change > 0 ? `+${entry.change}` : entry.change}
                        </motion.span>
                      )}
                    </div>
                  </div>

                  {/* Animated score */}
                  {entry.rank <= 3 && (
                    <motion.div
                      animate={{ 
                        scale: [1, 1.1, 1],
                        opacity: [0.7, 1, 0.7]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="text-right"
                    >
                      <div className="text-lg font-poppins font-bold gradient-teal-lime bg-clip-text text-transparent">
                        #{entry.rank}
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default LeaderboardWidget;