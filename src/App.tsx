import { useEffect } from "react";
import Lenis from "lenis";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Index from "./pages/Index";
import JourneyResults from "./pages/JourneyResults";
import LiveTracking from "./pages/LiveTracking";
import ConductorDashboard from "./pages/ConductorDashboard";
import SafetyCenter from "./pages/SafetyCenter";
import TripInsurance from "./pages/TripInsurance";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const LenisProvider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 2,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <LenisProvider>
          <Navbar />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/results" element={<JourneyResults />} />
            <Route path="/tracking" element={<LiveTracking />} />
            <Route path="/conductor" element={<ConductorDashboard />} />
            <Route path="/safety" element={<SafetyCenter />} />
            <Route path="/insurance" element={<TripInsurance />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </LenisProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
