"use client";

import { useState, useEffect } from "react";

export interface GeoLocation {
  latitude: number;
  longitude: number;
}

export const useGeolocation = () => {
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setIsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setIsLoading(false);
      },
      (err) => {
        setIsLoading(false);
        if (err.code === 1) {
          setError(
            "Location permission denied. Please enable GPS or search manually.",
          );
        } else {
          setError("Unable to retrieve your location.");
        }
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 },
    );
  };

  // Automatically try to get location on mount (optional, but good for UX)
  useEffect(() => {
    getLocation();
  }, []);

  return { location, error, isLoading, getLocation };
};
