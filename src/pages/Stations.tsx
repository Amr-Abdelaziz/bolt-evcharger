import React, { useEffect, useState } from 'react';
import { MapPin, Battery, Clock, DollarSign, AlertCircle, List, Map as MapIcon, Locate, XCircle } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import type { Charger } from '../types';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import useGeolocation from '../hooks/useGeolocation';

const Stations: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [chargers, setChargers] = useState<Charger[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reservingId, setReservingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('map');
  const [selectedCharger, setSelectedCharger] = useState<Charger | null>(null);
  const geolocation = useGeolocation();
  const [nearestCharger, setNearestCharger] = useState<Charger | null>(null);
  const [manualLatitude, setManualLatitude] = useState('');
  const [manualLongitude, setManualLongitude] = useState('');
  const [usingManualLocation, setUsingManualLocation] = useState(false);

  useEffect(() => {
    const fetchChargers = async () => {
      try {
        const { data, error } = await supabase
          .from('chargers')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setChargers(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchChargers();
  }, []);

  useEffect(() => {
    let currentLatitude = geolocation.latitude;
    let currentLongitude = geolocation.longitude;

    if (usingManualLocation && manualLatitude && manualLongitude) {
      currentLatitude = parseFloat(manualLatitude);
      currentLongitude = parseFloat(manualLongitude);
    }

    if (chargers.length > 0 && currentLatitude && currentLongitude) {
      const distances = chargers.map(charger => {
        const lat1 = currentLatitude! * Math.PI / 180;
        const lon1 = currentLongitude! * Math.PI / 180;
        const lat2 = charger.latitude * Math.PI / 180;
        const lon2 = charger.longitude * Math.PI / 180;

        const dlon = lon2 - lon1;
        const dlat = lat2 - lat1;

        const a = Math.pow(Math.sin(dlat / 2), 2) +
                  Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(dlon / 2), 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        const R = 6371; // Radius of earth in kilometers. Use 3956 for miles
        return R * c;
      });

      const nearestIndex = distances.indexOf(Math.min(...distances));
      setNearestCharger(chargers[nearestIndex]);
    }
  }, [chargers, geolocation.latitude, geolocation.longitude, manualLatitude, manualLongitude, usingManualLocation]);

  const handleReserve = async (charger: Charger) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!user) {
      setError('You must be logged in to make a reservation');
      return;
    }

    try {
      setReservingId(charger.id);
      setError(null);

      const estimatedCost = charger.price_per_kwh * 10;

      const { error: reservationError } = await supabase
        .from('reservations')
        .insert([
          {
            user_id: user.id,
            charger_id: charger.id,
            start_time: new Date().toISOString(),
            duration: '1 hour',
            status: 'pending',
            estimated_cost: estimatedCost
          }
        ]);

      if (reservationError) throw reservationError;

      const { error: updateError } = await supabase
        .from('chargers')
        .update({ status: 'occupied' })
        .eq('id', charger.id);

      if (updateError) throw updateError;

      const { data: updatedChargers, error: fetchError } = await supabase
        .from('chargers')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setChargers(updatedChargers || []);

      navigate('/wallet');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setReservingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'occupied':
        return 'bg-yellow-100 text-yellow-800';
      case 'maintenance':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMarkerColor = (status: string) => {
    switch (status) {
      case 'available':
        return '#22c55e';
      case 'occupied':
        return '#eab308';
      case 'maintenance':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const createCustomIcon = (status: string) => {
    return new Icon({
      iconUrl: `data:image/svg+xml;base64,${btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${getMarkerColor(status)}" width="32" height="32">
          <circle cx="12" cy="12" r="10" fill="white" stroke="${getMarkerColor(status)}" stroke-width="2"/>
          <path d="M8 12h1.5v3.5h5V12H16v-1h-1.5V7.5h-5V11H8z" fill="${getMarkerColor(status)}"/>
        </svg>
      `)}`,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    });
  };

  const ChargerCard: React.FC<{ charger: Charger }> = ({ charger }) => (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow ${charger.id === nearestCharger?.id ? 'border-2 border-blue-500' : ''}`}>
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center">
            <Battery className="w-6 h-6 text-green-500 mr-2" />
            <span className="text-lg font-semibold">
              {charger.type === 'fast' ? 'Fast Charger' : 'Standard Charger'}
            </span>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(
              charger.status
            )}`}
          >
            {charger.status}
          </span>
        </div>

        <div className="space-y-3">
          <div className="flex items-center text-gray-600">
            <DollarSign className="w-5 h-5 mr-2" />
            <span>${charger.price_per_kwh.toFixed(2)} / kWh</span>
          </div>
          {charger.estimated_wait_time && (
            <div className="flex items-center text-gray-600">
              <Clock className="w-5 h-5 mr-2" />
              <span>~{charger.estimated_wait_time} min wait</span>
            </div>
          )}
          <div className="flex items-center text-gray-600">
            <MapPin className="w-5 h-5 mr-2" />
            <span>
              {charger.latitude.toFixed(6)}, {charger.longitude.toFixed(6)}
            </span>
          </div>
        </div>

        <button
          className="mt-6 w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => handleReserve(charger)}
          disabled={charger.status !== 'available' || reservingId === charger.id}
        >
          {reservingId === charger.id ? (
            <span className="flex items-center justify-center">
              <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin mr-2"></div>
              Reserving...
            </span>
          ) : charger.status === 'available' ? (
            'Reserve Now'
          ) : (
            'Not Available'
          )}
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Available Chargers</h1>
        <div className="flex space-x-2">
          {geolocation.error ? (
            <div className="text-red-500">
              <AlertCircle className="inline-block w-4 h-4 mr-1 align-text-bottom" />
              {geolocation.error}
              {geolocation.error === 'Location access was denied. Please enable it in your browser settings.' && (
                <p className="text-sm text-gray-600 mt-2">
                  To enable location, go to your browser settings and grant permission for this site.
                </p>
              )}
            </div>
          ) : (
            <button
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-700"
              onClick={() => {
                // Force a refresh of the geolocation
                window.location.reload();
              }}
            >
              <Locate className="inline-block w-4 h-4 mr-1 align-text-bottom" />
              Refresh Location
            </button>
          )}
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg ${
              viewMode === 'list'
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <List className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`p-2 rounded-lg ${
              viewMode === 'map'
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <MapIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {error && !geolocation.error && (
        <div className="mb-6 p-4 bg-red-50 rounded-lg flex items-center text-red-600">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {geolocation.error && geolocation.error === 'Location access was denied. Please enable it in your browser settings.' && (
        <div className="mb-4 p-4 bg-yellow-50 rounded-lg flex items-center text-yellow-700">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <span>
            Location access denied. You can manually enter your location below:
          </span>
        </div>
      )}

      {geolocation.error && geolocation.error === 'Location access was denied. Please enable it in your browser settings.' && (
        <div className="flex space-x-2 mb-4">
          <input
            type="text"
            placeholder="Latitude"
            value={manualLatitude}
            onChange={(e) => setManualLatitude(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
          />
          <input
            type="text"
            placeholder="Longitude"
            value={manualLongitude}
            onChange={(e) => setManualLongitude(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
          />
          <button
            onClick={() => setUsingManualLocation(true)}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
          >
            Apply
          </button>
          <button
            onClick={() => {
              setUsingManualLocation(false);
              setManualLatitude('');
              setManualLongitude('');
            }}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            <XCircle className="inline-block w-4 h-4 mr-1 align-text-bottom" />
            Clear
          </button>
        </div>
      )}

      {chargers.length === 0 ? (
        <div className="text-center py-12">
          <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-xl text-gray-600">No chargers available at the moment</p>
        </div>
      ) : viewMode === 'map' ? (
        <div className="h-[calc(100vh-16rem)] rounded-lg overflow-hidden">
          <MapContainer
            center={
              (geolocation.latitude && geolocation.longitude && !usingManualLocation)
                ? [geolocation.latitude, geolocation.longitude]
                : (manualLatitude && manualLongitude && usingManualLocation)
                  ? [parseFloat(manualLatitude), parseFloat(manualLongitude)]
                  : [40.7128, -74.0060]
            }
            zoom={(geolocation.latitude && geolocation.longitude) || (manualLatitude && manualLongitude) ? 15 : 12}
            style={{ width: '100%', height: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {((geolocation.latitude && geolocation.longitude) && !usingManualLocation) && (
              <Marker position={[geolocation.latitude, geolocation.longitude]}>
                <Popup>Your Location</Popup>
              </Marker>
            )}
            {(manualLatitude && manualLongitude && usingManualLocation) && (
              <Marker position={[parseFloat(manualLatitude), parseFloat(manualLongitude)]}>
                <Popup>Your Manual Location</Popup>
              </Marker>
            )}
            {chargers.map((charger) => (
              <Marker
                key={charger.id}
                position={[charger.latitude, charger.longitude]}
                icon={createCustomIcon(charger.status)}
                eventHandlers={{
                  click: () => setSelectedCharger(charger),
                }}
              >
                <Popup>
                  <ChargerCard charger={charger} />
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {chargers.map((charger) => (
            <ChargerCard key={charger.id} charger={charger} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Stations;
