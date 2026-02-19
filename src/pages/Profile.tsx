import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  User, Mail, Phone, Shield, LogOut, Camera, Save, ArrowLeft,
  AtSign, Check, X, MapPin, Share2, Copy, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {
  getUserProfile,
  saveUserProfile,
  updateUserProfileField,
  checkUsernameAvailable,
  claimUsername,
  compressImage,
  saveProfilePicture,
  type UserProfile,
} from "@/lib/database";
import { useLocationSharing } from "@/hooks/useLocationSharing";
import { Link, useNavigate } from "react-router-dom";

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [usernameInput, setUsernameInput] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken" | "invalid">("idle");
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const {
    isSharing,
    shareLink,
    startSharing,
    stopSharing,
    currentLocation,
    error: locationError,
  } = useLocationSharing();

  useEffect(() => {
    if (!user) return;
    setEmail(user.email || "");
    getUserProfile(user.uid).then((profile) => {
      if (profile) {
        setName(profile.name || user.displayName || "");
        setPhone(profile.phone || "");
        setUsername(profile.username || "");
        setUsernameInput(profile.username || "");
        setProfilePhoto(profile.photoURL || user.photoURL || null);
      } else {
        setName(user.displayName || "");
        setProfilePhoto(user.photoURL || null);
      }
      setLoading(false);
    });
  }, [user]);

  useEffect(() => {
    const trimmed = usernameInput.trim().toLowerCase();
    if (!trimmed || trimmed.length < 3) {
      setUsernameStatus(trimmed.length > 0 ? "invalid" : "idle");
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
      setUsernameStatus("invalid");
      return;
    }
    if (trimmed === username) {
      setUsernameStatus("idle");
      return;
    }
    setUsernameStatus("checking");
    const timer = setTimeout(async () => {
      const available = await checkUsernameAvailable(trimmed);
      setUsernameStatus(available ? "available" : "taken");
    }, 500);
    return () => clearTimeout(timer);
  }, [usernameInput, username]);

  const handleSave = async () => {
    if (!user) return;
    if (!name.trim()) { toast.error("Name cannot be empty"); return; }
    setSaving(true);
    try {
      await saveUserProfile(user.uid, {
        name: name.trim(), email, phone,
        username: username || undefined,
        photoURL: profilePhoto || undefined,
        createdAt: Date.now(),
      });
      if (usernameInput.trim() && usernameInput.trim().toLowerCase() !== username) {
        const claimed = await claimUsername(user.uid, usernameInput.trim());
        if (claimed) { setUsername(usernameInput.trim().toLowerCase()); toast.success("Username claimed!"); }
        else toast.error("Username is not available");
      } else {
        toast.success("Profile updated!");
      }
    } catch (err: any) { toast.error(err.message || "Failed to save"); }
    finally { setSaving(false); }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (!file.type.startsWith("image/")) { toast.error("Please select an image file"); return; }
    setUploadingPhoto(true);
    try {
      const compressed = await compressImage(file, 256, 0.7);
      setProfilePhoto(compressed);
      await saveProfilePicture(user.uid, compressed);
      toast.success("Profile picture updated!");
    } catch (err: any) { toast.error(err.message || "Failed to upload photo"); }
    finally { setUploadingPhoto(false); }
  };

  const handleToggleLocationSharing = async () => {
    try {
      if (isSharing) {
        await stopSharing();
        toast.success("Location sharing stopped");
      } else {
        const id = await startSharing({ durationMinutes: 120 });
        if (id) toast.success("Location sharing started! Live for 2 hours.");
        else if (locationError) toast.error(locationError);
      }
    } catch (err: any) {
      if (err.message?.includes("PERMISSION_DENIED")) {
        toast.error("Firebase Permission Denied! Please update your Database Rules to allow location_shares access.");
      } else {
        toast.error(err.message || "Failed to toggle location sharing");
      }
    }
  };

  const copyShareLink = () => {
    if (shareLink) { navigator.clipboard.writeText(shareLink); toast.success("Share link copied!"); }
  };

  const handleLogout = async () => {
    if (isSharing) await stopSharing();
    await logout();
    toast.success("Logged out successfully");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <img src="/assets/RideSync.gif" className="h-16 w-auto" alt="Loading" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 px-4 pb-32">
      <div className="container mx-auto max-w-5xl">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* LEFT — Profile & Details */}
            <div className="space-y-5">
              {/* Avatar + Name header */}
              <div className="glass-card-elevated p-6">
                <div className="flex items-center gap-5">
                  <div className="relative flex-shrink-0">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border-2 border-border overflow-hidden">
                      {uploadingPhoto ? (
                        <Loader2 className="h-7 w-7 text-primary animate-spin" />
                      ) : profilePhoto ? (
                        <img src={profilePhoto} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <User className="h-8 w-8 text-primary" />
                      )}
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                    >
                      <Camera className="h-3.5 w-3.5" />
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-xl font-bold text-foreground truncate">{name || "Your Profile"}</h1>
                    {username && <p className="text-sm text-primary font-medium">@{username}</p>}
                    <p className="text-xs text-muted-foreground mt-0.5">Manage your account</p>
                  </div>
                </div>
              </div>

              {/* Form fields */}
              <div className="glass-card-elevated p-5 space-y-4">
                <div>
                  <label className="text-xs font-medium text-foreground mb-1 block">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name"
                      className="w-full h-10 pl-9 pr-3 rounded-xl border-2 border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-foreground mb-1 block">Username <span className="text-muted-foreground font-normal">(unique ID)</span></label>
                  <div className="relative">
                    <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input type="text" value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value.replace(/[^a-zA-Z0-9_]/g, "").slice(0, 20))}
                      placeholder="your_username"
                      className="w-full h-10 pl-9 pr-9 rounded-xl border-2 border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors" />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {usernameStatus === "checking" && <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />}
                      {usernameStatus === "available" && <Check className="h-4 w-4 text-success" />}
                      {usernameStatus === "taken" && <X className="h-4 w-4 text-destructive" />}
                      {usernameStatus === "invalid" && <X className="h-4 w-4 text-warning" />}
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {usernameStatus === "checking" && "Checking..."}
                    {usernameStatus === "available" && "✓ Available!"}
                    {usernameStatus === "taken" && "✗ Already taken"}
                    {usernameStatus === "invalid" && "3-20 chars, a-z, 0-9, _ only"}
                    {usernameStatus === "idle" && "Choose a unique username"}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-foreground mb-1 block">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input type="email" value={email} disabled
                        className="w-full h-10 pl-9 pr-3 rounded-xl border-2 border-border bg-muted text-muted-foreground text-sm cursor-not-allowed" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground mb-1 block">Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210"
                        className="w-full h-10 pl-9 pr-3 rounded-xl border-2 border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors" />
                    </div>
                  </div>
                </div>

                <Button variant="hero" size="lg" className="w-full" onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <><img src="/assets/RideSync.gif" className="h-5 w-auto object-contain mr-2" alt="Saving" />Saving...</>
                  ) : (
                    <><Save className="h-4 w-4" /> Save Changes</>
                  )}
                </Button>
              </div>
            </div>

            {/* RIGHT — Location Sharing + Account Info + Logout */}
            <div className="space-y-5">
              {/* Location Sharing */}
              <div className="glass-card-elevated p-5">
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" /> Live Location Sharing
                </h3>
                <div
                  className={`rounded-xl p-3.5 border-2 transition-colors cursor-pointer ${isSharing ? "border-success bg-success/5" : "border-border bg-card"}`}
                  onClick={handleToggleLocationSharing}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isSharing ? "bg-success/10" : "bg-muted"}`}>
                      <Share2 className={`h-4 w-4 ${isSharing ? "text-success" : "text-muted-foreground"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm">
                        {isSharing ? "Sharing your location" : "Share Real-Time Location"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {isSharing ? `Live • Updated ${currentLocation ? "just now" : "..."}` : "Share your live GPS with others"}
                      </p>
                    </div>
                    <div className={`w-10 h-6 rounded-full p-0.5 transition-colors flex-shrink-0 ${isSharing ? "bg-success" : "bg-border"}`}>
                      <div className={`w-5 h-5 rounded-full bg-card shadow transition-transform ${isSharing ? "translate-x-4" : ""}`} />
                    </div>
                  </div>
                </div>
                {isSharing && shareLink && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <input type="text" value={shareLink} readOnly
                        className="flex-1 h-8 px-3 rounded-lg border border-border bg-muted text-xs text-muted-foreground truncate" />
                      <Button variant="outline" size="sm" onClick={copyShareLink} className="gap-1.5 flex-shrink-0 h-8">
                        <Copy className="h-3 w-3" /> Copy
                      </Button>
                    </div>
                    {currentLocation && (
                      <p className="text-[10px] text-muted-foreground">
                        📍 {currentLocation.coords.latitude.toFixed(5)}, {currentLocation.coords.longitude.toFixed(5)}
                        {currentLocation.coords.accuracy && ` • ±${Math.round(currentLocation.coords.accuracy)}m`}
                      </p>
                    )}
                  </motion.div>
                )}
                {locationError && <p className="text-xs text-destructive mt-2">{locationError}</p>}
              </div>

              {/* Account Info */}
              <div className="glass-card p-5">
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" /> Account Info
                </h3>
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">User ID</span>
                    <span className="text-foreground font-mono truncate ml-4 max-w-[200px]">
                      {username ? `@${username}` : user?.uid?.slice(0, 12) + "..."}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sign-in method</span>
                    <span className="text-foreground">
                      {user?.providerData[0]?.providerId === "google.com" ? "Google" :
                        user?.providerData[0]?.providerId === "phone" ? "Phone" : "Email/Password"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Account created</span>
                    <span className="text-foreground">{user?.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : "—"}</span>
                  </div>
                </div>
              </div>

              {/* Logout */}
              <Button variant="destructive" size="lg" className="w-full" onClick={handleLogout}>
                <LogOut className="h-4 w-4" /> Log Out
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
