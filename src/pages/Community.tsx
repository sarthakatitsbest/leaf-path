import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { PageTransition } from '@/components/PageTransition';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { 
  Users, 
  Trophy, 
  MapPin, 
  MessageCircle, 
  Award,
  Leaf,
  TreeDeciduous,
  Recycle,
  Droplets,
  Zap,
  Heart,
  Shield,
  ChevronRight,
  Send,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Textarea } from '@/components/ui/textarea';

// Badge definitions
const availableBadges = [
  { id: 'eco-starter', name: 'Eco Starter', icon: Leaf, description: 'Completed first carbon log', earned: true, color: 'bg-emerald-500' },
  { id: 'waste-warrior', name: 'Waste Warrior', icon: Recycle, description: 'Joined 3+ cleanup campaigns', earned: true, color: 'bg-blue-500' },
  { id: 'green-leader', name: 'Green Leader', icon: TreeDeciduous, description: '30-day logging streak', earned: false, progress: 65, color: 'bg-green-600' },
  { id: 'water-saver', name: 'Water Saver', icon: Droplets, description: 'Reduced water usage by 20%', earned: false, progress: 40, color: 'bg-cyan-500' },
  { id: 'energy-champion', name: 'Energy Champion', icon: Zap, description: 'Cut energy use by 15%', earned: false, progress: 80, color: 'bg-yellow-500' },
  { id: 'community-champion', name: 'Community Champion', icon: Trophy, description: 'Reached top 10 leaderboard', earned: false, progress: 25, color: 'bg-purple-500' },
];

// Sample discussion questions
const sampleDiscussions = [
  { id: 1, question: "Plastic packet recycle hota hai kya?", aiAnswer: "Depends on the type! Check for recycling symbol (1-7). Most soft plastics (chips bags) are NOT recyclable curbside. Return to store drop-offs instead.", likes: 24, replies: 8 },
  { id: 2, question: "Carbon kaise kam karu daily life me?", aiAnswer: "Top 3: 1) Use public transit or cycle 2) Reduce meat consumption 3) Switch to LED bulbs. Small consistent changes matter more than big one-time efforts!", likes: 56, replies: 15 },
  { id: 3, question: "Best sustainable alternatives for single-use plastic?", aiAnswer: "Carry reusable bags, metal straws, and a water bottle. For food storage, try beeswax wraps or silicone bags. Every swap counts!", likes: 41, replies: 12 },
];

const Community: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('campaigns');
  const [newQuestion, setNewQuestion] = useState('');

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 mb-4 gradient-teal-lime rounded-2xl">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-poppins font-bold mb-3 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Join Community
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Turn sustainability from a solo activity into a social movement. 
              <span className="text-primary font-medium"> Learn. Act. Compete. Collaborate.</span>
            </p>
          </motion.div>

          {/* Privacy Badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center mb-6"
          >
            <Badge variant="outline" className="px-4 py-2 text-sm bg-emerald-500/10 border-emerald-500/30 text-emerald-600">
              <Shield className="w-4 h-4 mr-2" />
              Privacy-first: We never track your movements. Only public places + opt-in data.
            </Badge>
          </motion.div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-8 h-auto p-1 bg-muted/50 rounded-2xl">
              <TabsTrigger value="campaigns" className="flex items-center gap-2 py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Campaigns</span>
              </TabsTrigger>
              <TabsTrigger value="leaderboard" className="flex items-center gap-2 py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Trophy className="w-4 h-4" />
                <span className="hidden sm:inline">Leaderboard</span>
              </TabsTrigger>
              <TabsTrigger value="map" className="flex items-center gap-2 py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <MapPin className="w-4 h-4" />
                <span className="hidden sm:inline">Eco Map</span>
              </TabsTrigger>
              <TabsTrigger value="discussions" className="flex items-center gap-2 py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <MessageCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Discuss</span>
              </TabsTrigger>
              <TabsTrigger value="badges" className="flex items-center gap-2 py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Award className="w-4 h-4" />
                <span className="hidden sm:inline">Badges</span>
              </TabsTrigger>
            </TabsList>

            {/* Campaigns Tab */}
            <TabsContent value="campaigns">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Go-Green Campaigns</h2>
                    <p className="text-muted-foreground">Turn awareness into real-world action</p>
                  </div>
                  <Button onClick={() => navigate('/campaigns')} className="rounded-xl">
                    View All <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { title: 'River Cleanup Drive', location: 'Mumbai, Juhu Beach', date: 'Jan 28, 2026', participants: 45, capacity: 100, image: '🏖️' },
                    { title: 'Tree Plantation', location: 'Delhi, Lodhi Gardens', date: 'Feb 5, 2026', participants: 78, capacity: 150, image: '🌳' },
                    { title: 'E-Waste Collection', location: 'Bangalore, Koramangala', date: 'Feb 12, 2026', participants: 32, capacity: 50, image: '♻️' },
                  ].map((campaign, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <Card className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group">
                        <div className="h-32 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform">
                          {campaign.image}
                        </div>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">{campaign.title}</CardTitle>
                          <CardDescription className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {campaign.location}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between text-sm mb-3">
                            <span className="text-muted-foreground">{campaign.date}</span>
                            <Badge variant="secondary">{campaign.participants}/{campaign.capacity}</Badge>
                          </div>
                          <Progress value={(campaign.participants / campaign.capacity) * 100} className="h-2 mb-3" />
                          <Button className="w-full rounded-xl" size="sm">Join Campaign</Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </TabsContent>

            {/* Leaderboard Tab */}
            <TabsContent value="leaderboard">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Community Leaderboard</h2>
                    <p className="text-muted-foreground">Compete with eco-warriors across the country</p>
                  </div>
                  <Button onClick={() => navigate('/leaderboard')} variant="outline" className="rounded-xl">
                    Full Rankings <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* City Leaderboard */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-primary" />
                        City Rankings
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[
                          { city: 'Pune', score: 12450, rank: 1, trend: '+5%' },
                          { city: 'Bangalore', score: 11200, rank: 2, trend: '+3%' },
                          { city: 'Mumbai', score: 10800, rank: 3, trend: '+8%' },
                          { city: 'Delhi', score: 9500, rank: 4, trend: '+2%' },
                          { city: 'Chennai', score: 8900, rank: 5, trend: '+4%' },
                        ].map((city, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-3">
                              <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${idx === 0 ? 'bg-yellow-500 text-white' : idx === 1 ? 'bg-gray-400 text-white' : idx === 2 ? 'bg-amber-600 text-white' : 'bg-muted'}`}>
                                {city.rank}
                              </span>
                              <span className="font-medium">{city.city}</span>
                            </div>
                            <div className="text-right">
                              <span className="font-bold text-primary">{city.score.toLocaleString()}</span>
                              <span className="text-xs text-emerald-500 ml-2">{city.trend}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Your Rank */}
                  <Card className="bg-gradient-to-br from-primary/10 to-secondary/10">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        Your Ranking
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="text-center py-6">
                        <div className="text-6xl font-bold text-primary mb-2">#42</div>
                        <p className="text-muted-foreground">out of 1,247 eco-warriors</p>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="p-3 rounded-xl bg-background/50">
                          <div className="text-2xl font-bold text-emerald-500">2,450</div>
                          <div className="text-xs text-muted-foreground">Total Points</div>
                        </div>
                        <div className="p-3 rounded-xl bg-background/50">
                          <div className="text-2xl font-bold text-blue-500">12</div>
                          <div className="text-xs text-muted-foreground">Campaigns</div>
                        </div>
                        <div className="p-3 rounded-xl bg-background/50">
                          <div className="text-2xl font-bold text-purple-500">28</div>
                          <div className="text-xs text-muted-foreground">Day Streak</div>
                        </div>
                      </div>
                      <Button className="w-full rounded-xl gradient-teal-lime border-0 text-white">
                        <Zap className="w-4 h-4 mr-2" /> Boost Your Rank
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            </TabsContent>

            {/* Eco Map Tab */}
            <TabsContent value="map">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Local Eco Map</h2>
                    <p className="text-muted-foreground">Find nearby sustainable resources</p>
                  </div>
                  <Button onClick={() => navigate('/map')} className="rounded-xl">
                    Open Full Map <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>

                <Card className="overflow-hidden">
                  <div className="h-[400px] bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/20 dark:to-teal-900/20 flex items-center justify-center relative">
                    <div className="text-center">
                      <MapPin className="w-16 h-16 text-primary mx-auto mb-4 animate-bounce" />
                      <h3 className="text-xl font-bold mb-2">Interactive Eco Map</h3>
                      <p className="text-muted-foreground mb-4">Discover recycling centers, EV chargers, transit & campaigns near you</p>
                      <Button onClick={() => navigate('/map')} size="lg" className="rounded-xl">
                        <MapPin className="w-4 h-4 mr-2" /> Explore Map
                      </Button>
                    </div>
                    
                    {/* Floating markers preview */}
                    <div className="absolute top-8 left-8 p-3 bg-background/90 rounded-xl shadow-lg flex items-center gap-2">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <Recycle className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-medium">24 Recycling Centers</span>
                    </div>
                    <div className="absolute top-8 right-8 p-3 bg-background/90 rounded-xl shadow-lg flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <Zap className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-medium">18 EV Chargers</span>
                    </div>
                    <div className="absolute bottom-8 left-8 p-3 bg-background/90 rounded-xl shadow-lg flex items-center gap-2">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-medium">5 Active Campaigns</span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Discussions Tab */}
            <TabsContent value="discussions">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold">Eco Discussions</h2>
                  <p className="text-muted-foreground">AI-guided Q&A + community wisdom</p>
                </div>

                {/* Ask Question */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex gap-3">
                      <Textarea
                        placeholder="Ask any sustainability question... (e.g., 'How do I reduce plastic use?')"
                        value={newQuestion}
                        onChange={(e) => setNewQuestion(e.target.value)}
                        className="flex-1 min-h-[80px] rounded-xl"
                      />
                      <Button className="rounded-xl h-auto" onClick={() => navigate('/chat')}>
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> AI responds first, then community joins
                    </p>
                  </CardContent>
                </Card>

                {/* Discussion Threads */}
                <div className="space-y-4">
                  {sampleDiscussions.map((disc, idx) => (
                    <motion.div
                      key={disc.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
                              Q
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-lg mb-2">{disc.question}</h4>
                              <div className="p-4 rounded-xl bg-muted/30 mb-3">
                                <div className="flex items-center gap-2 mb-2">
                                  <Sparkles className="w-4 h-4 text-primary" />
                                  <span className="text-sm font-medium text-primary">AI Answer</span>
                                </div>
                                <p className="text-sm text-muted-foreground">{disc.aiAnswer}</p>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Heart className="w-4 h-4" /> {disc.likes} helpful
                                </span>
                                <span className="flex items-center gap-1">
                                  <MessageCircle className="w-4 h-4" /> {disc.replies} replies
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                <div className="text-center">
                  <Button variant="outline" onClick={() => navigate('/chat')} className="rounded-xl">
                    Ask More Questions in AI Chat <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </motion.div>
            </TabsContent>

            {/* Badges Tab */}
            <TabsContent value="badges">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold">My Eco Badges</h2>
                  <p className="text-muted-foreground">Earn recognition for your sustainability journey</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {availableBadges.map((badge, idx) => {
                    const Icon = badge.icon;
                    return (
                      <motion.div
                        key={badge.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        <Card className={`relative overflow-hidden ${badge.earned ? 'ring-2 ring-primary' : 'opacity-75'}`}>
                          {badge.earned && (
                            <div className="absolute top-3 right-3">
                              <Badge className="bg-emerald-500 text-white">Earned ✓</Badge>
                            </div>
                          )}
                          <CardContent className="pt-6">
                            <div className="flex items-center gap-4 mb-4">
                              <div className={`w-14 h-14 rounded-2xl ${badge.color} flex items-center justify-center ${badge.earned ? 'animate-glow' : 'grayscale'}`}>
                                <Icon className="w-7 h-7 text-white" />
                              </div>
                              <div>
                                <h3 className="font-bold text-lg">{badge.name}</h3>
                                <p className="text-sm text-muted-foreground">{badge.description}</p>
                              </div>
                            </div>
                            {!badge.earned && badge.progress !== undefined && (
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-muted-foreground">Progress</span>
                                  <span className="font-medium">{badge.progress}%</span>
                                </div>
                                <Progress value={badge.progress} className="h-2" />
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Shared Eco Wins */}
                <Card className="mt-8">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Leaf className="w-5 h-5 text-primary" />
                      Shared Eco Wins
                    </CardTitle>
                    <CardDescription>See what the community is achieving</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { user: 'Priya S.', action: 'Completed 7-day green commute streak', time: '2h ago', emoji: '🚲' },
                        { user: 'Rahul M.', action: 'Joined Mumbai river cleanup campaign', time: '5h ago', emoji: '🌊' },
                        { user: 'Anita K.', action: 'Earned Waste Warrior badge', time: '1d ago', emoji: '♻️' },
                        { user: 'Vikram P.', action: 'Reduced carbon footprint by 15%', time: '2d ago', emoji: '📉' },
                      ].map((win, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                          <span className="text-2xl">{win.emoji}</span>
                          <div className="flex-1">
                            <span className="font-medium">{win.user}</span>
                            <span className="text-muted-foreground"> {win.action}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">{win.time}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>

          {/* ESG Bridge CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12"
          >
            <Card className="bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 border-primary/20">
              <CardContent className="py-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Company + Community Bridge</h3>
                      <p className="text-muted-foreground">Connect individual sustainability with corporate ESG reporting</p>
                    </div>
                  </div>
                  <Button onClick={() => navigate('/company')} size="lg" className="rounded-xl gradient-teal-lime border-0 text-white">
                    Explore Company ESG <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    </PageTransition>
  );
};

export default Community;
