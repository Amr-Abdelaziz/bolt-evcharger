import { useState, useEffect } from 'react';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
}

const useGeolocation = (): GeolocationState => {
  const [location, setLocation] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    error: null,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation({
        latitude: null,
        longitude: null,
        error: 'Geolocation is not supported by this browser.',
      });
      return;
    }

    if (window.location.protocol !== 'https:') {
      setLocation({
        latitude: null,
        longitude: null,
        error: 'Geolocation requires a secure (HTTPS) connection.',
      });
      return;
    }

    const success = (position: GeolocationPosition) => {
      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        error: null,
      });
    };

    const error = (err: GeolocationPositionError) => {
      let errorMessage = 'Unable to retrieve your location.';
      switch (err.code) {
        case err.PERMISSION_DENIED:
          errorMessage = 'Location access was denied. Please enable it in your browser settings.';
          break;
        case err.POSITION_UNAVAILABLE:
          errorMessage = 'Location information is unavailable.';
          break;
        case err.TIMEOUT:
          errorMessage = 'The request to get user location timed out.';
          break;
        default:
          errorMessage = 'An unknown error occurred while retrieving location.';
      }
      setLocation({
        latitude: null,
        longitude: null,
        error: errorMessage,
      });
    };

    const options = {
      enableHighAccuracy: true,
      maximumAge: 10000,
      timeout: 5000,
    };

    navigator.geolocation.getCurrentPosition(success, error, options);
  }, []);

  return location;
};

export default useGeolocation;
