import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Users, Award, CheckCircle, Download, Eye } from 'lucide-react';
import { format } from 'date-fns';

interface Participant {
  id: string;
  user_id: string;
  status: string;
  requested_at: string;
  checked_in_at: string | null;
  completed_at: string | null;
  user_profiles?: {
    display_name: string;
    email: string;
  };
}

interface Campaign {
  id: string;
  title: string;
  owner_id: string;
}

interface CampaignManagementProps {
  campaign: Campaign;
  open: boolean;
  onClose: () => void;
}

export const CampaignManagement: React.FC<CampaignManagementProps> = ({
  campaign,
  open,
  onClose
}) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingCert, setGeneratingCert] = useState<string | null>(null);
  const [certificates, setCertificates] = useState<any[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchParticipants = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('campaign_participants')
        .select('*')
        .eq('campaign_id', campaign.id)
        .order('requested_at', { ascending: false });

      if (error) throw error;
      
      // Fetch user profiles separately
      const userIds = (data || []).map(p => p.user_id);
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('user_id, display_name, email')
        .in('user_id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
      const enriched = (data || []).map(p => ({
        ...p,
        user_profiles: profileMap.get(p.user_id) || { display_name: 'Unknown', email: '' }
      }));
      
      setParticipants(enriched as any);

      // Fetch existing certificates
      const { data: certs } = await supabase
        .from('campaign_certificates')
        .select('*')
        .eq('campaign_id', campaign.id);

      setCertificates(certs || []);
    } catch (error) {
      console.error('Fetch error:', error);
      toast({ title: 'Failed to load participants', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchParticipants();
    }
  }, [open, campaign.id]);

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      requested: 'bg-yellow-500',
      approved: 'bg-blue-500',
      rejected: 'bg-red-500',
      checked_in: 'bg-green-500',
      completed: 'bg-purple-500'
    };
    return <Badge className={colors[status] || 'bg-gray-500'}>{status}</Badge>;
  };

  const handleApprove = async (participantId: string, userId: string) => {
    try {
      await supabase
        .from('campaign_participants')
        .update({ 
          status: 'approved', 
          approved_by: user?.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', participantId);

      toast({ title: 'Participant approved!' });
      fetchParticipants();
    } catch (error) {
      toast({ title: 'Failed to approve', variant: 'destructive' });
    }
  };

  const handleGenerateCertificate = async (participantUserId: string) => {
    setGeneratingCert(participantUserId);
    try {
      const response = await supabase.functions.invoke('campaign-certificate', {
        body: {
          campaign_id: campaign.id,
          participant_user_id: participantUserId
        }
      });

      if (response.error) throw new Error(response.error.message);
      if (response.data.error) throw new Error(response.data.error);

      toast({ title: '🎉 Certificate generated!' });
      fetchParticipants();
    } catch (error: any) {
      console.error('Certificate error:', error);
      toast({ title: error.message || 'Failed to generate certificate', variant: 'destructive' });
    } finally {
      setGeneratingCert(null);
    }
  };

  const handleBulkGenerateCertificates = async () => {
    setGeneratingCert('bulk');
    try {
      const response = await supabase.functions.invoke('campaign-certificate', {
        body: {
          campaign_id: campaign.id,
          bulk_generate: true
        }
      });

      if (response.error) throw new Error(response.error.message);

      toast({ title: `🎉 ${response.data.certificates?.length || 0} certificates generated!` });
      fetchParticipants();
    } catch (error: any) {
      toast({ title: error.message || 'Failed to generate certificates', variant: 'destructive' });
    } finally {
      setGeneratingCert(null);
    }
  };

  const hasCertificate = (userId: string) => {
    return certificates.some(c => c.user_id === userId);
  };

  const eligibleForCert = participants.filter(
    p => ['checked_in', 'completed'].includes(p.status)
  ).length;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Manage: {campaign.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-3">
            <Card className="p-3">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{participants.length}</p>
            </Card>
            <Card className="p-3">
              <p className="text-sm text-muted-foreground">Approved</p>
              <p className="text-2xl font-bold text-blue-600">
                {participants.filter(p => p.status === 'approved').length}
              </p>
            </Card>
            <Card className="p-3">
              <p className="text-sm text-muted-foreground">Checked In</p>
              <p className="text-2xl font-bold text-green-600">
                {participants.filter(p => p.status === 'checked_in').length}
              </p>
            </Card>
            <Card className="p-3">
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold text-purple-600">
                {participants.filter(p => p.status === 'completed').length}
              </p>
            </Card>
          </div>

          {/* Bulk actions */}
          {eligibleForCert > 0 && (
            <div className="flex justify-end">
              <Button
                onClick={handleBulkGenerateCertificates}
                disabled={generatingCert === 'bulk'}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {generatingCert === 'bulk' ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Award className="w-4 h-4 mr-2" />
                )}
                Generate All Certificates ({eligibleForCert})
              </Button>
            </div>
          )}

          {/* Participants table */}
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : participants.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No participants yet
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Participant</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Checked In</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {participants.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {(p as any).user_profiles?.display_name || 'Unknown'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(p as any).user_profiles?.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(p.status)}</TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(p.requested_at), 'MMM d, h:mm a')}
                    </TableCell>
                    <TableCell className="text-sm">
                      {p.checked_in_at 
                        ? format(new Date(p.checked_in_at), 'MMM d, h:mm a')
                        : '-'
                      }
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {p.status === 'requested' && (
                          <Button
                            size="sm"
                            onClick={() => handleApprove(p.id, p.user_id)}
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Approve
                          </Button>
                        )}
                        {['checked_in', 'completed'].includes(p.status) && !hasCertificate(p.user_id) && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleGenerateCertificate(p.user_id)}
                            disabled={generatingCert === p.user_id}
                          >
                            {generatingCert === p.user_id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Award className="w-3 h-3 mr-1" />
                            )}
                            Certificate
                          </Button>
                        )}
                        {hasCertificate(p.user_id) && (
                          <Badge variant="secondary">
                            <Award className="w-3 h-3 mr-1" />
                            Certified
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
