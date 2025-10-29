import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import BadgeCertificate from "./BadgeCertificate";
import ConfettiCanvas from "./ConfettiCanvas";
import { Award, Trophy } from "lucide-react";

interface Badge {
  id: string;
  title: string;
  issued_at: string;
  verification_code: string;
  points: number;
  challenges: { title: string } | null;
}

export default function BadgeGallery() {
  const { user } = useAuth();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiKey, setConfettiKey] = useState(0);

  useEffect(() => {
    if (!user) return;

    const fetchBadges = async () => {
      const { data, error } = await supabase
        .from('badges')
        .select('*, challenges(title)')
        .eq('user_id', user.id)
        .order('issued_at', { ascending: false });

      if (!error && data) {
        // Detect newly-earned badges
        try {
          const seenKey = `ecopulse_seen_badges_${user.id}`;
          const seenRaw = localStorage.getItem(seenKey);
          const seenIds: string[] = seenRaw ? JSON.parse(seenRaw) : [];
          const newBadges = data.filter(b => !seenIds.includes(b.id));
          
          if (newBadges.length > 0 && data.length > 0) {
            // Trigger confetti for new badges
            setShowConfetti(true);
            setConfettiKey(k => k + 1);
            
            // Update seen badges
            const nextSeen = Array.from(new Set([...seenIds, ...data.map(b => b.id)]));
            localStorage.setItem(seenKey, JSON.stringify(nextSeen));
            
            // Stop confetti after duration
            setTimeout(() => setShowConfetti(false), 3500);
          }
        } catch (err) {
          console.warn("Badge localStorage check failed:", err);
        }
        
        setBadges(data);
      }
      setLoading(false);
    };

    fetchBadges();
  }, [user]);

  if (loading) {
    return <div className="text-center py-8">Loading badges...</div>;
  }

  if (badges.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No badges earned yet. Complete challenges to earn your first badge!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {badges.map((badge) => (
        <Dialog key={badge.id}>
          <DialogTrigger asChild>
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Award className="w-8 h-8 text-primary" />
                  <span className="text-sm text-muted-foreground">
                    {badge.points} pts
                  </span>
                </div>
                <CardTitle className="text-lg">{badge.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Earned on {new Date(badge.issued_at).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Certificate</DialogTitle>
            </DialogHeader>
            <BadgeCertificate
              badge={{
                ...badge,
                challenge_title: badge.challenges?.title || badge.title
              }}
              userName={user?.email?.split('@')[0] || 'User'}
            />
          </DialogContent>
        </Dialog>
      ))}
      
      {showConfetti && <ConfettiCanvas key={confettiKey} durationMs={3500} />}
    </div>
  );
}
