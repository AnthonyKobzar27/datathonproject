'use client';

import type { PredictionResponse } from '@/types/patient';
import ProbabilityBar from './ProbabilityBar';

interface ResultCardProps {
  result: PredictionResponse | null;
  isLoading?: boolean;
  error?: string | null;
}

export default function ResultCard({ result, isLoading, error }: ResultCardProps) {
  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-red-200 rounded-xl p-8 shadow-sm">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-sm font-semibold text-red-800 mb-1">
            Error
          </div>
          <div className="text-sm text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  if (!result) {
    return null;
  }

  const sortedProbabilities = Object.entries(result.probabilities).sort(
    (a, b) => b[1] - a[1]
  );
  const highestProbability = sortedProbabilities[0]?.[1] || 0;

  const getRiskColor = (riskLevel: string) => {
    if (riskLevel === 'High') return 'text-red-600';
    if (riskLevel === 'Medium') return 'text-yellow-600';
    if (riskLevel === 'Low') return 'text-green-600';
    return 'text-blue-600';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
      <div className="mb-6 pb-6 border-b border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-900 mb-3">
          Prediction Result
        </h2>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">
            Predicted Risk Level:
          </span>
          <span className={`text-3xl font-bold ${getRiskColor(result.risk_level)}`}>
            {result.risk_level}
          </span>
        </div>
      </div>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Probability Distribution
        </h3>
        {sortedProbabilities.map(([label, probability]) => (
          <ProbabilityBar
            key={label}
            label={label}
            probability={probability}
            isHighest={probability === highestProbability}
          />
        ))}
      </div>
    </div>
  );
}

