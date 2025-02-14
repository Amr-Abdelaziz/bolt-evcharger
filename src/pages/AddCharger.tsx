import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, AlertCircle, CheckCircle, MapPin, BatteryCharging, Bolt, Check } from 'lucide-react';

const AddCharger: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [name, setName] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [type, setType] = useState<'fast' | 'standard'>('standard');
  const [powerLevel, setPowerLevel] = useState('');
  const [status, setStatus] = useState<'available' | 'occupied' | 'maintenance'>('available');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (!user) {
      setError('You must be logged in to add a charger.');
      setLoading(false);
      return;
    }

    // Basic validation
    if (!name || !latitude || !longitude || !powerLevel) {
      setError('Please fill in all fields.');
      setLoading(false);
      return;
    }

    const parsedLatitude = parseFloat(latitude);
    const parsedLongitude = parseFloat(longitude);
    const parsedPowerLevel = parseFloat(powerLevel);

    if (isNaN(parsedLatitude) || isNaN(parsedLongitude)) {
      setError('Invalid latitude or longitude.');
      setLoading(false);
      return;
    }

    if (isNaN(parsedPowerLevel) || parsedPowerLevel <= 0) {
      setError('Power level must be a positive number.');
      setLoading(false);
      return;
    }

    try {
      const { error: insertError } = await supabase
        .from('chargers')
        .insert([
          {
            type,
            status,
            price_per_kwh: type === 'fast' ? 0.45 : 0.30, // Example pricing
            latitude: parsedLatitude,
            longitude: parsedLongitude,
            owner_id: user.id,
          },
        ]);

      if (insertError) throw insertError;

      setSuccess('Charger added successfully!');
      setName('');
      setLatitude('');
      setLongitude('');
      setPowerLevel('');
      setType('standard');
      setStatus('available');
    } catch (err: any) {
      setError(err.message || 'An error occurred while adding the charger.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-8">
      <div className="flex items-center space-x-4 mb-6">
        <PlusCircle className="w-8 h-8 text-green-500" />
        <h1 className="text-2xl font-bold text-gray-900">Add New Charger</h1>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 rounded-lg flex items-center text-red-600">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 rounded-lg flex items-center text-green-600">
          <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
            placeholder="Charger Name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Location</label>
          <div className="mt-1 relative">
            <input
              type="text"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
              placeholder="Latitude"
              required
            />
            <MapPin className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          <div className="mt-1 relative">
            <input
              type="text"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
              placeholder="Longitude"
              required
            />
            <MapPin className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as 'fast' | 'standard')}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
          >
            <option value="standard">Standard (AC)</option>
            <option value="fast">Fast (DC)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Power Level (kW)</label>
          <div className="mt-1 relative">
            <input
              type="number"
              value={powerLevel}
              onChange={(e) => setPowerLevel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
              placeholder="e.g., 50"
              required
              min="1"
            />
            <Bolt className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as 'available' | 'occupied' | 'maintenance')
            }
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
          >
            <option value="available">Available</option>
            <option value="occupied">Occupied</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Bolt className="animate-spin h-5 w-5 mr-3" />
              Adding...
            </>
          ) : (
            <>
              <Check className="h-5 w-5 mr-2" />
              Add Charger
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default AddCharger;
