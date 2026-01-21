import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, Loader2, Recycle, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Tesseract from 'tesseract.js';

interface ClassificationResult {
  type: string;
  recyclable: boolean;
  recyclability_score: number;
  confidence: number;
  details: string;
}

const typeColors: Record<string, string> = {
  'PET': 'bg-green-500/10 text-green-600 border-green-200',
  'HDPE': 'bg-blue-500/10 text-blue-600 border-blue-200',
  'PVC': 'bg-red-500/10 text-red-600 border-red-200',
  'single-use': 'bg-amber-500/10 text-amber-600 border-amber-200',
  'multi-layer': 'bg-purple-500/10 text-purple-600 border-purple-200',
  'film': 'bg-gray-500/10 text-gray-600 border-gray-200',
  'unknown': 'bg-slate-500/10 text-slate-600 border-slate-200',
};

const typeLabels: Record<string, string> = {
  'PET': '♳ PET (Type 1)',
  'HDPE': '♴ HDPE (Type 2)',
  'PVC': '♵ PVC (Type 3)',
  'single-use': '🥤 Single-Use',
  'multi-layer': '📦 Multi-Layer',
  'film': '🛍️ Film/Wrap',
  'unknown': '❓ Unknown',
};

export default function PlasticClassifier() {
  const [image, setImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [result, setResult] = useState<ClassificationResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const processImage = async (file: File) => {
    setIsProcessing(true);
    setOcrProgress(0);
    setResult(null);

    try {
      // Read file as base64
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          setImage(result);
          resolve(result.split(',')[1]); // Remove data:image/...;base64, prefix
        };
        reader.readAsDataURL(file);
      });

      // Run OCR
      setOcrProgress(20);
      let ocrText = '';
      try {
        const ocrResult = await Tesseract.recognize(file, 'eng', {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              setOcrProgress(20 + Math.round(m.progress * 50));
            }
          },
        });
        ocrText = ocrResult.data.text;
      } catch (ocrError) {
        console.error('OCR error:', ocrError);
      }

      setOcrProgress(75);

      // Call classification API
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: 'Please login', variant: 'destructive' });
        return;
      }

      const response = await fetch(
        `https://fbmphwihmfzbbyavgusl.supabase.co/functions/v1/plastic-classify`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            imageBase64: base64,
            ocrText,
          }),
        }
      );

      setOcrProgress(100);

      if (!response.ok) {
        throw new Error('Classification failed');
      }

      const data = await response.json();
      setResult(data);

      toast({
        title: '✅ Classification complete!',
        description: `Identified as ${typeLabels[data.type] || data.type}`,
      });
    } catch (error) {
      console.error('Classification error:', error);
      toast({
        title: 'Classification failed',
        description: 'Please try again with a clearer image',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImage(file);
    }
  };

  const reset = () => {
    setImage(null);
    setResult(null);
    setOcrProgress(0);
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Recycle className="w-5 h-5 text-secondary" />
          Plastic Classifier
          <Badge variant="outline" className="ml-auto text-xs">AI</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Image Preview or Upload */}
        {!image ? (
          <div className="border-2 border-dashed rounded-lg p-6 text-center space-y-3">
            <div className="flex justify-center gap-3">
              <Button
                variant="outline"
                onClick={() => cameraInputRef.current?.click()}
              >
                <Camera className="w-4 h-4 mr-2" />
                Camera
              </Button>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Upload packaging image to classify plastic type
            </p>
          </div>
        ) : (
          <div className="relative">
            <img
              src={image}
              alt="Uploaded plastic"
              className="w-full h-48 object-cover rounded-lg"
            />
            {!isProcessing && (
              <Button
                size="sm"
                variant="secondary"
                className="absolute top-2 right-2"
                onClick={reset}
              >
                New Image
              </Button>
            )}
          </div>
        )}

        {/* Hidden inputs */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Processing Progress */}
        <AnimatePresence>
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2"
            >
              <div className="flex items-center gap-2 text-sm">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                {ocrProgress < 70 ? 'Analyzing image...' : 'Classifying plastic...'}
              </div>
              <Progress value={ocrProgress} className="h-2" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-3"
            >
              {/* Type Badge */}
              <div className="flex items-center justify-between">
                <Badge className={`${typeColors[result.type] || typeColors.unknown} text-sm px-3 py-1`}>
                  {typeLabels[result.type] || result.type}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {result.confidence}% confidence
                </span>
              </div>

              {/* Recyclability Score */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Recyclability Score</span>
                  <span className={result.recyclable ? 'text-green-600' : 'text-red-600'}>
                    {result.recyclability_score}%
                  </span>
                </div>
                <Progress 
                  value={result.recyclability_score} 
                  className={`h-3 ${result.recyclable ? '[&>div]:bg-green-500' : '[&>div]:bg-red-500'}`}
                />
              </div>

              {/* Recyclable Status */}
              <div className={`p-3 rounded-lg flex items-center gap-3 ${
                result.recyclable 
                  ? 'bg-green-500/10 border border-green-200' 
                  : 'bg-red-500/10 border border-red-200'
              }`}>
                {result.recyclable ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-700">Recyclable</p>
                      <p className="text-xs text-green-600">Can be processed by most recycling facilities</p>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-red-600" />
                    <div>
                      <p className="font-medium text-red-700">Not Easily Recyclable</p>
                      <p className="text-xs text-red-600">Requires specialized processing</p>
                    </div>
                  </>
                )}
              </div>

              {/* Details */}
              {result.details && (
                <p className="text-xs text-muted-foreground">{result.details}</p>
              )}

              {/* Warning for problematic types */}
              {(result.type === 'multi-layer' || result.type === 'PVC') && (
                <div className="p-2 rounded bg-amber-500/10 border border-amber-200 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
                  <p className="text-xs text-amber-700">
                    {result.type === 'multi-layer' 
                      ? 'Multi-layer packaging is difficult to recycle. Consider supporting producer takeback programs.'
                      : 'PVC contains harmful additives. Avoid burning and dispose properly.'}
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
