import { useState } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { PageTransition, AnimatedSection, StaggerContainer, StaggerItem } from '@/components/PageTransition';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { 
  Users, 
  UserPlus, 
  Mail, 
  Search,
  Check,
  Clock,
  X,
  Shield,
  Copy,
  RefreshCw,
  MoreHorizontal,
  Filter,
  Download,
  Building2,
  Leaf
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock employee data
const mockEmployees = [
  { id: 1, name: 'Priya Sharma', email: 'priya@ecotech.com', role: 'admin', status: 'active', optedIn: true, joinedAt: '2025-12-01', carbonSaved: 245 },
  { id: 2, name: 'Rahul Verma', email: 'rahul@ecotech.com', role: 'employee', status: 'active', optedIn: true, joinedAt: '2025-12-05', carbonSaved: 189 },
  { id: 3, name: 'Anita Patel', email: 'anita@ecotech.com', role: 'employee', status: 'active', optedIn: true, joinedAt: '2025-12-10', carbonSaved: 312 },
  { id: 4, name: 'Vikram Singh', email: 'vikram@ecotech.com', role: 'employee', status: 'active', optedIn: false, joinedAt: '2025-12-15', carbonSaved: 0 },
  { id: 5, name: 'Neha Gupta', email: 'neha@ecotech.com', role: 'employee', status: 'pending', optedIn: false, joinedAt: null, carbonSaved: 0 },
  { id: 6, name: 'Amit Kumar', email: 'amit@ecotech.com', role: 'employee', status: 'pending', optedIn: false, joinedAt: null, carbonSaved: 0 },
];

export default function CompanyEmployees() {
  const [employees, setEmployees] = useState(mockEmployees);
  const [searchQuery, setSearchQuery] = useState('');
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmails, setInviteEmails] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: employees.length,
    active: employees.filter(e => e.status === 'active').length,
    pending: employees.filter(e => e.status === 'pending').length,
    optedIn: employees.filter(e => e.optedIn).length,
  };

  const handleInvite = async () => {
    setInviteLoading(true);
    // Simulate invite sending
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const emails = inviteEmails.split(/[,\n]/).map(e => e.trim()).filter(e => e);
    
    toast.success(`Invites sent to ${emails.length} email(s)!`, {
      description: 'They will receive an invitation link shortly.'
    });
    
    setShowInviteDialog(false);
    setInviteEmails('');
    setInviteLoading(false);
  };

  const handleResendInvite = (email: string) => {
    toast.success(`Invite resent to ${email}`);
  };

  const handleCopyInviteLink = () => {
    navigator.clipboard.writeText(`https://ecopulse.app/join/ecotech-abc123`);
    toast.success('Invite link copied to clipboard!');
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
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <h1 className="text-3xl font-bold">Team Management</h1>
                </div>
                <p className="text-muted-foreground">
                  Invite employees and manage sustainability participation
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="rounded-xl" onClick={handleCopyInviteLink}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Invite Link
                </Button>
                <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
                  <DialogTrigger asChild>
                    <Button className="rounded-xl">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Invite Employees
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Invite Team Members</DialogTitle>
                      <DialogDescription>
                        Send email invitations to add employees to your ESG program.
                        They can opt-in to share their sustainability data.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label htmlFor="emails">Email Addresses</Label>
                        <textarea
                          id="emails"
                          className="flex min-h-[120px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          placeholder="Enter email addresses (one per line or comma-separated)"
                          value={inviteEmails}
                          onChange={(e) => setInviteEmails(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                          Separate multiple emails with commas or new lines
                        </p>
                      </div>
                      <div className="p-4 rounded-xl bg-accent/30 space-y-2">
                        <h4 className="font-medium text-sm flex items-center gap-2">
                          <Shield className="h-4 w-4 text-primary" />
                          Privacy First
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          Employees must explicitly opt-in to share their data. 
                          Only aggregated, anonymized metrics are visible to admins by default.
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          className="flex-1 rounded-xl"
                          onClick={() => setShowInviteDialog(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          className="flex-1 rounded-xl"
                          onClick={handleInvite}
                          disabled={!inviteEmails.trim() || inviteLoading}
                        >
                          {inviteLoading ? 'Sending...' : 'Send Invites'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </AnimatedSection>

          {/* Stats Cards */}
          <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StaggerItem>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Employees</p>
                      <p className="text-2xl font-bold">{stats.total}</p>
                    </div>
                    <div className="p-2 rounded-xl bg-primary/10">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>
            <StaggerItem>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Active</p>
                      <p className="text-2xl font-bold">{stats.active}</p>
                    </div>
                    <div className="p-2 rounded-xl bg-green-500/10">
                      <Check className="h-5 w-5 text-green-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>
            <StaggerItem>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Pending</p>
                      <p className="text-2xl font-bold">{stats.pending}</p>
                    </div>
                    <div className="p-2 rounded-xl bg-amber-500/10">
                      <Clock className="h-5 w-5 text-amber-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>
            <StaggerItem>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Opted In</p>
                      <p className="text-2xl font-bold">{stats.optedIn}</p>
                    </div>
                    <div className="p-2 rounded-xl bg-blue-500/10">
                      <Leaf className="h-5 w-5 text-blue-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>
          </StaggerContainer>

          {/* Domain Matching Info */}
          <AnimatedSection delay={0.2}>
            <Card className="mb-8 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">Auto Domain Matching Enabled</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      New users signing up with <strong>@ecotech.com</strong> email addresses will automatically 
                      see an option to join your organization.
                    </p>
                    <div className="flex gap-2">
                      <Badge variant="outline">ecotech.com</Badge>
                      <Badge variant="secondary">+47 auto-matched</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </AnimatedSection>

          {/* Employees Table */}
          <AnimatedSection delay={0.3}>
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle>Employees</CardTitle>
                    <CardDescription>Manage your team's sustainability participation</CardDescription>
                  </div>
                  <div className="flex gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search employees..."
                        className="pl-9 w-64 rounded-xl"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Button variant="outline" size="icon" className="rounded-xl">
                      <Filter className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="rounded-xl">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-xl border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Opted In</TableHead>
                        <TableHead>Carbon Saved</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEmployees.map((employee) => (
                        <TableRow key={employee.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-sm font-medium text-primary">
                                  {employee.name.split(' ').map(n => n[0]).join('')}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium">{employee.name}</p>
                                <p className="text-sm text-muted-foreground">{employee.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={employee.role === 'admin' ? 'default' : 'secondary'}>
                              {employee.role === 'admin' && <Shield className="h-3 w-3 mr-1" />}
                              {employee.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {employee.status === 'active' ? (
                              <Badge className="bg-green-500/20 text-green-600 border-green-500/30">
                                <Check className="h-3 w-3 mr-1" />
                                Active
                              </Badge>
                            ) : (
                              <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30">
                                <Clock className="h-3 w-3 mr-1" />
                                Pending
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {employee.optedIn ? (
                              <div className="flex items-center gap-1 text-green-600">
                                <Check className="h-4 w-4" />
                                <span className="text-sm">Yes</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <X className="h-4 w-4" />
                                <span className="text-sm">No</span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {employee.carbonSaved > 0 ? (
                              <span className="font-medium text-green-600">{employee.carbonSaved} kg</span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="rounded-xl">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {employee.status === 'pending' && (
                                  <DropdownMenuItem onClick={() => handleResendInvite(employee.email)}>
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Resend Invite
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem>
                                  <Mail className="h-4 w-4 mr-2" />
                                  Send Message
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive">
                                  <X className="h-4 w-4 mr-2" />
                                  Remove
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </AnimatedSection>
        </main>
      </PageTransition>
    </div>
  );
}
