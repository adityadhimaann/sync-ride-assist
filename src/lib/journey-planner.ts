import { db } from "@/lib/firebase";
import { ref, set, push, get } from "firebase/database";
import type { JourneyLeg } from "@/types/trip";

// ── Types ──

export interface JourneySearchParams {
  startPoint: string;
  busStation: string;
  destination: string;
  date: string;       // YYYY-MM-DD
  time: string;       // HH:mm
}

export interface JourneyPlan {
  id: string;
  searchParams: JourneySearchParams;
  legs: JourneyLeg[];
  totalCost: number;
  totalDuration: number;   // minutes
  totalDistance: number;    // km
  departureTime: string;
  arrivalTime: string;
  trafficAlert: TrafficAlert | null;
  alternatives: JourneyPlanAlternative[];
  createdAt: number;
}

export interface JourneyPlanAlternative {
  id: string;
  label: string;
  totalCost: number;
  totalDuration: number;
  totalDistance: number;
  legs: JourneyLeg[];
  departureTime: string;
  arrivalTime: string;
}

export interface TrafficAlert {
  message: string;
  severity: "low" | "medium" | "high";
  affectedLeg: string;
  extraBuffer: number; // extra minutes added
}

// ── City/Route Database (simulated backend data) ──

interface CityData {
  name: string;
  aliases: string[];
  state: string;
  busStands: string[];
}

const CITIES: CityData[] = [
  { name: "Bangalore", aliases: ["bengaluru", "blr", "bangalore"], state: "Karnataka", busStands: ["Majestic Bus Stand", "Kempegowda Bus Station", "Satellite Bus Station", "Shantinagar Bus Stand"] },
  { name: "Mumbai", aliases: ["bombay", "mumbai"], state: "Maharashtra", busStands: ["Mumbai Central", "Dadar Bus Stand", "Borivali Bus Stand", "Thane Bus Stand"] },
  { name: "Chennai", aliases: ["madras", "chennai"], state: "Tamil Nadu", busStands: ["CMBT", "Koyambedu Bus Stand", "Tambaram Bus Stand", "Egmore Bus Stand"] },
  { name: "Hyderabad", aliases: ["hyderabad", "hyd"], state: "Telangana", busStands: ["Mahatma Gandhi Bus Station", "JBS Jubilee", "Miyapur Bus Stand", "LB Nagar Bus Stand"] },
  { name: "Goa", aliases: ["goa", "panaji", "panjim"], state: "Goa", busStands: ["Kadamba Bus Stand (Panaji)", "Mapusa Bus Stand", "Margao Bus Stand", "Vasco Bus Stand"] },
  { name: "Mysore", aliases: ["mysore", "mysuru"], state: "Karnataka", busStands: ["Mysore KSRTC Bus Stand", "Mysore Central Bus Stand"] },
  { name: "Pune", aliases: ["pune", "poona"], state: "Maharashtra", busStands: ["Shivajinagar Bus Stand", "Swargate Bus Stand", "Pune Station Bus Stand", "Wakad Bus Stand"] },
  { name: "Delhi", aliases: ["delhi", "new delhi", "ncr"], state: "Delhi", busStands: ["ISBT Kashmere Gate", "Anand Vihar ISBT", "Sarai Kale Khan ISBT"] },
  { name: "Kolkata", aliases: ["kolkata", "calcutta"], state: "West Bengal", busStands: ["Esplanade Bus Stand", "Howrah Bus Stand", "Karunamoyee Bus Stand"] },
  { name: "Coimbatore", aliases: ["coimbatore", "kovai"], state: "Tamil Nadu", busStands: ["Gandhipuram Bus Stand", "Ukkadam Bus Stand", "Singanallur Bus Stand"] },
  { name: "Mangalore", aliases: ["mangalore", "mangaluru"], state: "Karnataka", busStands: ["KSRTC Mangalore Bus Stand", "Mangalore Central Bus Stand"] },
  { name: "Jaipur", aliases: ["jaipur"], state: "Rajasthan", busStands: ["Sindhi Camp Bus Stand", "Narayan Singh Circle Bus Stand"] },
  { name: "Ahmedabad", aliases: ["ahmedabad"], state: "Gujarat", busStands: ["Geeta Mandir Bus Stand", "Paldi Bus Stand"] },
  { name: "Kochi", aliases: ["kochi", "cochin", "ernakulam"], state: "Kerala", busStands: ["Ernakulam KSRTC Bus Stand", "Vytilla Bus Hub"] },
];

interface BusOperator {
  name: string;
  types: BusType[];
}

interface BusType {
  name: string;
  pricePerKm: number;
  amenities: string[];
  rating: number;
  seatsRange: [number, number];
}

const BUS_OPERATORS: BusOperator[] = [
  {
    name: "VRL Travels",
    types: [
      { name: "Volvo Multi-Axle Sleeper", pricePerKm: 2.2, amenities: ["WiFi", "AC", "Blanket", "Water Bottle", "Charging Point"], rating: 4.5, seatsRange: [8, 28] },
      { name: "AC Sleeper", pricePerKm: 1.8, amenities: ["AC", "Water Bottle", "Charging Point"], rating: 4.2, seatsRange: [10, 30] },
      { name: "Non-AC Seater", pricePerKm: 1.0, amenities: ["Water Bottle"], rating: 3.8, seatsRange: [15, 40] },
    ],
  },
  {
    name: "SRS Travels",
    types: [
      { name: "Mercedes Multi-Axle", pricePerKm: 2.5, amenities: ["WiFi", "AC", "Blanket", "Water Bottle", "Charging Point", "Entertainment"], rating: 4.7, seatsRange: [5, 20] },
      { name: "Volvo AC Seater", pricePerKm: 1.6, amenities: ["AC", "Water Bottle", "Charging Point"], rating: 4.3, seatsRange: [12, 35] },
    ],
  },
  {
    name: "KSRTC Airavat",
    types: [
      { name: "Airavat Club Class", pricePerKm: 2.0, amenities: ["WiFi", "AC", "Blanket", "Water Bottle"], rating: 4.4, seatsRange: [10, 25] },
      { name: "Airavat AC Sleeper", pricePerKm: 1.5, amenities: ["AC", "Blanket"], rating: 4.1, seatsRange: [12, 30] },
      { name: "Rajahamsa", pricePerKm: 0.9, amenities: ["Fan"], rating: 3.5, seatsRange: [20, 45] },
    ],
  },
  {
    name: "Orange Travels",
    types: [
      { name: "Volvo AC Sleeper", pricePerKm: 2.1, amenities: ["WiFi", "AC", "Blanket", "Charging Point"], rating: 4.3, seatsRange: [8, 24] },
      { name: "AC Seater/Sleeper", pricePerKm: 1.4, amenities: ["AC", "Water Bottle"], rating: 4.0, seatsRange: [15, 35] },
    ],
  },
  {
    name: "Neeta Travels",
    types: [
      { name: "Scania Multi-Axle", pricePerKm: 2.4, amenities: ["WiFi", "AC", "Blanket", "Water Bottle", "Charging Point", "Snacks"], rating: 4.6, seatsRange: [6, 22] },
      { name: "AC Sleeper", pricePerKm: 1.7, amenities: ["AC", "Charging Point"], rating: 4.2, seatsRange: [10, 28] },
    ],
  },
  {
    name: "Intercity Bus Service",
    types: [
      { name: "Standard AC", pricePerKm: 1.3, amenities: ["AC"], rating: 3.9, seatsRange: [15, 40] },
      { name: "Deluxe Non-AC", pricePerKm: 0.8, amenities: [], rating: 3.4, seatsRange: [25, 45] },
    ],
  },
];

// Approximate intercity distances (km) between major cities
const DISTANCE_MAP: Record<string, Record<string, number>> = {
  Bangalore: { Mumbai: 980, Chennai: 350, Hyderabad: 570, Goa: 560, Mysore: 150, Pune: 840, Delhi: 2150, Kolkata: 1870, Coimbatore: 365, Mangalore: 350, Kochi: 550, Jaipur: 1740, Ahmedabad: 1500 },
  Mumbai: { Bangalore: 980, Chennai: 1280, Hyderabad: 710, Goa: 590, Pune: 150, Delhi: 1400, Kolkata: 2050, Ahmedabad: 530, Jaipur: 1150, Mangalore: 900 },
  Chennai: { Bangalore: 350, Mumbai: 1280, Hyderabad: 630, Coimbatore: 500, Kochi: 690, Kolkata: 1660, Mysore: 480, Mangalore: 640 },
  Hyderabad: { Bangalore: 570, Mumbai: 710, Chennai: 630, Pune: 560, Delhi: 1550, Goa: 650, Kolkata: 1500, Ahmedabad: 1200 },
  Goa: { Bangalore: 560, Mumbai: 590, Pune: 460, Hyderabad: 650, Mangalore: 370, Chennai: 880 },
  Mysore: { Bangalore: 150, Chennai: 480, Coimbatore: 210, Kochi: 430, Mangalore: 240, Goa: 560 },
  Pune: { Mumbai: 150, Bangalore: 840, Hyderabad: 560, Goa: 460, Ahmedabad: 660, Delhi: 1400 },
  Delhi: { Mumbai: 1400, Bangalore: 2150, Jaipur: 280, Kolkata: 1500, Ahmedabad: 940, Hyderabad: 1550 },
  Kolkata: { Delhi: 1500, Mumbai: 2050, Bangalore: 1870, Chennai: 1660, Hyderabad: 1500 },
  Coimbatore: { Bangalore: 365, Chennai: 500, Mysore: 210, Kochi: 190, Mangalore: 350 },
  Mangalore: { Bangalore: 350, Goa: 370, Mysore: 240, Chennai: 640, Kochi: 410, Coimbatore: 350 },
  Jaipur: { Delhi: 280, Mumbai: 1150, Ahmedabad: 660, Bangalore: 1740 },
  Ahmedabad: { Mumbai: 530, Delhi: 940, Pune: 660, Jaipur: 660, Bangalore: 1500 },
  Kochi: { Bangalore: 550, Coimbatore: 190, Chennai: 690, Mysore: 430, Mangalore: 410 },
};

// ── Helper Functions ──

function matchCity(input: string): CityData | null {
  const normalized = input.toLowerCase().trim();
  for (const city of CITIES) {
    if (city.aliases.some((alias) => normalized.includes(alias))) return city;
    if (normalized.includes(city.name.toLowerCase())) return city;
    // Check bus stand names too
    if (city.busStands.some((bs) => normalized.toLowerCase().includes(bs.toLowerCase()))) return city;
  }
  return null;
}

function getDistance(from: string, to: string): number {
  const fromCity = matchCity(from);
  const toCity = matchCity(to);

  if (fromCity && toCity && fromCity.name !== toCity.name) {
    return DISTANCE_MAP[fromCity.name]?.[toCity.name] || DISTANCE_MAP[toCity.name]?.[fromCity.name] || 400;
  }
  return 400; // default fallback
}

function addMinutes(timeStr: string, minutes: number): string {
  const [h, m] = timeStr.split(":").map(Number);
  const totalMin = h * 60 + m + minutes;
  const newH = Math.floor(totalMin / 60) % 24;
  const newM = totalMin % 60;
  const suffix = newH >= 12 ? "PM" : "AM";
  const displayH = newH === 0 ? 12 : newH > 12 ? newH - 12 : newH;
  return `${displayH}:${String(newM).padStart(2, "0")} ${suffix}`;
}

function formatTime24(timeStr: string): string {
  // handle "HH:mm" → "H:MM AM/PM"
  const [h, m] = timeStr.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${displayH}:${String(m).padStart(2, "0")} ${suffix}`;
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateLocalTransportOptions(from: string, to: string, departureTime: string) {
  const localDistance = randomBetween(5, 20);
  const baseDuration = Math.round(localDistance * 2.5); // ~2.5 min/km in city traffic
  const trafficMultiplier = 1 + Math.random() * 0.4; // 0-40% traffic
  const duration = Math.round(baseDuration * trafficMultiplier);

  const options = [
    { vehicle: "Auto Rickshaw", costMultiplier: 1.0 },
    { vehicle: "Ola/Uber Cab", costMultiplier: 1.5 },
    { vehicle: "City Bus", costMultiplier: 0.3 },
    { vehicle: "Metro + Auto", costMultiplier: 0.7 },
  ];

  const option = options[randomBetween(0, options.length - 1)];
  const baseCost = localDistance * 15; // ₹15/km base
  const cost = Math.round(baseCost * option.costMultiplier);

  return {
    vehicle: option.vehicle,
    duration,
    cost,
    distance: localDistance,
    arrivalTime: addMinutes(departureTime, duration),
  };
}

function generateTrafficAlert(startPoint: string): TrafficAlert | null {
  const alerts = [
    { message: `Heavy traffic detected near ${startPoint}`, severity: "high" as const, extraBuffer: 10 },
    { message: "Moderate congestion on your route to bus station", severity: "medium" as const, extraBuffer: 5 },
    { message: "Road construction ahead — slight delay expected", severity: "medium" as const, extraBuffer: 7 },
    { message: "Rain-affected roads — drive carefully", severity: "low" as const, extraBuffer: 5 },
  ];

  // 60% chance of a traffic alert
  if (Math.random() < 0.6) {
    return { ...alerts[randomBetween(0, alerts.length - 1)], affectedLeg: "1" };
  }
  return null;
}

// ── Main Journey Planner ──

export function planJourney(params: JourneySearchParams): JourneyPlan {
  const { startPoint, busStation, destination, date, time } = params;

  const departureTime = time || "07:00";
  const intercityDistance = getDistance(busStation, destination);

  // 1) Generate local transport leg (home → bus station)
  const local = generateLocalTransportOptions(startPoint, busStation, departureTime);

  const localLeg: JourneyLeg = {
    id: "1",
    type: "local_transport",
    from: startPoint || "Your Location",
    to: busStation || "Bus Station",
    duration: local.duration,
    cost: local.cost,
    distance: local.distance,
    status: "upcoming",
    vehicle: local.vehicle,
    departureTime: formatTime24(departureTime),
    arrivalTime: local.arrivalTime,
  };

  // 2) Generate traffic alert
  const trafficAlert = generateTrafficAlert(startPoint);
  const extraBuffer = trafficAlert ? trafficAlert.extraBuffer : 0;

  // 3) Buffer/wait time at bus station
  const bufferDuration = randomBetween(15, 30) + extraBuffer;
  const bufferStartTime = local.arrivalTime;
  const bufferEndTime = addMinutes(departureTime, local.duration + bufferDuration);

  const bufferLeg: JourneyLeg = {
    id: "2",
    type: "wait",
    from: busStation || "Bus Station",
    to: busStation || "Bus Station",
    duration: bufferDuration,
    cost: 0,
    status: "upcoming",
    departureTime: bufferStartTime,
    arrivalTime: bufferEndTime,
  };

  // 4) Generate intercity bus leg
  const operator = BUS_OPERATORS[randomBetween(0, BUS_OPERATORS.length - 1)];
  const busType = operator.types[randomBetween(0, operator.types.length - 1)];
  const busCost = Math.round(intercityDistance * busType.pricePerKm);
  const busSpeed = busType.pricePerKm > 1.5 ? 65 : 55; // km/h avg
  const busDuration = Math.round((intercityDistance / busSpeed) * 60);
  const busDepTime = bufferEndTime;
  const busArrTime = addMinutes(departureTime, local.duration + bufferDuration + busDuration);

  const destCity = matchCity(destination);
  const destinationName = destCity ? `${destCity.busStands[0]}, ${destCity.name}` : destination || "Destination";

  const intercityLeg: JourneyLeg = {
    id: "3",
    type: "intercity_bus",
    from: busStation || "Bus Station",
    to: destinationName,
    duration: busDuration,
    cost: busCost,
    distance: intercityDistance,
    status: "upcoming",
    vehicle: busType.name,
    operator: operator.name,
    departureTime: busDepTime,
    arrivalTime: busArrTime,
  };

  const legs = [localLeg, bufferLeg, intercityLeg];
  const totalCost = legs.reduce((sum, l) => sum + l.cost, 0);
  const totalDuration = legs.reduce((sum, l) => sum + l.duration, 0);

  // 5) Generate alternatives
  const alternatives = generateAlternatives(params, departureTime, intercityDistance, local, bufferDuration);

  const plan: JourneyPlan = {
    id: `plan_${Date.now()}`,
    searchParams: params,
    legs,
    totalCost,
    totalDuration,
    totalDistance: (local.distance || 0) + intercityDistance,
    departureTime: formatTime24(departureTime),
    arrivalTime: busArrTime,
    trafficAlert,
    alternatives,
    createdAt: Date.now(),
  };

  return plan;
}

function generateAlternatives(
  params: JourneySearchParams,
  departureTime: string,
  intercityDistance: number,
  localInfo: { duration: number; cost: number; distance: number },
  baseBufDur: number
): JourneyPlanAlternative[] {
  const alts: JourneyPlanAlternative[] = [];

  // Generate 2 alternatives
  for (let i = 0; i < 2; i++) {
    const operator = BUS_OPERATORS[randomBetween(0, BUS_OPERATORS.length - 1)];
    const busType = operator.types[randomBetween(0, operator.types.length - 1)];
    const busCost = Math.round(intercityDistance * busType.pricePerKm);
    const busSpeed = busType.pricePerKm > 1.5 ? 65 : 55;
    const busDuration = Math.round((intercityDistance / busSpeed) * 60);
    const bufDur = baseBufDur + randomBetween(-5, 10);
    const totalDuration = localInfo.duration + bufDur + busDuration;

    const destCity = matchCity(params.destination);
    const destinationName = destCity ? `${destCity.busStands[randomBetween(0, destCity.busStands.length - 1)]}, ${destCity.name}` : params.destination;

    const altLegs: JourneyLeg[] = [
      {
        id: `alt${i}_1`,
        type: "local_transport",
        from: params.startPoint || "Your Location",
        to: params.busStation || "Bus Station",
        duration: localInfo.duration,
        cost: localInfo.cost,
        distance: localInfo.distance,
        status: "upcoming",
        vehicle: ["Ola/Uber Cab", "Auto Rickshaw", "Metro + Auto", "City Bus"][randomBetween(0, 3)],
        departureTime: formatTime24(departureTime),
        arrivalTime: addMinutes(departureTime, localInfo.duration),
      },
      {
        id: `alt${i}_2`,
        type: "wait",
        from: params.busStation || "Bus Station",
        to: params.busStation || "Bus Station",
        duration: bufDur,
        cost: 0,
        status: "upcoming",
        departureTime: addMinutes(departureTime, localInfo.duration),
        arrivalTime: addMinutes(departureTime, localInfo.duration + bufDur),
      },
      {
        id: `alt${i}_3`,
        type: "intercity_bus",
        from: params.busStation || "Bus Station",
        to: destinationName,
        duration: busDuration,
        cost: busCost,
        distance: intercityDistance,
        status: "upcoming",
        vehicle: busType.name,
        operator: operator.name,
        departureTime: addMinutes(departureTime, localInfo.duration + bufDur),
        arrivalTime: addMinutes(departureTime, totalDuration),
      },
    ];

    const totalCost = altLegs.reduce((s, l) => s + l.cost, 0);

    alts.push({
      id: `alt_${i}_${Date.now()}`,
      label: i === 0 ? "💰 Budget Option" : "⚡ Fastest Route",
      totalCost,
      totalDuration,
      totalDistance: (localInfo.distance || 0) + intercityDistance,
      legs: altLegs,
      departureTime: formatTime24(departureTime),
      arrivalTime: addMinutes(departureTime, totalDuration),
    });
  }

  // Sort: budget first (cheapest), fastest second (shortest duration)
  alts.sort((a, b) => a.totalCost - b.totalCost);
  if (alts[0]) alts[0].label = "💰 Budget Option";
  if (alts[1]) alts[1].label = "⚡ Fastest Route";

  return alts;
}

// ── Firebase Integration ──

export const saveJourneySearch = async (
  userId: string,
  params: JourneySearchParams
): Promise<string> => {
  const searchesRef = ref(db, `users/${userId}/journey_searches`);
  const newRef = push(searchesRef);
  await set(newRef, {
    ...params,
    createdAt: Date.now(),
  });
  return newRef.key!;
};

export const saveJourneyPlan = async (
  userId: string,
  plan: JourneyPlan
): Promise<string> => {
  const plansRef = ref(db, `users/${userId}/journey_plans`);
  const newRef = push(plansRef);
  await set(newRef, {
    ...plan,
    savedAt: Date.now(),
  });
  return newRef.key!;
};

export const getUserJourneyHistory = async (
  userId: string
): Promise<JourneySearchParams[]> => {
  const snapshot = await get(ref(db, `users/${userId}/journey_searches`));
  if (!snapshot.exists()) return [];

  const all = snapshot.val() as Record<string, JourneySearchParams & { createdAt: number }>;
  return Object.values(all)
    .sort((a, b) => b.createdAt - a.createdAt)
    .map(({ createdAt: _ts, ...params }) => params);
};