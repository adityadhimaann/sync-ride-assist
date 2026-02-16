export interface LatLng {
  lat: number;
  lng: number;
}

export interface JourneyLeg {
  id: string;
  type: 'local_transport' | 'wait' | 'intercity_bus' | 'walk';
  from: string;
  to: string;
  duration: number; // minutes
  cost: number; // INR
  distance?: number; // km
  status: 'upcoming' | 'in_progress' | 'completed' | 'delayed';
  vehicle?: string;
  operator?: string;
  departureTime: string;
  arrivalTime: string;
  alternatives?: JourneyLeg[];
}

export interface Trip {
  id: string;
  legs: JourneyLeg[];
  totalDuration: number;
  totalCost: number;
  bufferTime: number;
  protectionEnabled: boolean;
  protectionCost: number;
  status: 'planning' | 'booked' | 'in_progress' | 'completed' | 'missed';
}

export interface Passenger {
  id: string;
  name: string;
  photo: string;
  boardingPoint: string;
  eta: number; // minutes
  status: 'en_route' | 'boarded' | 'missed' | 'waiting';
  phone: string;
  protectionEnabled: boolean;
  waitBonus: number;
}

export interface BusRoute {
  id: string;
  operator: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  seatsAvailable: number;
  amenities: string[];
  rating: number;
}
