import React from 'react';
import { useAuthStore } from '../store/authStore';
import { User, Settings, Power } from 'lucide-react';

const Profile: React.FC = () => {
  const { user, logout } = useAuthStore();

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-8">
          <div className="flex items-center space-x-4 mb-8">
            <div className="bg-green-100 p-4 rounded-full">
              <User className="w-8 h-8 text-green-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user.name || 'User Profile'}</h1>
              <p className="text-gray-600">{user.email}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <Settings className="w-6 h-6 text-gray-500" />
                <span className="text-gray-700">Account Settings</span>
              </div>
              <button className="text-green-500 hover:text-green-600">
                Edit
              </button>
            </div>

            <button
              onClick={logout}
              className="flex items-center space-x-2 text-red-500 hover:text-red-600"
            >
              <Power className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
