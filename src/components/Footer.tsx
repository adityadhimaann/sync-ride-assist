import { Bus, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-10 md:py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="gradient-secondary rounded-xl p-2">
                <Bus className="h-5 w-5 text-secondary-foreground" />
              </div>
              <span className="text-xl font-bold">
                Sync<span className="text-secondary">Ride</span>
              </span>
            </Link>
            <p className="text-background/60 text-xs md:text-sm leading-relaxed">
              Solving last-mile connectivity for intercity travel across India. Never miss your bus again.
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-3 md:mb-4 text-sm md:text-base">Product</h4>
            <ul className="space-y-2 md:space-y-2.5 text-xs md:text-sm text-background/60">
              <li><Link to="/" className="hover:text-background transition-colors">Journey Planner</Link></li>
              <li><Link to="/tracking" className="hover:text-background transition-colors">Live Tracking</Link></li>
              <li><Link to="/#pricing" className="hover:text-background transition-colors">Pricing</Link></li>
              <li><Link to="/conductor" className="hover:text-background transition-colors">For Conductors</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-3 md:mb-4 text-sm md:text-base">Company</h4>
            <ul className="space-y-2 md:space-y-2.5 text-xs md:text-sm text-background/60">
              <li><a href="#" className="hover:text-background transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-background transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-background transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-background transition-colors">Press</a></li>
            </ul>
          </div>

          <div className="col-span-2 md:col-span-1">
            <h4 className="font-bold mb-3 md:mb-4 text-sm md:text-base">Contact</h4>
            <ul className="space-y-2 md:space-y-2.5 text-xs md:text-sm text-background/60">
              <li className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 md:h-4 md:w-4 flex-shrink-0" /> hello@syncride.in</li>
              <li className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 md:h-4 md:w-4 flex-shrink-0" /> 1800-SYNCRIDE</li>
              <li className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 md:h-4 md:w-4 flex-shrink-0" /> Bangalore, India</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/10 mt-8 md:mt-12 pt-6 md:pt-8 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
          <p className="text-xs md:text-sm text-background/40">© 2026 SyncRide. All rights reserved.</p>
          <div className="flex gap-4 md:gap-6 text-xs md:text-sm text-background/40">
            <a href="#" className="hover:text-background transition-colors">Privacy</a>
            <a href="#" className="hover:text-background transition-colors">Terms</a>
            <a href="#" className="hover:text-background transition-colors">Refund Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
