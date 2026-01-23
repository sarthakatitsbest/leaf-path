import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Leaf, Zap, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Hero: React.FC = () => {
  const navigate = useNavigate();

  const goToAuth = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log('[Hero] Start Tracking clicked -> navigating to /auth');
    navigate('/auth');
  };

  return (
    <section className="relative overflow-hidden py-20 px-6">
      {/* Animated background gradient */}
      <div className="absolute inset-0 gradient-teal-lime opacity-10 animate-pulse-slow" />
      
      <div className="container mx-auto max-w-6xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          {/* Pulsing logo */}
          <motion.div
            animate={{ 
              scale: [1, 1.05, 1],
              rotate: [0, 2, -2, 0]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="inline-flex items-center justify-center w-20 h-20 mx-auto mb-8 gradient-teal-lime rounded-3xl animate-glow"
          >
            <Leaf className="w-10 h-10 text-white" />
          </motion.div>

          {/* Main heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl font-poppins font-black mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent leading-tight"
          >
            EcoPulse
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl font-inter text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Track your carbon footprint with AI-powered insights. 
            <span className="text-primary font-semibold"> Measure. Learn. Reduce.</span>
          </motion.p>

          {/* Staggered CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                onClick={goToAuth}
                size="lg" 
                data-testid="start-tracking-btn"
                className="gradient-teal-lime text-white font-poppins font-semibold px-8 py-6 text-lg rounded-2xl shadow-2xl border-0 animate-glow"
              >
                <Zap className="mr-2 h-5 w-5" />
                Start Tracking
              </Button>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ delay: 0.1 }}
            >
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => navigate('/community')}
                className="glass font-poppins font-semibold px-8 py-6 text-lg rounded-2xl hover:bg-primary/10"
              >
                <Users className="mr-2 h-5 w-5" />
                Join Community
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Floating elements */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-10 w-16 h-16 gradient-purple-pink rounded-full opacity-20 blur-sm"
        />
        
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-20 right-16 w-12 h-12 gradient-warm rounded-full opacity-30 blur-sm"
        />
      </div>
    </section>
  );
};

export default Hero;