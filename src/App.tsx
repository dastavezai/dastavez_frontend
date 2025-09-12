import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
//import { ThemeProvider } from "./components/ThemeProvider";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Chat from "./pages/Chat";
import Features from "./pages/Features";
import CaseStudies from "./pages/CaseStudies";
import CursorFollower from "./components/CursorFollower";
import ShootingStars from "./components/ShootingStars";
import SecurePlatform from "./pages/SecurePlatform";
import SmartAnalysis from "./pages/SmartAnalysis";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyResetOtp from "./pages/VerifyResetOtp";
import ResetPassword from "./pages/ResetPassword";
import About from "./pages/About";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import AdminDashboard from "./pages/AdminDashboard";
import RequireAdmin from "./components/RequireAdmin";
import MMRY from "./pages/MMRY";
import MMRYojana from "./pages/MMRYojana";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <ShootingStars />
        <CursorFollower />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify-reset-otp" element={<VerifyResetOtp />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/features" element={<Features />} />
            <Route path="/case-studies" element={<CaseStudies />} />
            <Route path="/secure-platform" element={<SecurePlatform />} />
            <Route path="/smart-analysis" element={<SmartAnalysis />} />
            <Route path="/about" element={<About />} />
            <Route path="/mukhya-mantri-mahila-rojgar-yojana-fill-form" element={<MMRY />} />
            <Route path="/mukhya-mantri-rojgar-yojana" element={<MMRYojana />} />
            <Route path="/profile" element={<Profile />} />
            <Route
              path="/admin"
              element={
                <RequireAdmin>
                  <Admin />
                </RequireAdmin>
              }
            />
            <Route
              path="/admin-dashboard"
              element={
                <RequireAdmin>
                  <AdminDashboard />
                </RequireAdmin>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
  </QueryClientProvider>
);

export default App;
