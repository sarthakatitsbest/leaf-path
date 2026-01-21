import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Users, Clock, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

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

interface CampaignCardProps {
  campaign: Campaign;
  onJoin?: (campaignId: string) => void;
  onCheckIn?: (campaignId: string) => void;
  onViewDetails?: (campaignId: string) => void;
  isJoining?: boolean;
}

export const CampaignCard: React.FC<CampaignCardProps> = ({
  campaign,
  onJoin,
  onCheckIn,
  onViewDetails,
  isJoining
}) => {
  const isUpcoming = new Date(campaign.start_time) > new Date();
  const isOngoing = new Date() >= new Date(campaign.start_time) && new Date() <= new Date(campaign.end_time);
  const isPast = new Date() > new Date(campaign.end_time);

  const getStatusBadge = () => {
    if (campaign.user_status === 'completed') {
      return <Badge className="bg-green-500">✓ Completed</Badge>;
    }
    if (campaign.user_status === 'checked_in') {
      return <Badge className="bg-blue-500">Checked In</Badge>;
    }
    if (campaign.user_status === 'approved') {
      return <Badge className="bg-emerald-500">Joined</Badge>;
    }
    if (campaign.user_status === 'requested') {
      return <Badge variant="secondary">Pending</Badge>;
    }
    if (campaign.is_owner) {
      return <Badge className="bg-purple-500">Organizer</Badge>;
    }
    return null;
  };

  const getTimeStatus = () => {
    if (isOngoing) return <Badge className="bg-orange-500 animate-pulse">Happening Now</Badge>;
    if (isPast) return <Badge variant="secondary">Ended</Badge>;
    return null;
  };

  const spotsLeft = campaign.capacity - (campaign.participant_count || 0);

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="p-0">
        <div className="relative h-40 bg-gradient-to-br from-green-400 to-emerald-600">
          {campaign.image_url ? (
            <img 
              src={campaign.image_url} 
              alt={campaign.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <span className="text-6xl">🌱</span>
            </div>
          )}
          <div className="absolute top-2 right-2 flex gap-1">
            {getStatusBadge()}
            {getTimeStatus()}
          </div>
          {campaign.distance_km !== undefined && (
            <div className="absolute bottom-2 left-2">
              <Badge variant="secondary" className="bg-white/90">
                <MapPin className="w-3 h-3 mr-1" />
                {campaign.distance_km} km away
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-1">{campaign.title}</h3>
        
        {campaign.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {campaign.description}
          </p>
        )}
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{format(new Date(campaign.start_time), 'MMM d, yyyy')}</span>
          </div>
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>
              {format(new Date(campaign.start_time), 'h:mm a')} - {format(new Date(campaign.end_time), 'h:mm a')}
            </span>
          </div>
          
          {campaign.city && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{campaign.city}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>
              {campaign.participant_count || 0} / {campaign.capacity} joined
              {spotsLeft > 0 && spotsLeft <= 10 && (
                <span className="text-orange-500 ml-1">({spotsLeft} spots left!)</span>
              )}
            </span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 gap-2">
        {onViewDetails && (
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => onViewDetails(campaign.id)}
          >
            View Details
          </Button>
        )}
        
        {!campaign.user_status && !campaign.is_owner && isUpcoming && onJoin && (
          <Button 
            className="flex-1 bg-green-600 hover:bg-green-700"
            onClick={() => onJoin(campaign.id)}
            disabled={isJoining || spotsLeft <= 0}
          >
            {isJoining ? 'Joining...' : spotsLeft <= 0 ? 'Full' : 'Join Campaign'}
          </Button>
        )}
        
        {campaign.user_status === 'approved' && isOngoing && onCheckIn && (
          <Button 
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            onClick={() => onCheckIn(campaign.id)}
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Check In
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
