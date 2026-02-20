import HeroSection from "@/components/HeroSection";
import ValueProps from "@/components/ValueProps";
import HowItWorks from "@/components/HowItWorks";

import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-primary/[0.03] to-primary/[0.07]">
      <HeroSection />
      <ValueProps />
      <HowItWorks />

      <Footer />
    </div>
  );
};

export default Index;
