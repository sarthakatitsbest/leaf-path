import { Navbar } from '@/components/Navbar';
import { motion } from 'framer-motion';
import AiChatWidget from '@/components/AiChatWidget';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Lightbulb, Leaf, Sparkles } from 'lucide-react';

export default function AIChat() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-50/20 to-primary/5">
      <Navbar />
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-8"
      >
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-2xl bg-accent/10">
              <Bot className="h-8 w-8 text-accent" />
            </div>
          </div>
          <h1 className="text-4xl font-poppins font-black gradient-purple-pink bg-clip-text text-transparent mb-2">
            AI Sustainability Assistant
          </h1>
          <p className="text-muted-foreground font-inter text-lg max-w-2xl mx-auto">
            Get personalized eco-tips, analyze your habits, and discover ways to reduce your environmental impact
          </p>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-3 gap-6 mb-8"
        >
          <Card className="glass rounded-2xl border-0 shadow-lg">
            <CardContent className="pt-6 text-center">
              <Lightbulb className="h-10 w-10 text-warning mx-auto mb-3" />
              <h3 className="font-poppins font-bold mb-1">Personalized Tips</h3>
              <p className="text-sm text-muted-foreground">Get advice based on your habits</p>
            </CardContent>
          </Card>
          <Card className="glass rounded-2xl border-0 shadow-lg">
            <CardContent className="pt-6 text-center">
              <Leaf className="h-10 w-10 text-primary mx-auto mb-3" />
              <h3 className="font-poppins font-bold mb-1">Eco Education</h3>
              <p className="text-sm text-muted-foreground">Learn about sustainability</p>
            </CardContent>
          </Card>
          <Card className="glass rounded-2xl border-0 shadow-lg">
            <CardContent className="pt-6 text-center">
              <Sparkles className="h-10 w-10 text-accent mx-auto mb-3" />
              <h3 className="font-poppins font-bold mb-1">Smart Analysis</h3>
              <p className="text-sm text-muted-foreground">Understand your carbon data</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Chat Interface */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass rounded-3xl border-0 shadow-xl max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="font-poppins flex items-center gap-2">
                <Bot className="h-5 w-5 text-accent" />
                Chat with EcoPulse AI
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AiChatWidget />
            </CardContent>
          </Card>
        </motion.div>

        {/* Suggested Questions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 max-w-4xl mx-auto"
        >
          <h3 className="font-poppins font-bold text-center mb-4">Try asking:</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              "How can I reduce my carbon footprint?",
              "What are the best recycling practices?",
              "Tips for sustainable travel",
              "How to save energy at home?"
            ].map((question, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
              >
                {question}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
