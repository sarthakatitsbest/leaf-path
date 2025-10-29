import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Mail } from "lucide-react";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("newsletters")
        .insert([{ email }]);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Thanks for subscribing to our newsletter.",
      });
      setEmail("");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Could not subscribe. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mt-12 max-w-6xl mx-auto px-6">
      <div className="bg-primary text-primary-foreground rounded-2xl p-8 shadow-lg">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Mail className="h-6 w-6" />
              <h2 className="text-2xl font-bold">Get Early Access & Updates</h2>
            </div>
            <p className="text-sm opacity-90">
              Join students building sustainable habits — no spam, just meaningful updates.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="flex gap-3 w-full md:w-auto">
            <Input
              type="email"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-background text-foreground min-w-[250px]"
              aria-label="Email address"
            />
            <Button type="submit" disabled={loading} variant="secondary">
              {loading ? "Subscribing..." : "Subscribe"}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
