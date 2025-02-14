import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { Wallet as WalletIcon, CreditCard, History, AlertCircle } from 'lucide-react';

const Wallet: React.FC = () => {
  const { user, addFunds } = useAuthStore();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleAddFunds = async () => {
    setError(null);
    setSuccess(null);

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid amount greater than zero.');
      return;
    }

    setLoading(true);
    try {
      await addFunds(parsedAmount);
      setSuccess('Funds added successfully!');
      setAmount('');
    } catch (err: any) {
      setError(err.message || 'An error occurred while adding funds.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-8">
          <div className="flex items-center space-x-4 mb-8">
            <div className="bg-green-100 p-4 rounded-full">
              <WalletIcon className="w-8 h-8 text-green-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Wallet</h1>
              <p className="text-gray-600">Manage your funds</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white mb-8">
            <p className="text-sm opacity-80">Current Balance</p>
            <p className="text-3xl font-bold">${user.walletBalance.toFixed(2)}</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                min="0.01"
                step="0.01"
              />
              <button
                onClick={handleAddFunds}
                disabled={loading}
                className="flex items-center justify-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CreditCard className="w-5 h-5" />
                <span>Add Funds</span>
              </button>
            </div>
            {error && (
              <div className="mb-4 p-4 bg-red-50 rounded-lg flex items-center text-red-600">
                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="mb-4 p-4 bg-green-50 rounded-lg flex items-center text-green-600">
                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <div className="border-t pt-6 mt-6">
              <div className="flex items-center space-x-2 text-gray-700 mb-4">
                <History className="w-5 h-5" />
                <h2 className="text-lg font-semibold">Recent Transactions</h2>
              </div>
              <p className="text-gray-500 text-center py-4">No recent transactions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wallet;
