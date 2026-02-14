import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";
import { useEffect, useState } from "react";
import { useToast } from "./hooks/use-toast";
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
import BlogPost from "./pages/BlogPost";
import RequireAdmin from "./components/RequireAdmin";
import RequireAuth from "./components/RequireAuth";
import Blog from "./pages/Blog";
import Contact from "./pages/contact";

const queryClient = new QueryClient();

const FeedbackPopup = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const enabled = String(import.meta.env.VITE_FEEDBACK_ENABLED || "") === "true";
    const formUrl = String(import.meta.env.VITE_FEEDBACK_FORM_URL || "");
    const storageKey = "feedback_popup_shown_v1";
    const params = new URLSearchParams(window.location.search);
    const debug = params.get("debugFeedback") === "1";

    try { console.log("[FeedbackPopup] enabled=", enabled, "debug=", debug); } catch { }

    if ((!enabled || !formUrl) && !debug) return;
    if (localStorage.getItem(storageKey) === "true" && !debug) return;

    const delayMs = debug ? 100 : 3000;
    const t = setTimeout(() => setVisible(true), delayMs);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;

  const formUrl = String(import.meta.env.VITE_FEEDBACK_FORM_URL || "");
  const storageKey = "feedback_popup_shown_v1";

  return (
    <div
      style={{
        position: "fixed",
        right: 16,
        bottom: 16,
        zIndex: 99999,
        background: "rgba(13,17,23,0.98)",
        border: "1px solid rgba(212,175,55,0.4)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
        backdropFilter: "blur(8px)",
        borderRadius: 12,
        padding: 16,
        maxWidth: 360,
        color: "#e5e7eb",
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 6, color: "#f9fafb" }}>We value your feedback</div>
      <div style={{ fontSize: 14, lineHeight: 1.5, marginBottom: 12 }}>
        Hello from the Dastavez team! We’re actively improving the site. Would you share quick feedback?
      </div>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button
          onClick={() => {
            localStorage.setItem(storageKey, "true");
            setVisible(false);
          }}
          style={{
            background: "transparent",
            color: "#e5e7eb",
            border: "1px solid rgba(229,231,235,0.3)",
            padding: "6px 10px",
            borderRadius: 8,
            fontWeight: 600,
          }}
        >
          Dismiss
        </button>
        <button
          onClick={() => {
            window.open(formUrl, "_blank", "noopener,noreferrer");
            localStorage.setItem(storageKey, "true");
            setVisible(false);
          }}
          style={{
            background: "#d4af37",
            color: "#0b0f16",
            padding: "6px 10px",
            borderRadius: 8,
            fontWeight: 700,
          }}
        >
          Give Feedback
        </button>
      </div>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="dastavez-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <FeedbackPopup />
        <ShootingStars />
        <CursorFollower />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify-reset-otp" element={<VerifyResetOtp />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route
              path="/chat"
              element={
                <RequireAuth>
                  <Chat />
                </RequireAuth>
              }
            />
            <Route path="/features" element={<Features />} />
            <Route path="/case-studies" element={<CaseStudies />} />
            <Route path="/secure-platform" element={<SecurePlatform />} />
            <Route path="/smart-analysis" element={<SmartAnalysis />} />
            <Route path="/about" element={<About />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:id" element={<BlogPost />} />
            <Route path="/contact" element={<Contact />} />
            <Route
              path="/profile"
              element={
                <RequireAuth>
                  <Profile />
                </RequireAuth>
              }
            />
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
            <Route
              path="/admin/v2"
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
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
