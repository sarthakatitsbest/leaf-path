import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, MapPin, Loader2 } from 'lucide-react';

interface CreateCampaignDialogProps {
  onCampaignCreated?: () => void;
}

export const CreateCampaignDialog: React.FC<CreateCampaignDialogProps> = ({ onCampaignCreated }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const { toast } = useToast();

  const [form, setForm] = useState({
    title: '',
    description: '',
    city: '',
    lat: 0,
    lng: 0,
    start_time: '',
    end_time: '',
    capacity: 50,
    visibility: 'public',
    team_emails: ''
  });

  const getCurrentLocation = () => {
    setGettingLocation(true);
    if (!navigator.geolocation) {
      toast({ title: 'Geolocation not supported', variant: 'destructive' });
      setGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm(prev => ({
          ...prev,
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }));
        toast({ title: 'Location captured!' });
        setGettingLocation(false);
      },
      (error) => {
        console.error('Location error:', error);
        toast({ title: 'Failed to get location', variant: 'destructive' });
        setGettingLocation(false);
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.title || !form.lat || !form.lng || !form.start_time || !form.end_time) {
      toast({ title: 'Please fill all required fields and set location', variant: 'destructive' });
      return;
    }

    if (new Date(form.start_time) >= new Date(form.end_time)) {
      toast({ title: 'End time must be after start time', variant: 'destructive' });
      return;
    }

    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: 'Please sign in', variant: 'destructive' });
        return;
      }

      const teamEmails = form.team_emails
        .split(',')
        .map(e => e.trim())
        .filter(e => e.length > 0);

      const response = await supabase.functions.invoke('campaign-create', {
        body: {
          ...form,
          team_emails: teamEmails
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      toast({ title: '🎉 Campaign created!', description: response.data.message });
      setOpen(false);
      setForm({
        title: '',
        description: '',
        city: '',
        lat: 0,
        lng: 0,
        start_time: '',
        end_time: '',
        capacity: 50,
        visibility: 'public',
        team_emails: ''
      });
      onCampaignCreated?.();
    } catch (error) {
      console.error('Create error:', error);
      toast({ title: 'Failed to create campaign', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" />
          Create Go-Green Campaign
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            🌱 Create Go-Green Campaign
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Campaign Title *</Label>
            <Input
              id="title"
              placeholder="e.g., River Cleanup Drive"
              value={form.title}
              onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="What's this campaign about?"
              value={form.description}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="start_time">Start Time *</Label>
              <Input
                id="start_time"
                type="datetime-local"
                value={form.start_time}
                onChange={(e) => setForm(prev => ({ ...prev, start_time: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="end_time">End Time *</Label>
              <Input
                id="end_time"
                type="datetime-local"
                value={form.end_time}
                onChange={(e) => setForm(prev => ({ ...prev, end_time: e.target.value }))}
                required
              />
            </div>
          </div>

          <div>
            <Label>Location *</Label>
            <div className="flex gap-2 mt-1">
              <Button
                type="button"
                variant="outline"
                onClick={getCurrentLocation}
                disabled={gettingLocation}
                className="flex-1"
              >
                {gettingLocation ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <MapPin className="w-4 h-4 mr-2" />
                )}
                {form.lat ? 'Location Set ✓' : 'Get Current Location'}
              </Button>
            </div>
            {form.lat !== 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                📍 {form.lat.toFixed(4)}, {form.lng.toFixed(4)}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              placeholder="e.g., Mumbai"
              value={form.city}
              onChange={(e) => setForm(prev => ({ ...prev, city: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="capacity">Max Participants</Label>
              <Input
                id="capacity"
                type="number"
                min={1}
                max={1000}
                value={form.capacity}
                onChange={(e) => setForm(prev => ({ ...prev, capacity: parseInt(e.target.value) || 50 }))}
              />
            </div>
            <div>
              <Label htmlFor="visibility">Visibility</Label>
              <Select
                value={form.visibility}
                onValueChange={(value) => setForm(prev => ({ ...prev, visibility: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private (Invite Only)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="team_emails">Team Members (optional)</Label>
            <Input
              id="team_emails"
              placeholder="email1@example.com, email2@example.com"
              value={form.team_emails}
              onChange={(e) => setForm(prev => ({ ...prev, team_emails: e.target.value }))}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Comma-separated emails of team members
            </p>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-green-600 hover:bg-green-700"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              '🌱 Create Campaign'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
