import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    description: "Basic journey planning for everyone",
    features: [
      "Smart journey planner",
      "Real-time bus tracking",
      "Route alternatives",
      "Basic notifications",
    ],
    cta: "Get Started",
    variant: "hero-outline" as const,
    highlighted: false,
  },
  {
    name: "Protected",
    price: "₹50-100",
    period: "per trip",
    description: "Guaranteed Arrival on every journey",
    features: [
      "Everything in Free",
      "Guaranteed Arrival protection",
      "Bus wait incentive system",
      "100% refund on missed trips",
      "Priority rebooking",
      "₹500 compensation",
    ],
    cta: "Enable Protection",
    variant: "hero" as const,
    highlighted: true,
  },
  {
    name: "Premium",
    price: "₹299",
    period: "per month",
    description: "Unlimited protection for frequent travelers",
    features: [
      "Everything in Protected",
      "Unlimited trip protection",
      "Priority customer support",
      "Cashback on local rides",
      "Family sharing (up to 4)",
      "Exclusive bus operator deals",
    ],
    cta: "Go Premium",
    variant: "secondary" as const,
    highlighted: false,
  },
];

const PricingSection = () => {
  return (
    <section id="pricing" className="py-16 md:py-28 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 md:mb-16"
        >
          <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-3 md:mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto">
            Start free. Add protection when you need it.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8 max-w-5xl mx-auto items-start">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              whileHover={{ y: -5 }}
              className={`rounded-2xl p-6 md:p-8 relative ${
                plan.highlighted
                  ? "glass-card-elevated border-2 border-primary/20 md:scale-105"
                  : "glass-card"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3.5 md:-top-4 left-1/2 -translate-x-1/2">
                  <span className="gradient-primary text-primary-foreground text-[10px] md:text-xs font-bold px-3 md:px-4 py-1 md:py-1.5 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              <h3 className="text-lg md:text-xl font-bold text-foreground mb-1">{plan.name}</h3>
              <p className="text-muted-foreground text-xs md:text-sm mb-3 md:mb-4">{plan.description}</p>
              <div className="mb-5 md:mb-6">
                <span className="text-3xl md:text-4xl font-bold text-foreground">{plan.price}</span>
                <span className="text-muted-foreground ml-2 text-sm">/ {plan.period}</span>
              </div>
              <ul className="space-y-2.5 md:space-y-3 mb-6 md:mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5 md:gap-3 text-xs md:text-sm text-foreground">
                    <Check className="h-3.5 w-3.5 md:h-4 md:w-4 text-success flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button variant={plan.variant} size="lg" className="w-full text-sm md:text-base">
                {plan.cta}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
