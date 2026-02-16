import { Bus, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-10">
          <div>
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="gradient-secondary rounded-xl p-2">
                <Bus className="h-5 w-5 text-secondary-foreground" />
              </div>
              <span className="text-xl font-bold">
                Sync<span className="text-secondary">Ride</span>
              </span>
            </Link>
            <p className="text-background/60 text-sm leading-relaxed">
              Solving last-mile connectivity for intercity travel across India. Never miss your bus again.
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-4">Product</h4>
            <ul className="space-y-2.5 text-sm text-background/60">
              <li><Link to="/" className="hover:text-background transition-colors">Journey Planner</Link></li>
              <li><Link to="/tracking" className="hover:text-background transition-colors">Live Tracking</Link></li>
              <li><Link to="/#pricing" className="hover:text-background transition-colors">Pricing</Link></li>
              <li><Link to="/conductor" className="hover:text-background transition-colors">For Conductors</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Company</h4>
            <ul className="space-y-2.5 text-sm text-background/60">
              <li><a href="#" className="hover:text-background transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-background transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-background transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-background transition-colors">Press</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Contact</h4>
            <ul className="space-y-2.5 text-sm text-background/60">
              <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> hello@syncride.in</li>
              <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> 1800-SYNCRIDE</li>
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Bangalore, India</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-background/40">© 2026 SyncRide. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-background/40">
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
