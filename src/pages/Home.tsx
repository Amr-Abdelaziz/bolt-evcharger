import React from 'react';
import { MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const handleFindNearest = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    // TODO: Implement find nearest charger functionality
    // For now, navigate to view all stations
    navigate('/stations');
  };

  const handleViewAll = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate('/stations');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
      <div className="text-center max-w-2xl">
        <div className="flex justify-center mb-6">
          <MapPin className="w-16 h-16 text-green-500" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Find EV Chargers Near You
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Locate, reserve, and navigate to EV charging stations in your area.
        </p>
        <div className="space-y-4">
          <button
            onClick={handleFindNearest}
            className="bg-green-500 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-green-600 transition-colors w-full active:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Find Nearest Charger
          </button>
          <button
            onClick={handleViewAll}
            className="border-2 border-green-500 text-green-500 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-green-50 transition-colors w-full active:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            View All Stations
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
