import { db } from "@/lib/firebase";
import { ref, set, get, push, onValue, update, off, remove } from "firebase/database";
import type { Unsubscribe } from "firebase/database";

// ── User Profiles ──

export interface UserProfile {
  name: string;
  email: string;
  phone?: string;
  username?: string;
  photoURL?: string;
  createdAt: number;
}

export const saveUserProfile = async (uid: string, profile: UserProfile) => {
  await update(ref(db, `users/${uid}`), profile);
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const snapshot = await get(ref(db, `users/${uid}`));
  return snapshot.exists() ? (snapshot.val() as UserProfile) : null;
};

export const updateUserProfileField = async (uid: string, fields: Partial<UserProfile>) => {
  await update(ref(db, `users/${uid}`), fields);
};

// ── User Activity / Dashboard ──

export type ActivityType =
  | "auth"
  | "journey_search"
  | "trip_booked"
  | "location_sharing"
  | "profile"
  | "safety";

export interface UserActivity {
  type: ActivityType;
  title: string;
  description: string;
  createdAt: number;
  metadata?: Record<string, string | number | boolean | null>;
}

export interface DashboardJourneySearch {
  startPoint: string;
  busStation: string;
  destination: string;
  date?: string;
  time?: string;
  createdAt: number;
}

export interface DashboardSnapshot {
  profile: UserProfile | null;
  trips: Record<string, Trip>;
  searches: DashboardJourneySearch[];
  activities: UserActivity[];
  activeShares: LocationShare[];
}

export const logUserActivity = async (uid: string, activity: Omit<UserActivity, "createdAt"> & { createdAt?: number }) => {
  const activitiesRef = ref(db, `users/${uid}/activities`);
  const newActivityRef = push(activitiesRef);
  await set(newActivityRef, {
    ...activity,
    createdAt: activity.createdAt || Date.now(),
  });
};

export const getUserActivities = async (uid: string, limit = 20): Promise<UserActivity[]> => {
  const snapshot = await get(ref(db, `users/${uid}/activities`));
  if (!snapshot.exists()) return [];

  const activities = snapshot.val() as Record<string, UserActivity>;
  return Object.values(activities)
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, limit);
};

export const getUserJourneySearches = async (uid: string, limit = 6): Promise<DashboardJourneySearch[]> => {
  const snapshot = await get(ref(db, `users/${uid}/journey_searches`));
  if (!snapshot.exists()) return [];

  const searches = snapshot.val() as Record<string, DashboardJourneySearch>;
  return Object.values(searches)
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, limit);
};

export const getUserDashboardSnapshot = async (uid: string): Promise<DashboardSnapshot> => {
  const [profile, trips, searches, activities, activeShares] = await Promise.all([
    getUserProfile(uid),
    getUserTrips(uid),
    getUserJourneySearches(uid),
    getUserActivities(uid),
    getUserActiveShares(uid),
  ]);

  return {
    profile,
    trips,
    searches,
    activities,
    activeShares,
  };
};

// ── Usernames (unique, user-chosen) ──

export const checkUsernameAvailable = async (username: string): Promise<boolean> => {
  const normalized = username.toLowerCase().trim();
  if (normalized.length < 3 || normalized.length > 20) return false;
  if (!/^[a-zA-Z0-9_]+$/.test(normalized)) return false;

  const snapshot = await get(ref(db, `usernames/${normalized}`));
  return !snapshot.exists();
};

export const claimUsername = async (uid: string, username: string): Promise<boolean> => {
  const normalized = username.toLowerCase().trim();

  // Validate format
  if (normalized.length < 3 || normalized.length > 20) return false;
  if (!/^[a-zA-Z0-9_]+$/.test(normalized)) return false;

  // Check availability
  const snapshot = await get(ref(db, `usernames/${normalized}`));
  if (snapshot.exists()) return false;

  // Get the user's old username and release it
  const profileSnap = await get(ref(db, `users/${uid}/username`));
  if (profileSnap.exists()) {
    const oldUsername = profileSnap.val() as string;
    await remove(ref(db, `usernames/${oldUsername.toLowerCase()}`));
  }

  // Claim the new username
  await set(ref(db, `usernames/${normalized}`), uid);
  await update(ref(db, `users/${uid}`), { username: normalized });

  return true;
};

export const getUserByUsername = async (username: string): Promise<{ uid: string; profile: UserProfile } | null> => {
  const normalized = username.toLowerCase().trim();
  const uidSnapshot = await get(ref(db, `usernames/${normalized}`));
  if (!uidSnapshot.exists()) return null;

  const uid = uidSnapshot.val() as string;
  const profile = await getUserProfile(uid);
  if (!profile) return null;

  return { uid, profile };
};

// ── Profile Picture ──

export const saveProfilePicture = async (uid: string, photoURL: string) => {
  await update(ref(db, `users/${uid}`), { photoURL });
};

// Convert file to base64 data URL (for Firebase Realtime DB storage)
export const fileToDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Max size: 500KB
    if (file.size > 500 * 1024) {
      reject(new Error("Image must be less than 500KB"));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
};

// Compress and resize image before upload
export const compressImage = (file: File, maxWidth = 256, quality = 0.7): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement("canvas");

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas not supported"));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL("image/jpeg", quality);
      resolve(dataUrl);
    };

    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
};

// ── Trips ──

export interface TripLeg {
  id: string;
  type: string;
  from: string;
  to: string;
  duration: number;
  cost: number;
  distance?: number;
  status: string;
  vehicle?: string;
  operator?: string;
  departureTime?: string;
  arrivalTime?: string;
}

export interface Trip {
  userId: string;
  from: string;
  to: string;
  date: string;
  totalCost: number;
  protectionEnabled: boolean;
  status: "active" | "completed" | "cancelled";
  legs: TripLeg[];
  createdAt: number;
}

export const saveTrip = async (trip: Trip): Promise<string> => {
  const tripsRef = ref(db, `users/${trip.userId}/trips`);
  const newTripRef = push(tripsRef);
  await set(newTripRef, trip);
  return newTripRef.key!;
};

export const getUserTrips = async (userId: string): Promise<Record<string, Trip>> => {
  const snapshot = await get(ref(db, `users/${userId}/trips`));
  if (!snapshot.exists()) return {};
  return snapshot.val() as Record<string, Trip>;
};

// ── Passengers (Conductor) ──

export interface PassengerData {
  name: string;
  boardingPoint: string;
  eta: number;
  status: "en_route" | "boarded" | "missed" | "waiting";
  phone: string;
  protectionEnabled: boolean;
  waitBonus: number;
}

export const updatePassengerStatus = async (
  tripId: string,
  passengerId: string,
  status: PassengerData["status"]
) => {
  await update(ref(db, `trips/${tripId}/passengers/${passengerId}`), { status });
};

export const onPassengersChange = (
  tripId: string,
  callback: (passengers: Record<string, PassengerData> | null) => void
): Unsubscribe => {
  const passengersRef = ref(db, `trips/${tripId}/passengers`);
  const unsubscribe = onValue(passengersRef, (snapshot) => {
    callback(snapshot.exists() ? snapshot.val() : null);
  });
  return () => off(passengersRef);
};

// ── Live Tracking ──

export interface TrackingData {
  progress: number;
  eta: number;
  busStatus: "on_time" | "delayed";
  lastUpdated: number;
}

export const updateTracking = async (tripId: string, data: Partial<TrackingData>) => {
  await update(ref(db, `tracking/${tripId}`), { ...data, lastUpdated: Date.now() });
};

export const onTrackingChange = (
  tripId: string,
  callback: (data: TrackingData | null) => void
): Unsubscribe => {
  const trackingRef = ref(db, `tracking/${tripId}`);
  const unsubscribe = onValue(trackingRef, (snapshot) => {
    callback(snapshot.exists() ? snapshot.val() : null);
  });
  return () => off(trackingRef);
};

// ── Real-Time Location Sharing ──

export interface UserLocation {
  lat: number;
  lng: number;
  accuracy: number;
  heading: number | null;
  speed: number | null;
  timestamp: number;
  userId: string;
  userName: string;
  isSharing: boolean;
}

export interface LocationShare {
  shareId: string;
  ownerUid: string;
  ownerName: string;
  sharedWith: string[]; // UIDs or "public"
  tripId: string | null;
  expiresAt: number;
  createdAt: number;
  isActive: boolean;
}

// Start sharing location — creates a share session
export const startLocationSharing = async (
  uid: string,
  userName: string,
  options?: { sharedWith?: string[]; tripId?: string; durationMinutes?: number }
): Promise<string> => {
  const sharesRef = ref(db, "location_shares");
  const newShareRef = push(sharesRef);
  const shareId = newShareRef.key!;

  const durationMs = (options?.durationMinutes || 120) * 60 * 1000; // default 2 hours

  const shareData: LocationShare = {
    shareId,
    ownerUid: uid,
    ownerName: userName,
    sharedWith: options?.sharedWith || ["public"],
    tripId: options?.tripId || null,
    expiresAt: Date.now() + durationMs,
    createdAt: Date.now(),
    isActive: true,
  };

  await set(newShareRef, shareData);
  await set(ref(db, `users/${uid}/location_shares/${shareId}`), shareData);

  // Create initial location entry
  await set(ref(db, `live_locations/${uid}`), {
    lat: 0,
    lng: 0,
    accuracy: 0,
    heading: null,
    speed: null,
    timestamp: Date.now(),
    userId: uid,
    userName,
    isSharing: true,
    shareId,
  });

  return shareId;
};

// Update real-time location
export const updateLiveLocation = async (uid: string, position: GeolocationPosition) => {
  await update(ref(db, `live_locations/${uid}`), {
    lat: position.coords.latitude,
    lng: position.coords.longitude,
    accuracy: position.coords.accuracy,
    heading: position.coords.heading,
    speed: position.coords.speed,
    timestamp: Date.now(),
    isSharing: true,
  });
};

// Stop sharing location
export const stopLocationSharing = async (uid: string, shareId: string) => {
  await update(ref(db, `live_locations/${uid}`), { isSharing: false });
  await update(ref(db, `location_shares/${shareId}`), { isActive: false });
  await update(ref(db, `users/${uid}/location_shares/${shareId}`), { isActive: false });
};

// Listen to someone's real-time location
export const onLocationChange = (
  targetUid: string,
  callback: (location: UserLocation | null) => void
): Unsubscribe => {
  const locationRef = ref(db, `live_locations/${targetUid}`);
  const unsubscribe = onValue(locationRef, (snapshot) => {
    callback(snapshot.exists() ? snapshot.val() : null);
  });
  return () => off(locationRef);
};

// Get an active share session
export const getLocationShare = async (shareId: string): Promise<LocationShare | null> => {
  const snapshot = await get(ref(db, `location_shares/${shareId}`));
  return snapshot.exists() ? snapshot.val() : null;
};

// Get all active shares for a user
export const getUserActiveShares = async (uid: string): Promise<LocationShare[]> => {
  const snapshot = await get(ref(db, `users/${uid}/location_shares`));
  if (!snapshot.exists()) return [];

  const all = snapshot.val() as Record<string, LocationShare>;
  return Object.values(all).filter(
    (s) => s.ownerUid === uid && s.isActive && s.expiresAt > Date.now()
  );
};
