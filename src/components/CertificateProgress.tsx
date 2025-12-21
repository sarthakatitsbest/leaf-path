import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award,
  Leaf,
  Droplets,
  Utensils,
  Zap,
  Bus,
  Trophy,
  Heart,
  Download,
  Lock,
  CheckCircle2,
  ExternalLink,
  X,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';

interface CertificateProgressItem {
  type: string;
  title: string;
  description: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  progress: number;
  isUnlocked: boolean;
}

interface CertificateData {
  id: string;
  verificationCode: string;
  qrDataUrl: string;
  verifyUrl: string;
  certificateHtml: string;
}

const CERTIFICATE_ICONS: Record<string, typeof Leaf> = {
  carbon: Leaf,
  water: Droplets,
  food: Utensils,
  energy: Zap,
  transport: Bus,
  overall: Trophy,
  health: Heart
};

const CERTIFICATE_COLORS: Record<string, string> = {
  carbon: 'from-green-400 to-emerald-600',
  water: 'from-blue-400 to-cyan-600',
  food: 'from-orange-400 to-amber-600',
  energy: 'from-yellow-400 to-orange-500',
  transport: 'from-purple-400 to-indigo-600',
  overall: 'from-pink-400 to-rose-600',
  health: 'from-red-400 to-pink-600'
};

export default function CertificateProgress() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [certificates, setCertificates] = useState<CertificateProgressItem[]>([]);
  const [generatingCert, setGeneratingCert] = useState<string | null>(null);
  const [showCertDialog, setShowCertDialog] = useState(false);
  const [currentCertificate, setCurrentCertificate] = useState<CertificateData | null>(null);

  useEffect(() => {
    if (user) {
      fetchCertificateProgress();
    }
  }, [user]);

  const fetchCertificateProgress = async () => {
    try {
      // Call compute-wellness to get latest progress
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session) return;

      const response = await supabase.functions.invoke('compute-wellness', {
        body: { aqi: 100, temperature: 28, city: 'default' }
      });

      if (response.data?.certificateProgress) {
        setCertificates(response.data.certificateProgress);
      }
    } catch (error) {
      console.error('Error fetching certificate progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCertificate = async (cert: CertificateProgressItem) => {
    if (!cert.isUnlocked || !user) return;

    setGeneratingCert(cert.type);
    try {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('display_name, email')
        .eq('user_id', user.id)
        .maybeSingle();

      const userName = profile?.display_name || profile?.email?.split('@')[0] || 'Eco Champion';

      // First create a badge
      const { data: badge, error: badgeError } = await supabase
        .from('badges')
        .insert({
          user_id: user.id,
          title: cert.title,
          points: 100,
          verification_code: crypto.randomUUID()
        })
        .select()
        .single();

      if (badgeError) throw badgeError;

      // Generate certificate
      const response = await supabase.functions.invoke('generate-certificate', {
        body: {
          userId: user.id,
          badgeId: badge.id,
          userName,
          awardTitle: cert.description,
          projectName: 'Eco Pulse AI'
        }
      });

      if (response.data?.success) {
        toast.success('Certificate generated successfully!');
        
        // Show certificate in dialog
        if (response.data.certificate) {
          setCurrentCertificate(response.data.certificate);
          setShowCertDialog(true);
        }
      } else {
        throw new Error(response.data?.error || 'Failed to generate certificate');
      }
    } catch (error) {
      console.error('Certificate generation error:', error);
      toast.error('Failed to generate certificate');
    } finally {
      setGeneratingCert(null);
    }
  };

  const handleDownloadCertificate = () => {
    if (!currentCertificate?.certificateHtml) return;
    
    // Create a blob from the HTML and download
    const blob = new Blob([currentCertificate.certificateHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `certificate-${currentCertificate.verificationCode.slice(0, 8)}.html`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Certificate downloaded!');
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="glass rounded-3xl border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-10 w-10 bg-muted rounded-full"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-2 bg-muted rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-poppins font-bold flex items-center gap-2">
          <Award className="h-6 w-6 text-yellow-500" />
          Certificate Progress
        </h2>
        <Badge variant="outline" className="font-inter">
          {certificates.filter(c => c.isUnlocked).length}/{certificates.length} Unlocked
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {certificates.map((cert, index) => {
            const Icon = CERTIFICATE_ICONS[cert.type] || Award;
            const gradientColor = CERTIFICATE_COLORS[cert.type] || 'from-gray-400 to-gray-600';
            const isInverse = ['carbon', 'water', 'food', 'energy'].includes(cert.type);

            return (
              <motion.div
                key={cert.type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`glass rounded-3xl border-0 shadow-xl overflow-hidden relative ${cert.isUnlocked ? 'ring-2 ring-green-500' : ''}`}>
                  {/* Gradient overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${gradientColor} opacity-10`} />
                  
                  {/* Locked overlay */}
                  {!cert.isUnlocked && (
                    <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px] z-10 flex items-center justify-center">
                      <Lock className="h-8 w-8 text-muted-foreground/50" />
                    </div>
                  )}

                  <CardHeader className="relative z-20 pb-2">
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-2xl bg-gradient-to-br ${gradientColor}`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      {cert.isUnlocked ? (
                        <CheckCircle2 className="h-6 w-6 text-green-500" />
                      ) : (
                        <span className="text-xs text-muted-foreground">{cert.progress.toFixed(0)}%</span>
                      )}
                    </div>
                    <CardTitle className="font-poppins font-bold text-lg mt-2">
                      {cert.title}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="relative z-20 space-y-4">
                    <p className="text-sm text-muted-foreground font-inter">
                      {cert.description}
                    </p>

                    {/* Progress info */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {isInverse ? 'Current' : 'Progress'}:
                        </span>
                        <span className="font-semibold">
                          {cert.currentValue} / {cert.targetValue} {cert.unit}
                        </span>
                      </div>
                      <Progress 
                        value={cert.progress} 
                        className="h-2"
                      />
                      {isInverse && (
                        <p className="text-xs text-muted-foreground">
                          {cert.isUnlocked 
                            ? '✅ Goal achieved!' 
                            : `Reduce by ${(cert.currentValue - cert.targetValue).toFixed(1)} ${cert.unit}`
                          }
                        </p>
                      )}
                    </div>

                    {/* Action button */}
                    {cert.isUnlocked ? (
                      <Button
                        className="w-full"
                        onClick={() => handleGenerateCertificate(cert)}
                        disabled={generatingCert === cert.type}
                      >
                        {generatingCert === cert.type ? (
                          'Generating...'
                        ) : (
                          <>
                            <Download className="h-4 w-4 mr-2" />
                            Download Certificate
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button variant="secondary" className="w-full" disabled>
                        <Lock className="h-4 w-4 mr-2" />
                        Not Yet Unlocked
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Info footer */}
      <p className="text-xs text-muted-foreground text-center mt-4">
        💡 Certificates are auto-generated when you meet the criteria. All data is transparent and explainable.
      </p>

      {/* Certificate Preview Dialog */}
      <Dialog open={showCertDialog} onOpenChange={setShowCertDialog}>
        <DialogContent className="max-w-4xl h-[90vh] overflow-hidden p-0">
          {/* Sticky header */}
          <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b px-6 py-4">
            <DialogHeader className="flex flex-row items-center justify-between space-y-0 text-left">
              <DialogTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-500" />
                Your Certificate
              </DialogTitle>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowCertDialog(false)}
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogHeader>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-auto px-6 py-4">
            {currentCertificate && (
              <div className="space-y-4">
                {/* Certificate Preview */}
                <div
                  className="border rounded-lg overflow-hidden bg-background"
                  dangerouslySetInnerHTML={{ __html: currentCertificate.certificateHtml }}
                />

                {/* QR Code */}
                <div className="flex items-center justify-center gap-4 p-4 bg-muted/30 rounded-lg">
                  <img
                    src={currentCertificate.qrDataUrl}
                    alt="Verification QR code for certificate"
                    className="w-24 h-24 rounded-lg"
                    loading="lazy"
                  />
                  <div className="text-sm">
                    <p className="font-medium">Scan to verify</p>
                    <p className="text-muted-foreground text-xs">
                      Code: {currentCertificate.verificationCode.slice(0, 8)}...
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sticky footer actions */}
          {currentCertificate && (
            <div className="sticky bottom-0 z-20 bg-background/95 backdrop-blur border-t px-6 py-4">
              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <Button variant="outline" onClick={() => setShowCertDialog(false)}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button onClick={handleDownloadCertificate}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Certificate
                </Button>
                <Button variant="secondary" onClick={() => window.open(currentCertificate.verifyUrl, '_blank')}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Verification
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
