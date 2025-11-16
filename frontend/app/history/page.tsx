'use client';

import Header from '@/components/Header';
import LoginModal from '@/components/LoginModal';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';
import { db } from '@/lib/supabase';
import type { PredictionHistory } from '@/types/history';

export default function HistoryPage() {
  const { isLoggedIn, user, isLoading: authLoading } = useAuth();
  const [predictions, setPredictions] = useState<PredictionHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const loadPredictions = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data, error } = await db.getPredictions(user.id);
      if (error) throw error;
      setPredictions(data || []);
    } catch (error) {
      console.error('Error loading predictions:', error);
      setPredictions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn && user) {
      loadPredictions();
    } else if (!isLoggedIn) {
      // If not logged in, stop loading immediately
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, user?.id]); // Only depend on user.id, not the whole user object

  // Show spinner only during initial auth check when not logged in
  // Once logged in, show the page even if data is loading
  if (authLoading && !isLoggedIn) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="pt-16">
          <div className="container mx-auto px-6 py-12 max-w-7xl">
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="pt-16">
          <div className="container mx-auto px-6 py-12 max-w-7xl">
            <div className="bg-white border border-gray-200 rounded-xl p-12 shadow-sm text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Please Log In</h1>
              <p className="text-gray-600 mb-6">You need to be logged in to view your prediction history.</p>
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
              >
                Login
              </button>
            </div>
          </div>
        </main>
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onSuccess={() => setIsLoginModalOpen(false)}
        />
      </div>
    );
  }

  const getRiskColor = (riskLevel: string) => {
    if (riskLevel === 'High') return 'bg-red-100 text-red-800';
    if (riskLevel === 'Medium') return 'bg-yellow-100 text-yellow-800';
    if (riskLevel === 'Low') return 'bg-green-100 text-green-800';
    return 'bg-blue-100 text-blue-800';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pt-16">
        <div className="container mx-auto px-6 py-12 max-w-7xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Prediction History
            </h1>
            <p className="text-lg text-gray-600">
              View all your previous health risk predictions
            </p>
          </div>

          {isLoading ? (
            <div className="bg-white border border-gray-200 rounded-xl p-12 shadow-sm">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            </div>
          ) : predictions.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-12 shadow-sm text-center">
              <p className="text-gray-600 mb-4">No prediction history found</p>
              <a
                href="/"
                className="inline-block px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
              >
                Make Your First Prediction
              </a>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Risk Level
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Respiratory Rate
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Oxygen Saturation
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Temperature
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Heart Rate
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {predictions.map((prediction) => (
                      <tr key={prediction.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(prediction.timestamp)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getRiskColor(
                              prediction.risk_level
                            )}`}
                          >
                            {prediction.risk_level}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {prediction.respiratory_rate} bpm
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {prediction.oxygen_saturation}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {prediction.temperature}°C
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {prediction.heart_rate} bpm
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button className="text-gray-600 hover:text-gray-900 font-medium">
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

