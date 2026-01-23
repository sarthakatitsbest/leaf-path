import React from 'react';
import { Navbar } from '@/components/Navbar';
import { PageTransition } from '@/components/PageTransition';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Leaf,
  Users,
  BarChart3,
  FileText,
  Shield,
  CheckCircle,
  ArrowRight,
  TrendingDown,
  Award,
  Globe,
  Lock
} from 'lucide-react';

const features = [
  {
    icon: BarChart3,
    title: 'ESG Dashboard',
    description: 'Real-time environmental metrics, carbon tracking, and sustainability KPIs for your entire organization.',
  },
  {
    icon: Users,
    title: 'Employee Engagement',
    description: 'Privacy-first opt-in system. Employees choose to share aggregated, anonymized data.',
  },
  {
    icon: FileText,
    title: 'Compliance Reports',
    description: 'Auto-generated ESG reports (PDF/CSV) for regulatory compliance and stakeholder presentations.',
  },
  {
    icon: TrendingDown,
    title: 'Carbon Reduction',
    description: 'Track company-wide carbon footprint and measure reduction progress over time.',
  },
  {
    icon: Award,
    title: 'CSR Integration',
    description: 'Sponsor community campaigns and connect employee participation to CSR initiatives.',
  },
  {
    icon: Globe,
    title: 'Industry Benchmarks',
    description: 'Compare your ESG performance against industry standards and competitors.',
  },
];

const plans = [
  {
    name: 'Free',
    price: '₹0',
    period: '/month',
    description: 'For small teams getting started',
    features: ['Up to 10 employees', 'Basic ESG dashboard', 'Monthly reports', 'Email support'],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Pro',
    price: '₹4,999',
    period: '/month',
    description: 'For growing companies',
    features: ['Up to 100 employees', 'Advanced analytics', 'Weekly reports', 'Priority support', 'API access'],
    cta: 'Coming Soon',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For large organizations',
    features: ['Unlimited employees', 'Custom integrations', 'Dedicated support', 'White-label reports', 'SLA guarantee'],
    cta: 'Contact Sales',
    popular: false,
  },
];

const CompanyLanding: React.FC = () => {
  const navigate = useNavigate();

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="container mx-auto px-4 py-12 max-w-7xl">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 px-4 py-2 bg-primary/10 text-primary border-primary/20">
              <Building2 className="w-4 h-4 mr-2" />
              For Businesses
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-poppins font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Company ESG Platform
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Transform employee sustainability actions into measurable ESG metrics. 
              <span className="text-primary font-medium"> Privacy-first. Compliance-ready. Impact-driven.</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => navigate('/company/onboarding')}
                className="rounded-xl gradient-teal-lime border-0 text-white px-8"
              >
                <Building2 className="w-5 h-5 mr-2" />
                Create Company Account
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate('/company/pricing')}
                className="rounded-xl px-8"
              >
                View Pricing
              </Button>
            </div>
          </motion.div>

          {/* What is ESG Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-16"
          >
            <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10">
              <CardContent className="py-8">
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-500 flex items-center justify-center">
                      <Leaf className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Environmental</h3>
                    <p className="text-muted-foreground">Carbon footprint, energy usage, waste reduction, and resource conservation metrics.</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-blue-500 flex items-center justify-center">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Social</h3>
                    <p className="text-muted-foreground">Employee engagement, community impact, CSR campaigns, and wellness initiatives.</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-purple-500 flex items-center justify-center">
                      <Shield className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Governance</h3>
                    <p className="text-muted-foreground">Transparency, compliance reporting, audit trails, and ethical business practices.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.section>

          {/* Features Grid */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-16"
          >
            <h2 className="text-3xl font-bold text-center mb-8">How EcoPulse ESG Works</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, idx) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * idx }}
                  >
                    <Card className="h-full hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <CardTitle>{feature.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-base">{feature.description}</CardDescription>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>

          {/* Privacy Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-16"
          >
            <Card className="border-emerald-500/30 bg-emerald-500/5">
              <CardContent className="py-8">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 rounded-2xl bg-emerald-500 flex items-center justify-center">
                      <Lock className="w-10 h-10 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-3">Privacy-First by Design</h3>
                    <div className="space-y-2">
                      {[
                        'Employees must explicitly opt-in to share any data',
                        'Only aggregated, anonymized metrics visible to company',
                        'No individual tracking without explicit consent',
                        'GDPR and data protection compliant',
                        'Full audit logs for transparency',
                      ].map((point, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-muted-foreground">
                          <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          <span>{point}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.section>

          {/* Quick Pricing Preview */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-16"
          >
            <h2 className="text-3xl font-bold text-center mb-8">Simple, Transparent Pricing</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {plans.map((plan, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * idx }}
                >
                  <Card className={`relative h-full ${plan.popular ? 'ring-2 ring-primary' : ''}`}>
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                      </div>
                    )}
                    <CardHeader className="text-center pt-8">
                      <CardTitle className="text-xl">{plan.name}</CardTitle>
                      <div className="mt-2">
                        <span className="text-4xl font-bold">{plan.price}</span>
                        <span className="text-muted-foreground">{plan.period}</span>
                      </div>
                      <CardDescription>{plan.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 mb-6">
                        {plan.features.map((feature, fIdx) => (
                          <li key={fIdx} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Button 
                        className={`w-full rounded-xl ${plan.popular ? 'gradient-teal-lime border-0 text-white' : ''}`}
                        variant={plan.popular ? 'default' : 'outline'}
                        onClick={() => plan.name === 'Free' ? navigate('/company/onboarding') : navigate('/company/pricing')}
                      >
                        {plan.cta} <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* CTA Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20">
              <CardContent className="py-12 text-center">
                <h2 className="text-3xl font-bold mb-4">Ready to Transform Your ESG Reporting?</h2>
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Join forward-thinking companies that are turning employee sustainability into measurable business impact.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    size="lg" 
                    onClick={() => navigate('/company/onboarding')}
                    className="rounded-xl gradient-teal-lime border-0 text-white px-8"
                  >
                    Start Free Trial <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    onClick={() => navigate('/company/dashboard')}
                    className="rounded-xl px-8"
                  >
                    View Demo Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.section>
        </main>
      </div>
    </PageTransition>
  );
};

export default CompanyLanding;
