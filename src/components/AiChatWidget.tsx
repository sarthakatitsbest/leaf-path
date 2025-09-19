import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MessageCircle, Send, Loader2, X } from 'lucide-react';

interface AiChatWidgetProps {
  userProfile?: any;
  recentData?: any;
}

const AiChatWidget: React.FC<AiChatWidgetProps> = ({ userProfile, recentData }) => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to use the AI chat",
          variant: "destructive"
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          message,
          userProfile,
          recentData
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) throw error;

      setResponse(data.reply);
      setMessage('');
      
    } catch (error) {
      console.error('AI chat error:', error);
      toast({
        title: "Chat Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Button
          onClick={() => setIsOpen(true)}
          className="gradient-purple-pink rounded-full h-14 w-14 shadow-2xl border-0 animate-glow"
          size="icon"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <MessageCircle className="h-7 w-7 text-white" />
          </motion.div>
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 20 }}
      className="fixed bottom-6 right-6 w-80 z-50"
    >
      <Card className="glass rounded-3xl border-0 shadow-2xl overflow-hidden">
        <div className="absolute inset-0 gradient-teal-lime opacity-5" />
        
        <CardHeader className="relative z-10 pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-poppins font-bold flex items-center gap-2">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                <MessageCircle className="h-5 w-5 text-primary" />
              </motion.div>
              EcoPulse AI
            </CardTitle>
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 p-0 rounded-full hover:bg-destructive/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </CardHeader>
        
        <CardContent className="relative z-10 space-y-4">
          <AnimatePresence>
            {response && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/40 p-4 rounded-2xl backdrop-blur-sm"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 gradient-teal-lime rounded-full flex items-center justify-center">
                    <MessageCircle className="h-3 w-3 text-white" />
                  </div>
                  <p className="text-xs font-poppins font-semibold text-primary">EcoPulse AI</p>
                </div>
                <p className="text-sm font-inter leading-relaxed">{response}</p>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about carbon reduction..."
                className="rounded-2xl border-0 bg-white/40 backdrop-blur-sm pr-4"
                disabled={isLoading}
              />
              {isLoading && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer rounded-2xl"
                />
              )}
            </div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={sendMessage}
                disabled={isLoading || !message.trim()}
                size="sm"
                className="gradient-purple-pink rounded-2xl border-0 px-4"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                ) : (
                  <Send className="h-4 w-4 text-white" />
                )}
              </Button>
            </motion.div>
          </div>
          
          <p className="text-xs text-muted-foreground text-center font-inter">
            Ask about eco tips, carbon reduction, or sustainable living
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AiChatWidget;