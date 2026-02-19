import { useState } from "react";
import { motion } from "framer-motion";
import {
  Shield, Check, Star, Zap, Heart, ArrowLeft,
  BadgeCheck, Luggage, Clock, Stethoscope, AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Footer from "@/components/Footer";

interface InsuranceTier {
  id: string;
  name: string;
  price: number;
  icon: typeof Shield;
  color: string;
  bgColor: string;
  borderColor: string;
  badge?: string;
  features: { text: string; included: boolean }[];
  highlight: string;
}

const tiers: InsuranceTier[] = [
  {
    id: "basic",
    name: "Basic",
    price: 50,
    icon: Shield,
    color: "text-primary",
    bgColor: "bg-primary/5",
    borderColor: "border-primary/20",
    features: [
      { text: "Full refund on missed trips", included: true },
      { text: "Instant rebooking on next bus", included: true },
      { text: "SMS & email notifications", included: true },
      { text: "Cash compensation", included: false },
      { text: "Medical emergency coverage", included: false },
      { text: "Baggage loss protection", included: false },
      { text: "Delay compensation", included: false },
    ],
    highlight: "Peace of mind basics",
  },
  {
    id: "standard",
    name: "Standard",
    price: 100,
    icon: Star,
    color: "text-secondary",
    bgColor: "bg-secondary/5",
    borderColor: "border-secondary/30",
    badge: "Popular",
    features: [
      { text: "Full refund on missed trips", included: true },
      { text: "Instant rebooking on next bus", included: true },
      { text: "SMS & email notifications", included: true },
      { text: "₹500 cash compensation", included: true },
      { text: "Medical emergency (₹25,000)", included: true },
      { text: "Baggage loss protection", included: false },
      { text: "Delay compensation", included: false },
    ],
    highlight: "Best value for regular travelers",
  },
  {
    id: "premium",
    name: "Premium",
    price: 200,
    icon: Zap,
    color: "text-success",
    bgColor: "bg-success/5",
    borderColor: "border-success/30",
    features: [
      { text: "Full refund on missed trips", included: true },
      { text: "Instant rebooking on next bus", included: true },
      { text: "SMS & email notifications", included: true },
      { text: "₹1,000 cash compensation", included: true },
      { text: "Medical emergency (₹50,000)", included: true },
      { text: "Baggage loss (₹10,000)", included: true },
      { text: "Delay comp (₹100/hr after 2h)", included: true },
    ],
    highlight: "Complete travel protection",
  },
];

const coverageDetails = [
  {
    icon: AlertTriangle,
    title: "Missed Trip Refund",
    desc: "100% refund if you miss your bus due to local transport delays.",
  },
  {
    icon: Stethoscope,
    title: "Medical Coverage",
    desc: "Emergency medical expenses covered during your journey.",
  },
  {
    icon: Luggage,
    title: "Baggage Protection",
    desc: "Compensation for lost or damaged baggage during transit.",
  },
  {
    icon: Clock,
    title: "Delay Compensation",
    desc: "Hourly compensation when your bus is delayed beyond 2 hours.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const TripInsurance = () => {
  const [selectedTier, setSelectedTier] = useState("standard");
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-4 py-6 md:py-10 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors text-sm"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4">
              <Shield className="h-7 w-7 md:h-8 md:w-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Trip Insurance</h1>
            <p className="text-muted-foreground text-sm md:text-base max-w-md mx-auto">
              Travel worry-free with comprehensive protection for every journey.
            </p>
          </div>
        </motion.div>

        {/* Tiers */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10"
        >
          {tiers.map((tier) => {
            const isSelected = selectedTier === tier.id;
            return (
              <motion.div
                key={tier.id}
                variants={itemVariants}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedTier(tier.id)}
                className={`relative glass-card p-5 cursor-pointer transition-all duration-200 ${isSelected
                    ? `border-2 ${tier.borderColor} ${tier.bgColor} shadow-lg`
                    : "border border-border hover:border-border/80"
                  }`}
              >
                {tier.badge && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-secondary text-secondary-foreground text-[10px] font-bold uppercase tracking-wide">
                    {tier.badge}
                  </span>
                )}

                <div className="text-center mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3 ${isSelected ? tier.bgColor : "bg-muted"
                    }`}>
                    <tier.icon className={`h-5 w-5 ${isSelected ? tier.color : "text-muted-foreground"}`} />
                  </div>
                  <h3 className="font-bold text-foreground text-lg">{tier.name}</h3>
                  <div className="mt-1">
                    <span className="text-2xl font-bold text-foreground">₹{tier.price}</span>
                    <span className="text-muted-foreground text-xs"> /trip</span>
                  </div>
                  <p className="text-[10px] md:text-xs text-muted-foreground mt-1">{tier.highlight}</p>
                </div>

                <ul className="space-y-2">
                  {tier.features.map((feature) => (
                    <li key={feature.text} className="flex items-start gap-2">
                      {feature.included ? (
                        <Check className="h-3.5 w-3.5 text-success flex-shrink-0 mt-0.5" />
                      ) : (
                        <span className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-center text-muted-foreground/40 text-xs">—</span>
                      )}
                      <span className={`text-xs ${feature.included ? "text-foreground" : "text-muted-foreground/50"}`}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={isSelected ? "hero" : "outline"}
                  size="sm"
                  className="w-full mt-5"
                >
                  {isSelected ? "Selected" : "Choose Plan"}
                </Button>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Coverage Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-10"
        >
          <h2 className="font-bold text-foreground text-lg md:text-xl mb-4 text-center">What's Covered</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {coverageDetails.map((item) => (
              <div key={item.title} className="glass-card p-4 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <item.icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-6 flex-wrap">
            <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
              <BadgeCheck className="h-4 w-4 text-success" />
              IRDAI Registered
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
              <Heart className="h-4 w-4 text-destructive" />
              50,000+ claims settled
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
              <Clock className="h-4 w-4 text-primary" />
              Instant processing
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center mb-10"
        >
          <Button variant="hero" size="xl" className="min-w-[200px]">
            <Shield className="h-5 w-5" />
            Add Protection — ₹{tiers.find((t) => t.id === selectedTier)?.price}
          </Button>
          <p className="text-[10px] text-muted-foreground mt-2">Cancel anytime before trip departure</p>
        </motion.div>
      </div>
    </div>
  );
};

export default TripInsurance;
