import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";

interface VerificationResult {
  verified: boolean;
  badge?: {
    title: string;
    issued_at: string;
    points: number;
    user_name: string;
    challenge_title: string;
    verification_code: string;
  };
  error?: string;
}

export default function VerifyBadge() {
  const { code } = useParams<{ code: string }>();
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verify = async () => {
      if (!code) return;

      try {
        const response = await fetch(
          `https://fbmphwihmfzbbyavgusl.supabase.co/functions/v1/verify-badge/${code}`,
          {
            headers: {
              apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZibXBod2lobWZ6YmJ5YXZndXNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0OTAxMzIsImV4cCI6MjA3MzA2NjEzMn0.etMn07UhYbVu2NEiYQzBgIYO_7O3SqCL2u3tiOR18KA"
            }
          }
        );

        const data = await response.json();
        setResult(data);
      } catch (error) {
        console.error("Verification error:", error);
        setResult({ verified: false, error: "Failed to verify badge" });
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [code]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-green-50/20 to-blue-50/20">
      <Navbar />
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Badge Verification</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            {loading ? (
              <div className="py-12">
                <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
                <p className="mt-4 text-muted-foreground">Verifying badge...</p>
              </div>
            ) : result?.verified && result.badge ? (
              <div className="py-8">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-green-600 mb-6">Verified Badge</h2>
                
                <div className="space-y-4 text-left bg-green-50 p-6 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Badge Title</p>
                    <p className="font-semibold text-lg">{result.badge.title}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Awarded To</p>
                    <p className="font-semibold">{result.badge.user_name}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Challenge</p>
                    <p className="font-semibold">{result.badge.challenge_title}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Issued Date</p>
                    <p className="font-semibold">
                      {new Date(result.badge.issued_at).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Points Earned</p>
                    <p className="font-semibold">{result.badge.points}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Verification Code</p>
                    <p className="font-mono text-xs break-all">{result.badge.verification_code}</p>
                  </div>
                </div>

                <p className="mt-6 text-sm text-muted-foreground">
                  Awarded by <span className="font-semibold text-primary">Eco Pulse AI</span>
                </p>
              </div>
            ) : (
              <div className="py-8">
                <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-red-600 mb-4">Invalid Badge</h2>
                <p className="text-muted-foreground">
                  {result?.error || "This verification code is not valid or the badge does not exist."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
