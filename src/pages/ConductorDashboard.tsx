import { useState } from "react";
import { motion } from "framer-motion";
import {
  User, MapPin, Clock, Phone, MessageCircle, CheckCircle, XCircle,
  IndianRupee, Filter, Bus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Passenger } from "@/types/trip";

const mockPassengers: Passenger[] = [
  {
    id: "1", name: "Priya Sharma", photo: "", boardingPoint: "Majestic Bus Stand",
    eta: 3, status: "en_route", phone: "+91 98765 43210", protectionEnabled: true, waitBonus: 200,
  },
  {
    id: "2", name: "Amit Patel", photo: "", boardingPoint: "Majestic Bus Stand",
    eta: 7, status: "en_route", phone: "+91 87654 32109", protectionEnabled: true, waitBonus: 200,
  },
  {
    id: "3", name: "Sneha Reddy", photo: "", boardingPoint: "Majestic Bus Stand",
    eta: 0, status: "boarded", phone: "+91 76543 21098", protectionEnabled: false, waitBonus: 0,
  },
  {
    id: "4", name: "Rahul Verma", photo: "", boardingPoint: "Satellite Bus Stand",
    eta: 0, status: "missed", phone: "+91 65432 10987", protectionEnabled: true, waitBonus: 0,
  },
  {
    id: "5", name: "Kavita Nair", photo: "", boardingPoint: "Majestic Bus Stand",
    eta: 0, status: "boarded", phone: "+91 54321 09876", protectionEnabled: false, waitBonus: 0,
  },
];

const statusColors: Record<string, string> = {
  en_route: "bg-warning/10 text-warning",
  boarded: "bg-success/10 text-success",
  missed: "bg-destructive/10 text-destructive",
  waiting: "bg-primary/10 text-primary",
};

const statusLabels: Record<string, string> = {
  en_route: "En Route",
  boarded: "Boarded",
  missed: "Missed",
  waiting: "Waiting",
};

const filters = ["All", "En Route", "Boarded", "Missed"];

const ConductorDashboard = () => {
  const [activeFilter, setActiveFilter] = useState("All");
  const todayEarnings = 1400;

  const filtered = activeFilter === "All"
    ? mockPassengers
    : mockPassengers.filter((p) => statusLabels[p.status] === activeFilter);

  return (
    <div className="min-h-screen bg-background pt-20 pb-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="gradient-primary rounded-xl p-2.5">
              <Bus className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Conductor Dashboard</h1>
              <p className="text-sm text-muted-foreground">VRL Travels • Bangalore → Goa • 7:00 AM</p>
            </div>
          </div>
        </motion.div>

        {/* Earnings Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card-elevated p-5 my-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Today's Wait Bonuses</p>
              <p className="text-3xl font-bold text-foreground flex items-center">
                <IndianRupee className="h-7 w-7" />{todayEarnings}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Passengers</p>
              <p className="text-3xl font-bold text-foreground">
                {mockPassengers.filter((p) => p.status === "boarded").length}/{mockPassengers.length}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                activeFilter === filter
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              {filter}
              {filter !== "All" && (
                <span className="ml-1.5">
                  ({mockPassengers.filter((p) => statusLabels[p.status] === filter).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Passenger Cards */}
        <div className="space-y-4">
          {filtered.map((passenger, i) => (
            <motion.div
              key={passenger.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-5"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                  <User className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-foreground">{passenger.name}</h3>
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${statusColors[passenger.status]}`}>
                      {statusLabels[passenger.status]}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" /> {passenger.boardingPoint}
                  </p>

                  {passenger.status === "en_route" && (
                    <>
                      <div className="flex items-center gap-2 mt-2">
                        <Clock className="h-4 w-4 text-warning" />
                        <span className="text-sm font-semibold text-warning">
                          Arriving in {passenger.eta} min
                        </span>
                        {passenger.protectionEnabled && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                            Protected
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button variant="success" size="sm" className="flex-1">
                          <CheckCircle className="h-4 w-4" />
                          Wait for ₹{passenger.waitBonus}
                        </Button>
                        <Button variant="destructive" size="sm" className="flex-1">
                          <XCircle className="h-4 w-4" />
                          Mark Missed
                        </Button>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Phone className="h-4 w-4" /> Call
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <MessageCircle className="h-4 w-4" /> Chat
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Filter className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No passengers in this category</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConductorDashboard;
