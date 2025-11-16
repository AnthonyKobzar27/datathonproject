'use client';

import { useState } from 'react';
import type { PatientData, PredictionResponse } from '@/types/patient';
import { predictRiskLevel } from '@/lib/api';
import { useAuth } from '@/lib/useAuth';
import { db } from '@/lib/supabase';
import PatientForm from '@/components/PatientForm';
import ResultCard from '@/components/ResultCard';
import Header from '@/components/Header';
import LoginModal from '@/components/LoginModal';

export default function Home() {
  const { isLoggedIn, user, isLoading: authLoading } = useAuth();
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleSubmit = async (patientData: PatientData) => {
    if (!isLoggedIn || !user) {
      setIsLoginModalOpen(true);
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const prediction = await predictRiskLevel(patientData);
      setResult(prediction);
      
      // Save prediction to history
      if (user) {
        await db.savePrediction(user.id, {
          ...patientData,
          risk_level: prediction.risk_level,
          probabilities: prediction.probabilities,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get prediction');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
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
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Please Log In</h2>
              <p className="text-gray-600 mb-6">You need to be logged in to make predictions.</p>
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

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pt-16">
        <div className="container mx-auto px-6 py-12 max-w-7xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Health Risk Prediction
            </h1>
            <p className="text-lg text-gray-600">
              Enter patient vital signs to predict health risk level using advanced machine learning
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
              <h2 className="text-2xl font-semibold mb-6 text-gray-900">
                Patient Information
              </h2>
              <PatientForm onSubmit={handleSubmit} isLoading={isLoading} />
            </div>

            <div>
              <ResultCard result={result} isLoading={isLoading} error={error} />
            </div>
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
