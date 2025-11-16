'use client';

interface ProbabilityBarProps {
  label: string;
  probability: number;
  isHighest: boolean;
}

export default function ProbabilityBar({
  label,
  probability,
  isHighest,
}: ProbabilityBarProps) {
  const percentage = (probability * 100).toFixed(1);
  
  const getColorClass = () => {
    if (label === 'High') return 'bg-red-500';
    if (label === 'Medium') return 'bg-yellow-500';
    if (label === 'Low') return 'bg-green-500';
    return 'bg-blue-500';
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700">
          {label}
        </span>
        <span className="text-sm font-semibold text-gray-900">
          {percentage}%
        </span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full ${getColorClass()} transition-all duration-500 ${
            isHighest ? 'ring-2 ring-offset-2 ring-gray-900' : ''
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

