import { useState, useEffect, useCallback, useRef } from "react";
import {
  startLocationSharing,
  stopLocationSharing,
  updateLiveLocation,
  onLocationChange,
  getUserActiveShares,
  logUserActivity,
  type UserLocation,
} from "@/lib/database";
import { useAuth } from "@/contexts/AuthContext";
import { getErrorMessage } from "@/lib/errors";

interface UseLocationSharingReturn {
  isSharing: boolean;
  shareId: string | null;
  currentLocation: GeolocationPosition | null;
  error: string | null;
  startSharing: (options?: { durationMinutes?: number; tripId?: string }) => Promise<string | null>;
  stopSharing: () => Promise<void>;
  shareLink: string | null;
}

export function useLocationSharing(): UseLocationSharingReturn {
  const { user } = useAuth();
  const [isSharing, setIsSharing] = useState(false);
  const [shareId, setShareId] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<GeolocationPosition | null>(null);
  const currentLocationRef = useRef<GeolocationPosition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    currentLocationRef.current = currentLocation;
  }, [currentLocation]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // Check for existing active shares on mount
  useEffect(() => {
    if (!user) return;
    getUserActiveShares(user.uid).then((shares) => {
      if (shares.length > 0) {
        setShareId(shares[0].shareId);
        setIsSharing(true);
      }
    });
  }, [user]);

  // Watch position automatically to show on map
  useEffect(() => {
    if (!navigator.geolocation) return;

    const id = navigator.geolocation.watchPosition(
      (position) => {
        setCurrentLocation(position);
        setError(null);
        if (isSharing && user) {
          updateLiveLocation(user.uid, position).catch(() => { });
        }
      },
      (err) => {
        console.warn("Geolocation error:", err.message);
        // Don't set error if we already have a location
        if (!currentLocationRef.current) setError(err.message);
      },
      {
        enableHighAccuracy: false, // Set to false first for faster initial lock
        timeout: 15000,
        maximumAge: 10000,
      }
    );

    return () => navigator.geolocation.clearWatch(id);
  }, [isSharing, user]);

  const startSharing = useCallback(
    async (options?: { durationMinutes?: number; tripId?: string }): Promise<string | null> => {
      if (!user) {
        setError("Please sign in to share your location");
        return null;
      }

      try {
        // Create share session in Firebase
        const id = await startLocationSharing(
          user.uid,
          user.displayName || "User",
          {
            durationMinutes: options?.durationMinutes || 120,
            tripId: options?.tripId,
          }
        );

        setShareId(id);
        setIsSharing(true);
        setError(null);
        await logUserActivity(user.uid, {
          type: "location_sharing",
          title: "Live location sharing started",
          description: "Your location sharing session is active.",
          metadata: {
            shareId: id,
            durationMinutes: options?.durationMinutes || 120,
          },
        }).catch(() => undefined);
        return id;
      } catch (err: unknown) {
        setError(getErrorMessage(err, "Failed to start location sharing"));
        return null;
      }
    },
    [user]
  );

  const stopSharing = useCallback(async () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    if (user && shareId) {
      await stopLocationSharing(user.uid, shareId);
      await logUserActivity(user.uid, {
        type: "location_sharing",
        title: "Live location sharing stopped",
        description: "Your location sharing session was turned off.",
        metadata: { shareId },
      }).catch(() => undefined);
    }

    setIsSharing(false);
    setShareId(null);
    setCurrentLocation(null);
  }, [user, shareId]);

  const shareLink = shareId ? `${window.location.origin}/tracking?share=${shareId}&uid=${user?.uid}` : null;

  return {
    isSharing,
    shareId,
    currentLocation,
    error,
    startSharing,
    stopSharing,
    shareLink,
  };
}

// Hook to watch someone else's location
export function useWatchLocation(targetUid: string | null) {
  const [location, setLocation] = useState<UserLocation | null>(null);

  useEffect(() => {
    if (!targetUid) return;

    const unsubscribe = onLocationChange(targetUid, (loc) => {
      setLocation(loc);
    });

    return () => unsubscribe();
  }, [targetUid]);

  return location;
}
