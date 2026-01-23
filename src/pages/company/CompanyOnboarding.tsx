import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/Navbar';
import { PageTransition, AnimatedSection } from '@/components/PageTransition';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { 
  Building2, 
  ArrowRight, 
  ArrowLeft,
  Check,
  Globe,
  Users,
  Leaf,
  Shield,
  Sparkles,
  Mail
} from 'lucide-react';

const steps = [
  { id: 1, title: 'Company Info', icon: Building2 },
  { id: 2, title: 'Admin Setup', icon: Shield },
  { id: 3, title: 'Review', icon: Check },
];

export default function CompanyOnboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    domain: '',
    industry: '',
    employeeCount: '',
    adminName: '',
    adminEmail: user?.email || '',
    enableDomainMatching: true,
    agreeToTerms: false
  });

  const handleNext = () => {
    if (currentStep === 1) {
      if (!formData.companyName || !formData.domain) {
        toast.error('Please fill in required fields');
        return;
      }
    }
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Please sign in to create a company');
      navigate('/auth');
      return;
    }

    if (!formData.agreeToTerms) {
      toast.error('Please agree to the terms and conditions');
      return;
    }

    setLoading(true);
    try {
      // Create company in database with owner_id set to current user
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert({
          name: formData.companyName,
          domain: formData.domain,
          owner_id: user.id, // REQUIRED: Set the owner for RLS to pass
          plan: 'free',
          settings: {
            industry: formData.industry,
            employee_count: formData.employeeCount,
            domain_matching: formData.enableDomainMatching
          }
        })
        .select()
        .single();

      if (companyError) throw companyError;

      // Add current user as admin
      const { error: userError } = await supabase
        .from('company_users')
        .insert({
          company_id: company.id,
          user_id: user.id,
          email: user.email ?? formData.adminEmail,
          role: 'admin',
          is_active: true,
          opted_in: true,
          opted_in_at: new Date().toISOString()
        });

      if (userError) throw userError;

      toast.success('Company created successfully!', {
        description: 'Welcome to EcoPulse ESG Dashboard'
      });

      navigate('/company/dashboard');
    } catch (error) {
      console.error('Onboarding error:', error);
      const message =
        typeof error === 'object' && error && 'message' in error
          ? String((error as any).message)
          : 'Failed to create company. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <PageTransition>
        <main className="container mx-auto px-4 py-12 max-w-2xl">
          {/* Header */}
          <AnimatedSection delay={0} className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">ESG Onboarding</span>
            </div>
            <h1 className="text-3xl font-bold mb-2">Set Up Your Company</h1>
            <p className="text-muted-foreground">
              Create your organization's ESG dashboard in minutes
            </p>
          </AnimatedSection>

          {/* Progress Steps */}
          <AnimatedSection delay={0.1}>
            <div className="flex items-center justify-center gap-4 mb-8">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <motion.div
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
                      currentStep === step.id
                        ? 'bg-primary text-primary-foreground'
                        : currentStep > step.id
                        ? 'bg-green-500/20 text-green-600'
                        : 'bg-accent text-muted-foreground'
                    }`}
                    animate={{ scale: currentStep === step.id ? 1.05 : 1 }}
                  >
                    {currentStep > step.id ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <step.icon className="h-4 w-4" />
                    )}
                    <span className="text-sm font-medium hidden sm:inline">{step.title}</span>
                  </motion.div>
                  {index < steps.length - 1 && (
                    <div className={`w-8 h-0.5 mx-2 ${currentStep > step.id ? 'bg-green-500' : 'bg-border'}`} />
                  )}
                </div>
              ))}
            </div>
          </AnimatedSection>

          {/* Form Card */}
          <AnimatedSection delay={0.2}>
            <Card>
              <CardContent className="p-6">
                {/* Step 1: Company Info */}
                {currentStep === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="text-center mb-6">
                      <Building2 className="h-12 w-12 text-primary mx-auto mb-4" />
                      <h2 className="text-xl font-semibold">Company Information</h2>
                      <p className="text-sm text-muted-foreground">Tell us about your organization</p>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="companyName">Company Name *</Label>
                        <Input
                          id="companyName"
                          placeholder="EcoTech Solutions"
                          value={formData.companyName}
                          onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                          className="rounded-xl"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="domain">Company Domain *</Label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="domain"
                            placeholder="ecotech.com"
                            value={formData.domain}
                            onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                            className="pl-10 rounded-xl"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Used for automatic employee matching
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="industry">Industry</Label>
                          <Input
                            id="industry"
                            placeholder="Technology"
                            value={formData.industry}
                            onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                            className="rounded-xl"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="employeeCount">Employees</Label>
                          <Input
                            id="employeeCount"
                            placeholder="50-100"
                            value={formData.employeeCount}
                            onChange={(e) => setFormData({ ...formData, employeeCount: e.target.value })}
                            className="rounded-xl"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Admin Setup */}
                {currentStep === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="text-center mb-6">
                      <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
                      <h2 className="text-xl font-semibold">Admin Account</h2>
                      <p className="text-sm text-muted-foreground">You'll be the company admin</p>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="adminName">Your Name</Label>
                        <Input
                          id="adminName"
                          placeholder="John Doe"
                          value={formData.adminName}
                          onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                          className="rounded-xl"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="adminEmail">Admin Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="adminEmail"
                            type="email"
                            value={formData.adminEmail}
                            onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                            className="pl-10 rounded-xl"
                            disabled
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Using your logged-in email
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            id="domainMatching"
                            checked={formData.enableDomainMatching}
                            onCheckedChange={(checked) => 
                              setFormData({ ...formData, enableDomainMatching: checked as boolean })
                            }
                          />
                          <div>
                            <Label htmlFor="domainMatching" className="font-medium cursor-pointer">
                              Enable Domain Matching
                            </Label>
                            <p className="text-xs text-muted-foreground mt-1">
                              Users signing up with @{formData.domain || 'yourcompany.com'} will see an option to join your organization
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Review */}
                {currentStep === 3 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="text-center mb-6">
                      <Check className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <h2 className="text-xl font-semibold">Review & Confirm</h2>
                      <p className="text-sm text-muted-foreground">Make sure everything looks correct</p>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-accent/30">
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-primary" />
                          Company Details
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Name</span>
                            <span className="font-medium">{formData.companyName || '—'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Domain</span>
                            <span className="font-medium">{formData.domain || '—'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Industry</span>
                            <span className="font-medium">{formData.industry || '—'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Employees</span>
                            <span className="font-medium">{formData.employeeCount || '—'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-accent/30">
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <Shield className="h-4 w-4 text-primary" />
                          Admin Account
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Email</span>
                            <span className="font-medium">{formData.adminEmail}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Domain Matching</span>
                            <span className="font-medium">{formData.enableDomainMatching ? 'Enabled' : 'Disabled'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            id="terms"
                            checked={formData.agreeToTerms}
                            onCheckedChange={(checked) => 
                              setFormData({ ...formData, agreeToTerms: checked as boolean })
                            }
                          />
                          <div>
                            <Label htmlFor="terms" className="text-sm cursor-pointer">
                              I agree to the Terms of Service and Privacy Policy, including the data processing 
                              agreement for employee ESG data.
                            </Label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Navigation Buttons */}
                <div className="flex gap-3 mt-8">
                  {currentStep > 1 && (
                    <Button
                      variant="outline"
                      className="flex-1 rounded-xl"
                      onClick={handleBack}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back
                    </Button>
                  )}
                  {currentStep < 3 ? (
                    <Button
                      className="flex-1 rounded-xl"
                      onClick={handleNext}
                    >
                      Next
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      className="flex-1 rounded-xl"
                      onClick={handleSubmit}
                      disabled={loading || !formData.agreeToTerms}
                    >
                      {loading ? 'Creating...' : 'Create Company'}
                      <Check className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </AnimatedSection>

          {/* Features Preview */}
          <AnimatedSection delay={0.3} className="mt-8">
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: Leaf, label: 'Track Carbon' },
                { icon: Users, label: 'Team Insights' },
                { icon: Shield, label: 'ESG Reports' },
              ].map((feature) => (
                <div key={feature.label} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-accent/30">
                  <feature.icon className="h-6 w-6 text-primary" />
                  <span className="text-sm text-muted-foreground">{feature.label}</span>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </main>
      </PageTransition>
    </div>
  );
}
