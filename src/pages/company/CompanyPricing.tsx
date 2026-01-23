import { useState } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { PageTransition, AnimatedSection, StaggerContainer, StaggerItem } from '@/components/PageTransition';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { 
  Check, 
  X, 
  Zap, 
  Building2, 
  Crown, 
  Rocket,
  Lock,
  Mail,
  Phone,
  Globe,
  ArrowRight,
  Sparkles,
  Shield,
  Users,
  FileText,
  BarChart3
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const plans = [
  {
    name: 'Basic',
    price: 'Free',
    description: 'For small teams getting started with sustainability tracking',
    icon: Zap,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    features: [
      { name: 'Up to 10 employees', included: true },
      { name: 'Basic ESG dashboard', included: true },
      { name: 'Monthly carbon report', included: true },
      { name: 'Email support', included: true },
      { name: 'PDF reports', included: false },
      { name: 'CSV data export', included: false },
      { name: 'API access', included: false },
      { name: 'White-label reports', included: false },
      { name: 'Dedicated account manager', included: false },
    ],
    cta: 'Current Plan',
    disabled: true
  },
  {
    name: 'Pro',
    price: '₹4,999',
    period: '/month',
    description: 'For growing companies serious about ESG compliance',
    icon: Crown,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    popular: true,
    features: [
      { name: 'Up to 100 employees', included: true },
      { name: 'Advanced ESG dashboard', included: true },
      { name: 'Weekly & monthly reports', included: true },
      { name: 'Priority email support', included: true },
      { name: 'PDF reports', included: true },
      { name: 'CSV data export', included: true },
      { name: 'API access', included: false },
      { name: 'White-label reports', included: false },
      { name: 'Dedicated account manager', included: false },
    ],
    cta: 'Coming Soon',
    comingSoon: true
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For large organizations with complex ESG requirements',
    icon: Rocket,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    features: [
      { name: 'Unlimited employees', included: true },
      { name: 'Custom ESG dashboard', included: true },
      { name: 'Real-time reports', included: true },
      { name: '24/7 priority support', included: true },
      { name: 'PDF reports', included: true },
      { name: 'CSV data export', included: true },
      { name: 'Full API access', included: true },
      { name: 'White-label reports', included: true },
      { name: 'Dedicated account manager', included: true },
    ],
    cta: 'Contact Sales',
    enterprise: true
  }
];

export default function CompanyPricing() {
  const { user } = useAuth();
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [showComingSoonDialog, setShowComingSoonDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: user?.email || '',
    phone: '',
    employees: '',
    message: ''
  });

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Save lead to database (using newsletters table for now as a lead capture)
      const { error } = await supabase
        .from('newsletters')
        .insert({ email: formData.email });

      if (error && !error.message.includes('duplicate')) {
        throw error;
      }

      toast.success('Request submitted!', {
        description: 'Our team will contact you within 24 hours.'
      });
      setShowContactDialog(false);
      setFormData({
        companyName: '',
        contactName: '',
        email: user?.email || '',
        phone: '',
        employees: '',
        message: ''
      });
    } catch (error) {
      console.error('Error submitting lead:', error);
      toast.error('Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <PageTransition>
        <main className="container mx-auto px-4 py-12 max-w-6xl">
          {/* Header */}
          <AnimatedSection delay={0} className="text-center mb-12">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/30">
              <Sparkles className="h-3 w-3 mr-1" />
              ESG Subscription Plans
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Choose Your ESG Plan
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Unlock powerful environmental reporting for your organization. 
              Track carbon, water, and waste metrics with enterprise-grade accuracy.
            </p>
          </AnimatedSection>

          {/* Early Adopter Banner */}
          <AnimatedSection delay={0.1}>
            <div className="mb-12 p-6 rounded-2xl bg-gradient-to-r from-green-500/10 via-primary/10 to-secondary/10 border border-primary/20">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-green-500/20">
                    <Sparkles className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">🎉 Early Adopter Offer</h3>
                    <p className="text-muted-foreground">First 3 months FREE for companies signing up during our beta!</p>
                  </div>
                </div>
                <Button onClick={() => setShowContactDialog(true)} className="rounded-xl">
                  Claim Offer
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </AnimatedSection>

          {/* Pricing Cards */}
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {plans.map((plan, index) => (
              <StaggerItem key={plan.name}>
                <Card className={`relative h-full flex flex-col ${plan.popular ? 'border-primary shadow-xl shadow-primary/10' : ''}`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="text-center pb-4">
                    <div className={`mx-auto p-3 rounded-xl ${plan.bgColor} w-fit mb-4`}>
                      <plan.icon className={`h-6 w-6 ${plan.color}`} />
                    </div>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
                    </div>
                    <CardDescription className="mt-2">{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <ul className="space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature.name} className="flex items-center gap-3">
                          {feature.included ? (
                            <div className="p-1 rounded-full bg-green-500/20">
                              <Check className="h-3 w-3 text-green-500" />
                            </div>
                          ) : (
                            <div className="p-1 rounded-full bg-muted">
                              <X className="h-3 w-3 text-muted-foreground" />
                            </div>
                          )}
                          <span className={feature.included ? '' : 'text-muted-foreground'}>
                            {feature.name}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    {plan.disabled ? (
                      <Button disabled className="w-full rounded-xl" variant="outline">
                        {plan.cta}
                      </Button>
                    ) : plan.comingSoon ? (
                      <Button 
                        className="w-full rounded-xl" 
                        variant="outline"
                        onClick={() => setShowComingSoonDialog(true)}
                      >
                        <Lock className="h-4 w-4 mr-2" />
                        {plan.cta}
                      </Button>
                    ) : (
                      <Button 
                        className="w-full rounded-xl" 
                        onClick={() => setShowContactDialog(true)}
                      >
                        {plan.cta}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>

          {/* Features Grid */}
          <AnimatedSection delay={0.4}>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Why Choose EcoPulse ESG?</h2>
              <p className="text-muted-foreground">Enterprise-grade sustainability tracking for modern organizations</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: Shield, title: 'Data Privacy', desc: 'Employee opt-in model with anonymized metrics' },
                { icon: BarChart3, title: 'Real-time Insights', desc: 'Live dashboard with trend analysis' },
                { icon: FileText, title: 'Compliance Ready', desc: 'Reports aligned with global ESG standards' },
                { icon: Users, title: 'Team Engagement', desc: 'Gamification to boost participation' },
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <Card className="text-center h-full">
                    <CardContent className="p-6">
                      <div className="mx-auto p-3 rounded-xl bg-primary/10 w-fit mb-4">
                        <feature.icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-semibold mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </AnimatedSection>

          {/* CTA Section */}
          <AnimatedSection delay={0.6} className="mt-16 text-center">
            <Card className="bg-gradient-to-br from-primary/5 via-background to-secondary/5 border-primary/20">
              <CardContent className="p-8 md:p-12">
                <Building2 className="h-12 w-12 text-primary mx-auto mb-4" />
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                  Ready to Transform Your ESG Reporting?
                </h2>
                <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                  Join 100+ companies already using EcoPulse to track and improve their environmental impact. 
                  Get started with our free trial today.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="rounded-xl" onClick={() => setShowContactDialog(true)}>
                    Request Enterprise Demo
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                  <Link to="/company/dashboard">
                    <Button size="lg" variant="outline" className="rounded-xl">
                      Explore Free Dashboard
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </AnimatedSection>
        </main>
      </PageTransition>

      {/* Coming Soon Dialog */}
      <Dialog open={showComingSoonDialog} onOpenChange={setShowComingSoonDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="mx-auto p-4 rounded-full bg-amber-500/10 w-fit mb-4">
              <Lock className="h-8 w-8 text-amber-500" />
            </div>
            <DialogTitle className="text-2xl">Payments Coming Soon</DialogTitle>
            <DialogDescription className="text-base">
              We are currently onboarding with Stripe for secure payment processing. 
              Enterprise customers can request early access below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <p className="text-sm text-muted-foreground text-center">
              🎉 Early adopters get <strong>3 months FREE</strong> when payments go live!
            </p>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1 rounded-xl"
                onClick={() => setShowComingSoonDialog(false)}
              >
                Maybe Later
              </Button>
              <Button 
                className="flex-1 rounded-xl"
                onClick={() => {
                  setShowComingSoonDialog(false);
                  setShowContactDialog(true);
                }}
              >
                Request Early Access
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Contact/Lead Dialog */}
      <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Request ESG Demo
            </DialogTitle>
            <DialogDescription>
              Fill in your details and our team will contact you within 24 hours.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleContactSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  placeholder="EcoTech Solutions"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactName">Your Name</Label>
                <Input
                  id="contactName"
                  placeholder="John Doe"
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Work Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone (Optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="employees">Number of Employees</Label>
              <Input
                id="employees"
                placeholder="50-100"
                value={formData.employees}
                onChange={(e) => setFormData({ ...formData, employees: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Tell us about your ESG goals (Optional)</Label>
              <Textarea
                id="message"
                placeholder="We want to track carbon emissions across our 3 offices..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={3}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1 rounded-xl"
                onClick={() => setShowContactDialog(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1 rounded-xl"
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit Request'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
