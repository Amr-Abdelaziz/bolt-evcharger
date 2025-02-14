import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Zap, User as UserIcon, Wallet, PlusCircle } from 'lucide-react';

const Navbar: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Zap className="w-8 h-8 text-green-500" />
            <span className="text-xl font-bold">EV Charger</span>
          </Link>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/add-charger"
                  className="flex items-center space-x-2 text-gray-700 hover:text-green-500"
                >
                  <PlusCircle className="w-5 h-5" />
                  <span>Add Charger</span>
                </Link>
                <Link to="/wallet" className="flex items-center space-x-2 text-gray-700 hover:text-green-500">
                  <Wallet className="w-5 h-5" />
                  <span>${user?.walletBalance.toFixed(2)}</span>
                </Link>
                <Link to="/profile" className="flex items-center space-x-2 text-gray-700 hover:text-green-500">
                  <UserIcon className="w-5 h-5" />
                  <span>{user?.name || 'Profile'}</span>
                </Link>
              </>
            ) : (
              <Link
                to="/login"
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
