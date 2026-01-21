import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Camera, Upload, Loader2, Receipt, Zap } from 'lucide-react';
import { createWorker } from 'tesseract.js';

interface CarbonItem {
  item: string;
  emissions: number;
  confidence: 'high' | 'medium' | 'low';
  source: 'rule-based' | 'ai-classified';
}

interface ScanResult {
  totalEmissions: number;
  itemsProcessed: number;
  breakdown: {
    ruleBasedItems: number;
    aiClassifiedItems: number;
  };
  items: CarbonItem[];
  ocrConfidence: number;
}

const ReceiptScanner: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [processingStep, setProcessingStep] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const processImageWithOCR = async (imageFile: File): Promise<string> => {
    setProcessingStep('Extracting text from receipt...');
    
    try {
      const worker = await createWorker('eng');
      const { data: { text, confidence } } = await worker.recognize(imageFile);
      await worker.terminate();
      
      console.log(`OCR confidence: ${confidence}%`);
      if (confidence < 60) {
        toast({
          title: "Low OCR Quality",
          description: "Receipt image quality is low. Results may be less accurate.",
          variant: "destructive"
        });
      }
      
      return text;
    } catch (error) {
      console.error('OCR processing failed:', error);
      throw new Error('Failed to extract text from image');
    }
  };

  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]); // Remove data URL prefix
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const processReceipt = useCallback(async (file: File) => {
    if (!file) return;

    setIsScanning(true);
    setScanResult(null);
    setProcessingStep('Preparing image...');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to scan receipts",
          variant: "destructive"
        });
        return;
      }

      // Step 1: Process image with Tesseract.js locally for better performance
      const ocrText = await processImageWithOCR(file);
      
      // Step 2: Convert image to base64 for server processing
      setProcessingStep('Processing with AI...');
      const imageBase64 = await convertImageToBase64(file);

      // Step 3: Send to our edge function for rule-based + AI classification
      const { data, error } = await supabase.functions.invoke('receipt-ocr', {
        body: {
          image: imageBase64,
          ocrText // Pass OCR text to save server processing time
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) throw error;

      setScanResult(data);
      
      toast({
        title: "Receipt Processed!",
        description: `Found ${data.itemsProcessed} items with ${data.totalEmissions.toFixed(1)}kg CO₂`,
      });

    } catch (error) {
      console.error('Receipt processing error:', error);
      toast({
        title: "Processing Failed",
        description: error instanceof Error ? error.message : "Failed to process receipt",
        variant: "destructive"
      });
    } finally {
      setIsScanning(false);
      setProcessingStep('');
    }
  }, [toast]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      processReceipt(file);
    } else {
      toast({
        title: "Invalid File",
        description: "Please select a valid image file",
        variant: "destructive"
      });
    }
  };

  const handleCameraCapture = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          Receipt Scanner
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isScanning && !scanResult && (
          <div className="space-y-3">
            <Button
              onClick={handleCameraCapture}
              className="w-full"
              size="lg"
            >
              <Camera className="h-4 w-4 mr-2" />
              Take Photo
            </Button>
            
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Image
            </Button>
            
            {/* Camera input - opens camera directly on mobile */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {/* File input - opens file picker/gallery */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <p className="text-sm text-muted-foreground text-center">
              Scan grocery receipts to calculate carbon footprint
            </p>
          </div>
        )}

        {isScanning && (
          <div className="flex flex-col items-center space-y-3 py-6">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-sm text-muted-foreground text-center">
              {processingStep || 'Processing receipt...'}
            </p>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: processingStep.includes('text') ? '33%' : 
                         processingStep.includes('AI') ? '66%' : '100%' 
                }}
              />
            </div>
          </div>
        )}

        {scanResult && (
          <div className="space-y-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <h3 className="text-2xl font-bold text-primary">
                {scanResult.totalEmissions.toFixed(1)} kg CO₂
              </h3>
              <p className="text-sm text-muted-foreground">
                From {scanResult.itemsProcessed} items
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-1">
                <Zap className="h-3 w-3 text-green-600" />
                <span>{scanResult.breakdown.ruleBasedItems} rule-based</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-blue-600"></span>
                <span>{scanResult.breakdown.aiClassifiedItems} AI-classified</span>
              </div>
            </div>

            <div className="max-h-40 overflow-y-auto space-y-2">
              {scanResult.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center text-sm p-2 bg-muted/50 rounded">
                  <div>
                    <span className="font-medium">{item.item}</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs ${getConfidenceColor(item.confidence)}`}>
                        {item.confidence}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {item.source === 'rule-based' ? '⚡' : '🤖'}
                      </span>
                    </div>
                  </div>
                  <span className="font-mono text-xs">
                    {item.emissions.toFixed(1)}kg
                  </span>
                </div>
              ))}
            </div>

            <Button
              onClick={() => setScanResult(null)}
              variant="outline"
              className="w-full"
            >
              Scan Another Receipt
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReceiptScanner;