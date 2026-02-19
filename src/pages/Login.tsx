import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowRight, Phone, ArrowLeft } from "lucide-react";
import { CreepyEyeToggle } from "@/components/ui/creepy-eye-toggle";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import type { ConfirmationResult } from "firebase/auth";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authMode, setAuthMode] = useState<"email" | "phone">("email");

  // Phone OTP states
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  const navigate = useNavigate();
  const { login, loginWithGoogle, sendPhoneOtp, verifyPhoneOtp } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
      navigate("/");
    } catch (err: any) {
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      toast.success("Welcome!");
      navigate("/");
    } catch (err: any) {
      toast.error(err.message || "Google sign-in failed");
    }
  };

  const handleSendOtp = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }
    const formattedPhone = phoneNumber.startsWith("+") ? phoneNumber : `+91${phoneNumber}`;
    setLoading(true);
    try {
      const result = await sendPhoneOtp(formattedPhone, "recaptcha-container");
      setConfirmationResult(result);
      setOtpSent(true);
      toast.success("OTP sent to " + formattedPhone);
    } catch (err: any) {
      toast.error(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 6) {
      toast.error("Please enter the 6-digit OTP");
      return;
    }
    if (!confirmationResult) return;
    setLoading(true);
    try {
      await verifyPhoneOtp(confirmationResult, otp);
      toast.success("Welcome back!");
      navigate("/");
    } catch (err: any) {
      toast.error(err.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 pt-20 pb-10">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-4">

          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Welcome back</h1>
          <p className="text-muted-foreground text-sm mt-1">Sign in to manage your trips</p>
        </div>

        {/* Auth mode tabs */}
        <div className="flex gap-1 p-1 bg-muted rounded-xl mb-5">
          <button
            onClick={() => { setAuthMode("email"); setOtpSent(false); }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${authMode === "email" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
          >
            <Mail className="h-4 w-4" /> Email
          </button>
          <button
            onClick={() => setAuthMode("phone")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${authMode === "phone" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
          >
            <Phone className="h-4 w-4" /> Phone OTP
          </button>
        </div>

        {/* Form */}
        <div className="glass-card-elevated p-6 md:p-8">
          <AnimatePresence mode="wait">
            {authMode === "email" ? (
              <motion.div key="email" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="email"
                        placeholder="Your email here"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full h-11 pl-10 pr-4 rounded-xl border-2 border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full h-11 pl-10 pr-10 rounded-xl border-2 border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
                      />
                      <CreepyEyeToggle isVisible={showPassword} onToggle={() => setShowPassword(!showPassword)} />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button type="button" className="text-xs text-primary hover:underline">Forgot password?</button>
                  </div>

                  <Button type="submit" variant="hero" size="xl" className="w-full" disabled={loading}>
                    {loading ? <><img src="/assets/RideSync.gif" className="h-5 w-auto object-contain mr-2" alt="Loading" />Signing in...</> : <>Sign In <ArrowRight className="h-4 w-4" /></>}
                  </Button>
                </form>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
                  <div className="relative flex justify-center"><span className="bg-card px-3 text-xs text-muted-foreground">or continue with</span></div>
                </div>

                <Button variant="outline" className="rounded-xl h-11 w-full" onClick={handleGoogleLogin}>
                  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                  Sign in with Google
                </Button>
              </motion.div>
            ) : (
              <motion.div key="phone" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                {!otpSent ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <div className="absolute left-10 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">+91</div>
                        <input
                          type="tel"
                          placeholder="98765 43210"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                          className="w-full h-11 pl-[4.5rem] pr-4 rounded-xl border-2 border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
                        />
                      </div>
                    </div>
                    <Button variant="hero" size="xl" className="w-full" onClick={handleSendOtp} disabled={loading}>
                      {loading ? <><img src="/assets/RideSync.gif" className="h-5 w-auto object-contain mr-2" alt="Loading" />Sending OTP...</> : <>Send OTP <ArrowRight className="h-4 w-4" /></>}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <button onClick={() => setOtpSent(false)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                      <ArrowLeft className="h-4 w-4" /> Change number
                    </button>
                    <p className="text-sm text-muted-foreground">
                      Enter the 6-digit code sent to <span className="font-semibold text-foreground">+91 {phoneNumber}</span>
                    </p>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">OTP Code</label>
                      <input
                        type="text"
                        placeholder="Enter 6-digit OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        maxLength={6}
                        className="w-full h-12 px-4 rounded-xl border-2 border-border bg-background text-foreground text-center text-lg font-bold tracking-[0.5em] placeholder:text-muted-foreground placeholder:tracking-normal placeholder:text-sm placeholder:font-normal focus:border-primary focus:outline-none transition-colors"
                        autoFocus
                      />
                    </div>
                    <Button variant="hero" size="xl" className="w-full" onClick={handleVerifyOtp} disabled={loading}>
                      {loading ? <><img src="/assets/RideSync.gif" className="h-5 w-auto object-contain mr-2" alt="Loading" />Verifying...</> : <>Verify & Sign In <ArrowRight className="h-4 w-4" /></>}
                    </Button>
                    <button onClick={handleSendOtp} className="w-full text-xs text-primary hover:underline text-center mt-2">
                      Resend OTP
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Recaptcha container (invisible) */}
        <div id="recaptcha-container"></div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Don't have an account?{" "}
          <Link to="/signup" className="text-primary font-medium hover:underline">Sign up</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
