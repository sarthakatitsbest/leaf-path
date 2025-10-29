import { Button } from "./ui/button";
import { Trophy, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function GamificationSection() {
  const navigate = useNavigate();

  return (
    <section className="mt-12 max-w-5xl mx-auto px-6">
      <div className="bg-card/60 backdrop-blur-sm p-8 rounded-2xl border border-border">
        <div className="flex items-center gap-3 mb-4">
          <Trophy className="h-8 w-8 text-primary" />
          <h2 className="text-2xl font-bold text-primary">Leaderboards & Rewards</h2>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          Join challenges, earn badges and climb local leaderboards. Gamification motivates small daily
          changes that add up to big impact. Certificates are verified with a QR code so you can share achievements.
        </p>
        <div className="mt-6 flex gap-4 flex-wrap">
          <Button onClick={() => navigate("/dashboard")} className="gap-2">
            <Trophy className="h-4 w-4" />
            View Leaderboard
          </Button>
          <Button variant="outline" className="gap-2">
            <Award className="h-4 w-4" />
            How Badges Work
          </Button>
        </div>
      </div>
    </section>
  );
}
