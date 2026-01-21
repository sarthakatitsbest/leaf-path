import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface Campaign {
  id: string;
  title: string;
  lat: number;
  lng: number;
  start_time: string;
  end_time: string;
}

interface CampaignCheckInDialogProps {
  campaign: Campaign;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CampaignCheckInDialog: React.FC<CampaignCheckInDialogProps> = ({
  campaign,
  open,
  onClose,
  onSuccess
}) => {
  const [status, setStatus] = useState<'idle' | 'getting-location' | 'checking-in' | 'success' | 'error'>('idle');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [distance, setDistance] = useState<number | null>(null);
  const { toast } = useToast();

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371000; // meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getLocation = () => {
    setStatus('getting-location');
    setErrorMessage('');

    if (!navigator.geolocation) {
      setStatus('error');
      setErrorMessage('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLoc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setLocation(userLoc);
        
        const dist = calculateDistance(userLoc.lat, userLoc.lng, campaign.lat, campaign.lng);
        setDistance(Math.round(dist));
        
        setStatus('idle');
      },
      (error) => {
        setStatus('error');
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setErrorMessage('Location permission denied. Please enable location access.');
            break;
          case error.POSITION_UNAVAILABLE:
            setErrorMessage('Location information unavailable.');
            break;
          case error.TIMEOUT:
            setErrorMessage('Location request timed out.');
            break;
          default:
            setErrorMessage('An unknown error occurred.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    if (open) {
      getLocation();
    }
  }, [open]);

  const handleCheckIn = async () => {
    if (!location) {
      toast({ title: 'Location not available', variant: 'destructive' });
      return;
    }

    setStatus('checking-in');

    try {
      const response = await supabase.functions.invoke('campaign-checkin', {
        body: {
          campaign_id: campaign.id,
          lat: location.lat,
          lng: location.lng
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      setStatus('success');
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (error: any) {
      console.error('Check-in error:', error);
      setStatus('error');
      setErrorMessage(error.message || 'Check-in failed');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            Check In to Campaign
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="text-center">
            <h3 className="font-semibold text-lg">{campaign.title}</h3>
            <p className="text-sm text-muted-foreground">
              📍 Campaign Location: {campaign.lat.toFixed(4)}, {campaign.lng.toFixed(4)}
            </p>
          </div>

          {status === 'getting-location' && (
            <div className="flex flex-col items-center gap-3 py-6">
              <Loader2 className="w-10 h-10 animate-spin text-green-600" />
              <p className="text-muted-foreground">Getting your location...</p>
            </div>
          )}

          {status === 'idle' && location && (
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <MapPin className="w-8 h-8 mx-auto mb-2 text-green-600" />
                <p className="text-sm text-muted-foreground">Your location</p>
                <p className="font-mono text-sm">
                  {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                </p>
                {distance !== null && (
                  <p className={`mt-2 font-semibold ${distance <= 500 ? 'text-green-600' : 'text-orange-500'}`}>
                    {distance < 1000 
                      ? `${distance}m from campaign` 
                      : `${(distance / 1000).toFixed(1)}km from campaign`
                    }
                  </p>
                )}
              </div>

              {distance !== null && distance > 500 && (
                <div className="flex items-start gap-2 p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-orange-800">Too far from location</p>
                    <p className="text-xs text-orange-700">
                      You need to be within 500 meters of the campaign location to check in.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" onClick={getLocation} className="flex-1">
                  <MapPin className="w-4 h-4 mr-2" />
                  Refresh Location
                </Button>
                <Button 
                  onClick={handleCheckIn}
                  disabled={distance === null || distance > 500}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Check In
                </Button>
              </div>
            </div>
          )}

          {status === 'checking-in' && (
            <div className="flex flex-col items-center gap-3 py-6">
              <Loader2 className="w-10 h-10 animate-spin text-green-600" />
              <p className="text-muted-foreground">Verifying check-in...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center gap-3 py-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <p className="text-lg font-semibold text-green-700">Checked In Successfully!</p>
              <p className="text-sm text-muted-foreground">Thank you for participating 🌱</p>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-3 py-4">
                <AlertCircle className="w-10 h-10 text-red-500" />
                <p className="text-sm text-red-600 text-center">{errorMessage}</p>
              </div>
              <Button onClick={getLocation} className="w-full" variant="outline">
                Try Again
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
