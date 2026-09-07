import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Loader2, Sparkles, Copy, Check, Lightbulb, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PitchResult {
  category: string;
  problem: string;
  solution: string;
  metric: string;
  confidence: number;
}

const categoryColors: Record<string, string> = {
  plastic_hotspot: 'bg-red-500/10 text-red-600 border-red-200',
  plastic_type: 'bg-blue-500/10 text-blue-600 border-blue-200',
  brand: 'bg-purple-500/10 text-purple-600 border-purple-200',
  management: 'bg-amber-500/10 text-amber-600 border-amber-200',
  other: 'bg-gray-500/10 text-gray-600 border-gray-200',
};

const categoryLabels: Record<string, string> = {
  plastic_hotspot: '📍 Hotspot',
  plastic_type: '♻️ Plastic Type',
  brand: '🏷️ Brand',
  management: '🏢 Management',
  other: '📋 General',
};

export default function PlasticPitchAnalyzer() {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<PitchResult | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  // Setup speech recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let text = '';
        for (let i = 0; i < event.results.length; i++) {
          text += event.results[i][0].transcript;
        }
        setTranscript(text);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast({
        title: 'Speech not supported',
        description: 'Your browser does not support speech recognition',
        variant: 'destructive',
      });
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      setResult(null);
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const analyzeTranscript = async () => {
    if (!transcript.trim()) {
      toast({
        title: 'Enter text',
        description: 'Please speak or type a statement to analyze',
        variant: 'destructive',
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: 'Please login', variant: 'destructive' });
        return;
      }

      const response = await fetch(
        `https://fbmphwihmfzbbyavgusl.supabase.co/functions/v1/plastic-analyze`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ transcript }),
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok || !data || data.error) {
        throw new Error(data?.error || 'Analysis failed');
      }

      setResult(data);
      
      toast({
        title: '✨ Analysis complete!',
        description: 'Your investor-ready pitch lines are ready',
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: 'Analysis failed',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive',
      });

    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
    toast({ title: 'Copied!', description: `${type} copied to clipboard` });
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="w-5 h-5 text-primary" />
          Pitch Coach
          <Badge variant="outline" className="ml-auto text-xs">PWIE</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Input Area */}
        <div className="relative">
          <Textarea
            placeholder='Say or type: "Plastic waste is a huge problem..."'
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            className="min-h-[80px] pr-12 resize-none"
            disabled={isListening}
          />
          <Button
            size="icon"
            variant={isListening ? 'destructive' : 'outline'}
            className="absolute right-2 top-2"
            onClick={toggleListening}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </Button>
        </div>

        {/* Listening indicator */}
        <AnimatePresence>
          {isListening && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 text-sm text-primary"
            >
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </span>
              Listening... Speak your statement
            </motion.div>
          )}
        </AnimatePresence>

        {/* Analyze Button */}
        <Button
          onClick={analyzeTranscript}
          disabled={isAnalyzing || !transcript.trim()}
          className="w-full gradient-teal-lime text-white"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Get Investor-Ready Lines
            </>
          )}
        </Button>

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-3 pt-2"
            >
              {/* Category & Confidence */}
              <div className="flex items-center justify-between">
                <Badge className={categoryColors[result.category] || categoryColors.other}>
                  {categoryLabels[result.category] || '📋 General'}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {result.confidence}% confidence
                </span>
              </div>

              {/* Problem Statement */}
              <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-medium text-destructive mb-1">Problem</p>
                    <p className="text-sm font-medium">{result.problem}</p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="shrink-0 h-8 w-8"
                    onClick={() => copyToClipboard(result.problem, 'Problem')}
                  >
                    {copied === 'Problem' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {/* Solution Statement */}
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-medium text-primary mb-1">Solution</p>
                    <p className="text-sm font-medium">{result.solution}</p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="shrink-0 h-8 w-8"
                    onClick={() => copyToClipboard(result.solution, 'Solution')}
                  >
                    {copied === 'Solution' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {/* Metric */}
              <div className="p-3 rounded-lg bg-secondary/10 border border-secondary/20">
                <div className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-secondary mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-secondary mb-1">Suggested Metric</p>
                    <p className="text-sm">{result.metric}</p>
                  </div>
                </div>
              </div>

              {/* Use in Pitch Button */}
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => copyToClipboard(`${result.problem}\n\n${result.solution}`, 'Full Pitch')}
              >
                <Lightbulb className="w-4 h-4 mr-2" />
                Copy Full Pitch
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
