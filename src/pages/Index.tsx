import HeroSection from "@/components/HeroSection";
import ValueProps from "@/components/ValueProps";
import HowItWorks from "@/components/HowItWorks";
import PricingSection from "@/components/PricingSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <ValueProps />
      <HowItWorks />
      <PricingSection />
      <Footer />
    </div>
  );
};

export default Index;
