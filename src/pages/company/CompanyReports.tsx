import { useState } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { PageTransition, AnimatedSection, StaggerContainer, StaggerItem } from '@/components/PageTransition';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  FileText, 
  Download, 
  Calendar,
  Clock,
  CheckCircle,
  Loader2,
  Eye,
  Sparkles,
  BarChart3,
  Leaf,
  Droplets,
  Trash2,
  Users,
  Target,
  ArrowRight,
  Building2,
  Shield
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Mock reports history
const mockReports = [
  { id: 1, period: 'Q4 2025', type: 'Quarterly', status: 'completed', createdAt: '2026-01-15', downloadUrl: '#' },
  { id: 2, period: 'December 2025', type: 'Monthly', status: 'completed', createdAt: '2026-01-01', downloadUrl: '#' },
  { id: 3, period: 'November 2025', type: 'Monthly', status: 'completed', createdAt: '2025-12-01', downloadUrl: '#' },
  { id: 4, period: 'Q3 2025', type: 'Quarterly', status: 'completed', createdAt: '2025-10-15', downloadUrl: '#' },
];

// Mock report preview data
const mockReportData = {
  period: 'January 2026',
  company: 'EcoTech Solutions',
  metrics: {
    carbon: { value: 1200, change: -12.5, unit: 'kg CO2e' },
    water: { value: 3800, change: -8.2, unit: 'liters' },
    waste: { value: 120, change: -15.3, unit: 'kg' },
    employees: { value: 47, total: 65 },
    campaigns: { completed: 8, active: 3 },
    esgScore: 78
  }
};

export default function CompanyReports() {
  const [selectedPeriod, setSelectedPeriod] = useState('january-2026');
  const [reportType, setReportType] = useState('monthly');
  const [generating, setGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleGenerateReport = async () => {
    setGenerating(true);
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    setGenerating(false);
    toast.success('ESG Report Generated!', {
      description: 'Your PDF report is ready for download.'
    });
    setShowPreview(true);
  };

  const handleDownload = (format: 'pdf' | 'csv') => {
    toast.success(`Downloading ${format.toUpperCase()} report...`, {
      description: 'Your file will be ready shortly.'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <PageTransition>
        <main className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Header */}
          <AnimatedSection delay={0}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <h1 className="text-3xl font-bold">ESG Reports</h1>
                </div>
                <p className="text-muted-foreground">
                  Generate and download comprehensive ESG reports
                </p>
              </div>
              <Link to="/company/dashboard">
                <Button variant="outline" className="rounded-xl">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </AnimatedSection>

          {/* Report Generator */}
          <AnimatedSection delay={0.1}>
            <Card className="mb-8 bg-gradient-to-br from-primary/5 via-background to-secondary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Generate New Report
                </CardTitle>
                <CardDescription>
                  Create a comprehensive ESG report for your organization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Report Period</label>
                    <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="january-2026">January 2026</SelectItem>
                        <SelectItem value="q4-2025">Q4 2025</SelectItem>
                        <SelectItem value="december-2025">December 2025</SelectItem>
                        <SelectItem value="november-2025">November 2025</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Report Type</label>
                    <Select value={reportType} onValueChange={setReportType}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly Summary</SelectItem>
                        <SelectItem value="quarterly">Quarterly Report</SelectItem>
                        <SelectItem value="annual">Annual Report</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button 
                      className="w-full rounded-xl" 
                      onClick={handleGenerateReport}
                      disabled={generating}
                    >
                      {generating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <FileText className="h-4 w-4 mr-2" />
                          Generate Report
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Report Contents Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { icon: Leaf, label: 'Carbon Metrics' },
                    { icon: Droplets, label: 'Water Usage' },
                    { icon: Trash2, label: 'Waste Data' },
                    { icon: Users, label: 'Team Stats' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-2 p-3 rounded-xl bg-accent/30">
                      <item.icon className="h-4 w-4 text-primary" />
                      <span className="text-sm">{item.label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </AnimatedSection>

          {/* Report History */}
          <AnimatedSection delay={0.2}>
            <Card>
              <CardHeader>
                <CardTitle>Report History</CardTitle>
                <CardDescription>Previously generated ESG reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockReports.map((report, index) => (
                    <motion.div
                      key={report.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 rounded-xl border hover:bg-accent/30 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-xl bg-primary/10">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{report.period}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant="outline" className="text-xs">{report.type}</Badge>
                            <span>•</span>
                            <span>Created {new Date(report.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-500/20 text-green-600 border-green-500/30">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                        <Button variant="outline" size="sm" className="rounded-xl" onClick={() => handleDownload('pdf')}>
                          <Download className="h-4 w-4 mr-1" />
                          PDF
                        </Button>
                        <Button variant="outline" size="sm" className="rounded-xl" onClick={() => handleDownload('csv')}>
                          CSV
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </AnimatedSection>

          {/* Methodology Section */}
          <AnimatedSection delay={0.3}>
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Report Methodology
                </CardTitle>
                <CardDescription>How we calculate your ESG metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-accent/30">
                    <h4 className="font-medium mb-2">Data Sources</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Employee activity logs (opted-in only)</li>
                      <li>• Campaign participation records</li>
                      <li>• Self-reported sustainability actions</li>
                    </ul>
                  </div>
                  <div className="p-4 rounded-xl bg-accent/30">
                    <h4 className="font-medium mb-2">Emission Factors</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• IPCC Guidelines 2006 (updated 2019)</li>
                      <li>• DEFRA Conversion Factors 2025</li>
                      <li>• World Bank Climate Data</li>
                    </ul>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <strong>Disclaimer:</strong> This report is based on user-entered activity data from employees who opted in. 
                  Results are estimates for guidance only and should not be used for regulatory compliance without independent verification.
                </p>
              </CardContent>
            </Card>
          </AnimatedSection>
        </main>
      </PageTransition>

      {/* Report Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              ESG Report Preview
            </DialogTitle>
            <DialogDescription>
              {mockReportData.company} • {mockReportData.period}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Report Header */}
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 border">
              <Building2 className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-1">{mockReportData.company}</h2>
              <p className="text-muted-foreground">Environmental, Social & Governance Report</p>
              <Badge className="mt-3">{mockReportData.period}</Badge>
            </div>

            {/* ESG Score */}
            <div className="flex items-center justify-center gap-6 p-6 rounded-xl border">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <span className="text-2xl font-bold text-primary-foreground">{mockReportData.metrics.esgScore}</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold">ESG Performance Score</h3>
                <p className="text-muted-foreground">Top 15% in your industry</p>
              </div>
            </div>

            {/* Metrics Summary */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border text-center">
                <Leaf className="h-6 w-6 text-green-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">{mockReportData.metrics.carbon.value}</p>
                <p className="text-sm text-muted-foreground">{mockReportData.metrics.carbon.unit}</p>
                <Badge className="mt-2 bg-green-500/20 text-green-600">{mockReportData.metrics.carbon.change}%</Badge>
              </div>
              <div className="p-4 rounded-xl border text-center">
                <Droplets className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">{mockReportData.metrics.water.value}</p>
                <p className="text-sm text-muted-foreground">{mockReportData.metrics.water.unit}</p>
                <Badge className="mt-2 bg-blue-500/20 text-blue-600">{mockReportData.metrics.water.change}%</Badge>
              </div>
              <div className="p-4 rounded-xl border text-center">
                <Trash2 className="h-6 w-6 text-amber-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">{mockReportData.metrics.waste.value}</p>
                <p className="text-sm text-muted-foreground">{mockReportData.metrics.waste.unit}</p>
                <Badge className="mt-2 bg-amber-500/20 text-amber-600">{mockReportData.metrics.waste.change}%</Badge>
              </div>
            </div>

            {/* Team Stats */}
            <div className="p-4 rounded-xl border">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Team Participation
              </h4>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Employees opted in</span>
                <span className="font-medium">{mockReportData.metrics.employees.value} / {mockReportData.metrics.employees.total}</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-muted-foreground">Campaigns completed</span>
                <span className="font-medium">{mockReportData.metrics.campaigns.completed}</span>
              </div>
            </div>

            {/* Download Actions */}
            <div className="flex gap-3">
              <Button className="flex-1 rounded-xl" onClick={() => handleDownload('pdf')}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button variant="outline" className="flex-1 rounded-xl" onClick={() => handleDownload('csv')}>
                <Download className="h-4 w-4 mr-2" />
                Download CSV
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
