type GoogleMapsNamespace = {
  maps: Record<string, unknown>;
};

declare global {
  interface Window {
    google?: GoogleMapsNamespace;
    __syncRideGoogleMapsPromise?: Promise<GoogleMapsNamespace>;
    gm_authFailure?: () => void;
  }
}

const GOOGLE_MAPS_SCRIPT_ID = "syncride-google-maps";

export const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
export const googleDirectionsApiKey =
  (import.meta.env.VITE_GOOGLE_DIRECTIONS_API_KEY as string | undefined) || googleMapsApiKey;
export const googleMapsScriptApiKey = googleMapsApiKey || googleDirectionsApiKey;

export const isGoogleMapsConfigured = Boolean(googleMapsScriptApiKey);
export const isGoogleDirectionsConfigured = Boolean(googleDirectionsApiKey);

export const loadGoogleMaps = (): Promise<GoogleMapsNamespace> => {
  if (!googleMapsScriptApiKey) {
    return Promise.reject(
      new Error(
        "Missing VITE_GOOGLE_MAPS_API_KEY. Add your Google Maps browser API key to .env and restart Vite."
      )
    );
  }

  if (window.google?.maps) return Promise.resolve(window.google);
  if (window.__syncRideGoogleMapsPromise) return window.__syncRideGoogleMapsPromise;

  window.__syncRideGoogleMapsPromise = new Promise((resolve, reject) => {
    window.gm_authFailure = () => {
      reject(
        new Error(
          "Google Maps rejected this browser key. Enable billing, Maps JavaScript API, Places API, Geocoding API, and Directions API, then allow http://localhost:8080/* in HTTP referrer restrictions."
        )
      );
    };

    const existingScript = document.getElementById(GOOGLE_MAPS_SCRIPT_ID) as HTMLScriptElement | null;

    if (existingScript) {
      existingScript.addEventListener("load", () => {
        if (window.google?.maps) resolve(window.google);
        else reject(new Error("Google Maps loaded, but the Maps SDK was unavailable. Check API key restrictions."));
      });
      existingScript.addEventListener("error", () => reject(new Error("Failed to load Google Maps.")));
      return;
    }

    const params = new URLSearchParams({
      key: googleMapsScriptApiKey,
      libraries: "places",
      v: "weekly",
    });

    const script = document.createElement("script");
    script.id = GOOGLE_MAPS_SCRIPT_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google?.maps) resolve(window.google);
      else reject(new Error("Google Maps loaded, but the Maps SDK was unavailable. Check API key restrictions."));
    };
    script.onerror = () => reject(new Error("Failed to load Google Maps."));

    document.head.appendChild(script);
  });

  return window.__syncRideGoogleMapsPromise;
};
