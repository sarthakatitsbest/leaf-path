import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { nvidiaChat } from '../_shared/nvidia.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rule-based carbon emission mappings (kg CO2 per item/unit)
const CARBON_MAPPINGS: Record<string, number> = {
  // Food items
  'beef': 27.0, 'steak': 27.0, 'hamburger': 27.0,
  'chicken': 6.9, 'poultry': 6.9,
  'pork': 12.1, 'bacon': 12.1, 'ham': 12.1,
  'fish': 6.1, 'salmon': 6.1, 'tuna': 6.1,
  'cheese': 13.5, 'dairy': 3.2, 'milk': 3.2,
  'bread': 0.9, 'pasta': 1.1, 'rice': 4.0,
  'vegetables': 2.0, 'fruits': 1.1, 'apple': 0.4,
  'banana': 0.5, 'potato': 0.5, 'tomato': 1.4,
  'coffee': 17.0, 'tea': 8.0, 'wine': 1.3, 'beer': 0.7,
  // Transport/fuel
  'gasoline': 2.3, 'gas': 2.3, 'fuel': 2.3, 'petrol': 2.3,
  'diesel': 2.7,
  // Energy
  'electricity': 0.5, 'heating': 0.2,
  // Shopping categories
  'clothing': 15.0, 'electronics': 50.0,
  'plastic': 6.0, 'paper': 3.3,
};

// Categories for ambiguous items that need AI classification
const AMBIGUOUS_KEYWORDS = [
  'organic', 'natural', 'eco', 'sustainable', 'local', 'imported',
  'processed', 'fresh', 'frozen', 'canned', 'bottled'
];

interface OCRResult {
  text: string;
  confidence: number;
}

interface CarbonItem {
  item: string;
  emissions: number;
  confidence: 'high' | 'medium' | 'low';
  source: 'rule-based' | 'ai-classified';
}

const extractTextFromImage = async (imageBase64: string): Promise<OCRResult> => {
  // Note: In a real implementation, you'd use Tesseract.js here
  // For now, simulating OCR result since Tesseract.js requires browser environment
  console.log('Processing image with OCR (simulated)');
  
  // This would be the actual Tesseract.js implementation:
  // const { createWorker } = await import('https://cdn.skypack.dev/tesseract.js');
  // const worker = await createWorker();
  // const { data: { text, confidence } } = await worker.recognize(imageBase64);
  // await worker.terminate();
  
  // Simulated OCR for demo - in production, implement proper Tesseract.js
  const simulatedText = "Beef steak 2.5 lbs $15.99\nChicken breast 1 lb $8.99\nOrganic tomatoes 2 lbs $4.99\nLocal honey 1 jar $7.99";
  
  return {
    text: simulatedText,
    confidence: 0.85
  };
};

const parseItemsFromText = (text: string): Array<{ item: string; quantity: number }> => {
  const lines = text.split('\n').filter(line => line.trim());
  const items: Array<{ item: string; quantity: number }> = [];
  
  for (const line of lines) {
    // Extract quantity and item using regex
    const quantityMatch = line.match(/(\d+(?:\.\d+)?)\s*(lbs?|kg|oz|pieces?|units?|items?)?/i);
    const quantity = quantityMatch ? parseFloat(quantityMatch[1]) : 1;
    
    // Extract item name (remove price, quantity, and common receipt noise)
    let item = line
      .replace(/\$\d+\.\d+/g, '') // Remove prices
      .replace(/\d+(?:\.\d+)?\s*(lbs?|kg|oz|pieces?|units?|items?)/gi, '') // Remove quantities
      .replace(/[^\w\s]/g, ' ') // Remove special characters
      .trim()
      .toLowerCase();
    
    if (item && item.length > 2) {
      items.push({ item, quantity });
    }
  }
  
  return items;
};

const classifyWithRules = (items: Array<{ item: string; quantity: number }>): {
  classified: CarbonItem[];
  ambiguous: Array<{ item: string; quantity: number }>;
} => {
  const classified: CarbonItem[] = [];
  const ambiguous: Array<{ item: string; quantity: number }> = [];
  
  for (const { item, quantity } of items) {
    let matched = false;
    let hasAmbiguousKeyword = false;
    
    // Check for ambiguous keywords first
    for (const keyword of AMBIGUOUS_KEYWORDS) {
      if (item.includes(keyword)) {
        hasAmbiguousKeyword = true;
        break;
      }
    }
    
    // Try to match with rule-based mappings
    for (const [keyword, baseEmission] of Object.entries(CARBON_MAPPINGS)) {
      if (item.includes(keyword)) {
        classified.push({
          item,
          emissions: baseEmission * quantity,
          confidence: hasAmbiguousKeyword ? 'medium' : 'high',
          source: 'rule-based'
        });
        matched = true;
        break;
      }
    }
    
    // If not matched or has ambiguous keywords, mark for AI classification
    if (!matched || hasAmbiguousKeyword) {
      ambiguous.push({ item, quantity });
    }
  }
  
  return { classified, ambiguous };
};

const classifyWithAI = async (
  ambiguousItems: Array<{ item: string; quantity: number }>
): Promise<CarbonItem[]> => {
  if (ambiguousItems.length === 0) return [];
  
  const itemsList = ambiguousItems.map(i => `${i.item} (${i.quantity} units)`).join('\n');
  
  const prompt = `Classify these receipt items and estimate carbon emissions in kg CO2:
${itemsList}

For each item, provide: item_name|emissions_kg|confidence
Be conservative with estimates. Use these baselines:
- Beef/red meat: ~27kg/kg
- Chicken/poultry: ~7kg/kg  
- Dairy: ~3-13kg/kg
- Vegetables: ~2kg/kg
- Processed foods: add 50% to base
- Local/organic: reduce by 20%

Format: item|emissions|confidence (one per line)`;

  try {
    const reply = await nvidiaChat(
      [
        { role: 'system', content: 'You are a carbon footprint expert. Provide concise, accurate emissions data. Output only the requested lines, no commentary.' },
        { role: 'user', content: prompt },
      ],
      { maxTokens: 300, temperature: 0 },
    );


    
    const classified: CarbonItem[] = [];
    const lines = reply.split('\n').filter(line => line.includes('|'));
    
    for (const line of lines) {
      const parts = line.split('|');
      if (parts.length >= 3) {
        const [item, emissionsStr, confidence] = parts;
        const emissions = parseFloat(emissionsStr) || 5.0; // Default fallback
        
        classified.push({
          item: item.trim(),
          emissions,
          confidence: ['high', 'medium', 'low'].includes(confidence.trim().toLowerCase()) 
            ? confidence.trim().toLowerCase() as 'high' | 'medium' | 'low'
            : 'medium',
          source: 'ai-classified'
        });
      }
    }
    
    return classified;
    
  } catch (error) {
    console.error('AI classification error:', error);
    // Fallback: assign default emissions to ambiguous items
    return ambiguousItems.map(({ item, quantity }) => ({
      item,
      emissions: 5.0 * quantity, // Conservative default
      confidence: 'low' as const,
      source: 'ai-classified' as const
    }));
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { image } = await req.json();
    
    if (!image) {
      return new Response(JSON.stringify({ error: 'Image data is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Starting receipt OCR processing...');

    // Step 1: Extract text using OCR (Tesseract.js in production)
    const ocrResult = await extractTextFromImage(image);
    console.log(`OCR extracted text with ${ocrResult.confidence} confidence`);

    // Step 2: Parse items from extracted text
    const parsedItems = parseItemsFromText(ocrResult.text);
    console.log(`Parsed ${parsedItems.length} items from receipt`);

    // Step 3: Classify using rule-based mapping first
    const { classified: ruleBasedItems, ambiguous: ambiguousItems } = classifyWithRules(parsedItems);
    console.log(`Rule-based classification: ${ruleBasedItems.length} classified, ${ambiguousItems.length} ambiguous`);

    // Step 4: Use AI only for ambiguous items (single NVIDIA call)
    const aiClassifiedItems = await classifyWithAI(ambiguousItems);
    console.log(`AI classified ${aiClassifiedItems.length} ambiguous items`);

    // Step 5: Combine all results
    const allItems = [...ruleBasedItems, ...aiClassifiedItems];
    const totalEmissions = allItems.reduce((sum, item) => sum + item.emissions, 0);
    
    // Step 6: Store in database
    const today = new Date().toISOString().split('T')[0];
    const { error: insertError } = await supabase
      .from('carbon_logs')
      .upsert({
        user_id: user.id,
        log_date: today,
        food_emissions: totalEmissions,
        total_emissions: totalEmissions,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,log_date'
      });

    if (insertError) {
      console.error('Error storing carbon log:', insertError);
    }

    return new Response(JSON.stringify({
      success: true,
      totalEmissions: Math.round(totalEmissions * 100) / 100,
      itemsProcessed: allItems.length,
      breakdown: {
        ruleBasedItems: ruleBasedItems.length,
        aiClassifiedItems: aiClassifiedItems.length
      },
      items: allItems,
      ocrConfidence: ocrResult.confidence
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in receipt-ocr function:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to process receipt',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});