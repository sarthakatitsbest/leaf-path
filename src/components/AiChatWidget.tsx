import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MessageCircle, Send, Loader2 } from 'lucide-react';

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
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 rounded-full h-12 w-12 shadow-lg"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 shadow-xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            EcoPulse AI
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="h-6 w-6 p-0"
          >
            ×
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {response && (
          <div className="bg-muted p-3 rounded-lg text-sm">
            <p className="text-muted-foreground text-xs mb-1">EcoPulse AI:</p>
            <p>{response}</p>
          </div>
        )}
        
        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about carbon reduction..."
            className="text-sm"
            disabled={isLoading}
          />
          <Button
            onClick={sendMessage}
            disabled={isLoading || !message.trim()}
            size="sm"
            className="px-3"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground">
          Ask about eco tips, carbon reduction, or sustainable living
        </p>
      </CardContent>
    </Card>
  );
};

export default AiChatWidget;