import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CampaignCard } from './CampaignCard';
import { CreateCampaignDialog } from './CreateCampaignDialog';
import { CampaignCheckInDialog } from './CampaignCheckInDialog';
import { CampaignManagement } from './CampaignManagement';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, MapPin, RefreshCw, Bell } from 'lucide-react';

interface Campaign {
  id: string;
  title: string;
  description: string;
  city: string;
  lat: number;
  lng: number;
  start_time: string;
  end_time: string;
  capacity: number;
  owner_id: string;
  participant_count?: number;
  distance_km?: number;
  user_status?: string;
  is_owner?: boolean;
  image_url?: string;
  owner?: {
    display_name?: string;
    username?: string;
  };
}

export const CampaignList: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [checkInCampaign, setCheckInCampaign] = useState<Campaign | null>(null);
  const [manageCampaign, setManageCampaign] = useState<Campaign | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchCampaigns = async (filter = 'all') => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('filter', filter);
      
      if (userLocation) {
        params.set('lat', userLocation.lat.toString());
        params.set('lng', userLocation.lng.toString());
      }
      
      if (user?.id) {
        params.set('user_id', user.id);
      }

      const response = await supabase.functions.invoke('campaign-list', {
        method: 'GET',
        body: null,
        headers: {}
      });

      // Since campaign-list uses GET params, we need to call it differently
      const { data, error } = await supabase
        .from('campaigns')
        .select(`
          *,
          campaign_participants(user_id, status)
        `)
        .eq('visibility', 'public')
        .order('start_time', { ascending: true });

      if (error) throw error;

      // Process campaigns with participant counts
      const processedCampaigns = (data || []).map(c => {
        const participants = c.campaign_participants || [];
        const activeParticipants = participants.filter(
          (p: any) => ['approved', 'checked_in', 'completed'].includes(p.status)
        );
        const userParticipation = user ? participants.find((p: any) => p.user_id === user.id) : null;
        
        return {
          ...c,
          participant_count: activeParticipants.length,
          user_status: userParticipation?.status || null,
          is_owner: c.owner_id === user?.id,
          campaign_participants: undefined // Remove from response
        };
      });

      // Apply tab filter
      let filtered = processedCampaigns;
      if (filter === 'upcoming') {
        filtered = processedCampaigns.filter(c => new Date(c.start_time) > new Date());
      } else if (filter === 'my') {
        filtered = processedCampaigns.filter(c => c.user_status || c.is_owner);
      } else if (filter === 'nearby' && userLocation) {
        filtered = processedCampaigns
          .map(c => ({
            ...c,
            distance_km: calculateDistance(userLocation.lat, userLocation.lng, c.lat, c.lng)
          }))
          .filter(c => c.distance_km <= 30)
          .sort((a, b) => a.distance_km - b.distance_km);
      }

      setCampaigns(filtered);
    } catch (error) {
      console.error('Fetch error:', error);
      toast({ title: 'Failed to load campaigns', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(1));
  };

  const fetchNotifications = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('campaign_notifications')
      .select('*, campaigns(title, start_time)')
      .eq('user_id', user.id)
      .order('sent_at', { ascending: false })
      .limit(5);

    setNotifications(data || []);
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
        },
        (err) => console.log('Location error:', err)
      );
    }
  };

  useEffect(() => {
    getUserLocation();
    fetchCampaigns(activeTab);
    fetchNotifications();
  }, [user]);

  useEffect(() => {
    fetchCampaigns(activeTab);
  }, [activeTab, userLocation]);

  const handleJoin = async (campaignId: string) => {
    if (!user) {
      toast({ title: 'Please sign in to join', variant: 'destructive' });
      return;
    }

    setJoiningId(campaignId);
    try {
      const response = await supabase.functions.invoke('campaign-join', {
        body: { campaign_id: campaignId }
      });

      if (response.error) throw new Error(response.error.message);

      toast({ title: '🎉 ' + response.data.message });
      fetchCampaigns(activeTab);
    } catch (error: any) {
      console.error('Join error:', error);
      toast({ title: error.message || 'Failed to join', variant: 'destructive' });
    } finally {
      setJoiningId(null);
    }
  };

  const handleCheckIn = (campaignId: string) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    if (campaign) {
      setCheckInCampaign(campaign);
    }
  };

  const handleCheckInComplete = () => {
    setCheckInCampaign(null);
    fetchCampaigns(activeTab);
    toast({ title: '✅ Checked in successfully!' });
  };

  const handleManage = (campaignId: string) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    if (campaign) {
      setManageCampaign(campaign);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          🌱 Go-Green Campaigns
        </CardTitle>
        <div className="flex gap-2">
          {notifications.length > 0 && (
            <Button variant="outline" size="sm" className="relative">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {notifications.length}
              </span>
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => fetchCampaigns(activeTab)}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <CreateCampaignDialog onCampaignCreated={() => fetchCampaigns(activeTab)} />
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="nearby">
              <MapPin className="w-3 h-3 mr-1" />
              Nearby
            </TabsTrigger>
            <TabsTrigger value="my">My Campaigns</TabsTrigger>
          </TabsList>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-4xl mb-2">🌿</p>
              <p>No campaigns found</p>
              <p className="text-sm mt-1">Be the first to create one!</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {campaigns.map((campaign) => (
                <CampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  onJoin={handleJoin}
                  onCheckIn={handleCheckIn}
                  onManage={handleManage}
                  isJoining={joiningId === campaign.id}
                />
              ))}
            </div>
          )}
        </Tabs>
      </CardContent>

      {checkInCampaign && (
        <CampaignCheckInDialog
          campaign={checkInCampaign}
          open={!!checkInCampaign}
          onClose={() => setCheckInCampaign(null)}
          onSuccess={handleCheckInComplete}
        />
      )}

      {manageCampaign && (
        <CampaignManagement
          campaign={manageCampaign}
          open={!!manageCampaign}
          onClose={() => {
            setManageCampaign(null);
            fetchCampaigns(activeTab);
          }}
        />
      )}
    </Card>
  );
};
