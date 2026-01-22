import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import VerifyBadge from "./pages/VerifyBadge";
import CarbonTracker from "./pages/CarbonTracker";
import Campaigns from "./pages/Campaigns";
import MapView from "./pages/MapView";
import AIChat from "./pages/AIChat";
import PlasticIntelligence from "./pages/PlasticIntelligence";
import Wellness from "./pages/Wellness";
import Leaderboard from "./pages/Leaderboard";
import PrivateRoute from "./components/PrivateRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/verify/:code" element={<VerifyBadge />} />
            
            {/* Protected Feature Routes */}
            <Route path="/dashboard" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />
            <Route path="/carbon" element={
              <PrivateRoute>
                <CarbonTracker />
              </PrivateRoute>
            } />
            <Route path="/campaigns" element={
              <PrivateRoute>
                <Campaigns />
              </PrivateRoute>
            } />
            <Route path="/map" element={
              <PrivateRoute>
                <MapView />
              </PrivateRoute>
            } />
            <Route path="/chat" element={
              <PrivateRoute>
                <AIChat />
              </PrivateRoute>
            } />
            <Route path="/plastic" element={
              <PrivateRoute>
                <PlasticIntelligence />
              </PrivateRoute>
            } />
            <Route path="/wellness" element={
              <PrivateRoute>
                <Wellness />
              </PrivateRoute>
            } />
            <Route path="/leaderboard" element={
              <PrivateRoute>
                <Leaderboard />
              </PrivateRoute>
            } />
            <Route path="/profile" element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;