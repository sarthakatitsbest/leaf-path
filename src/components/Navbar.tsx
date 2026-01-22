import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home, 
  BarChart3, 
  User, 
  LogOut, 
  TrendingDown, 
  Users, 
  MapPin, 
  Bot, 
  Recycle, 
  Heart, 
  Trophy,
  Menu,
  X,
  Leaf
} from 'lucide-react';
import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { path: '/carbon', label: 'Carbon Tracker', icon: TrendingDown },
  { path: '/campaigns', label: 'Campaigns', icon: Users },
  { path: '/map', label: 'Eco Map', icon: MapPin },
  { path: '/plastic', label: 'Plastic AI', icon: Recycle },
  { path: '/wellness', label: 'Wellness', icon: Heart },
  { path: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { path: '/chat', label: 'AI Chat', icon: Bot },
];

export const Navbar = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  if (!user) return null;

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20">
              <Leaf className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xl font-poppins font-bold gradient-teal-lime bg-clip-text text-transparent">
              EcoPulse
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.path} to={item.path}>
                  <motion.div
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                      isActive(item.path) 
                        ? 'bg-primary text-primary-foreground shadow-lg' 
                        : 'hover:bg-accent/50 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden xl:inline">{item.label}</span>
                  </motion.div>
                </Link>
              );
            })}
          </div>

          {/* Right Side - User & Mobile Menu */}
          <div className="flex items-center gap-3">
            {/* Profile Link */}
            <Link to="/profile" className="hidden sm:block">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm ${
                  isActive('/profile') 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-accent/30 hover:bg-accent/50'
                }`}
              >
                <User className="h-4 w-4" />
                <span className="hidden md:inline max-w-[120px] truncate">
                  {user.email?.split('@')[0]}
                </span>
              </motion.div>
            </Link>

            {/* Sign Out Button */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={signOut}
              className="hidden sm:flex rounded-xl"
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span className="hidden md:inline">Sign Out</span>
            </Button>

            {/* Mobile Menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon" className="rounded-xl">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] p-0">
                <div className="flex flex-col h-full">
                  {/* Mobile Header */}
                  <div className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center gap-2">
                      <Leaf className="h-6 w-6 text-primary" />
                      <span className="font-poppins font-bold">EcoPulse</span>
                    </div>
                  </div>

                  {/* Mobile Nav Items */}
                  <div className="flex-1 overflow-y-auto py-4">
                    <div className="space-y-1 px-3">
                      {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link 
                            key={item.path} 
                            to={item.path}
                            onClick={() => setMobileOpen(false)}
                          >
                            <motion.div
                              whileTap={{ scale: 0.98 }}
                              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                                isActive(item.path) 
                                  ? 'bg-primary text-primary-foreground' 
                                  : 'hover:bg-accent/50'
                              }`}
                            >
                              <Icon className="h-5 w-5" />
                              <span>{item.label}</span>
                            </motion.div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>

                  {/* Mobile Footer */}
                  <div className="border-t p-4 space-y-3">
                    <Link 
                      to="/profile" 
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl bg-accent/30 hover:bg-accent/50"
                    >
                      <User className="h-5 w-5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Profile</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </Link>
                    <Button 
                      variant="outline" 
                      className="w-full rounded-xl" 
                      onClick={() => {
                        signOut();
                        setMobileOpen(false);
                      }}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};