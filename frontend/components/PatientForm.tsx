'use client';

import { useState } from 'react';
import type { PatientData } from '@/types/patient';
import InputField from './InputField';

interface PatientFormProps {
  onSubmit: (data: PatientData) => void;
  isLoading?: boolean;
}

const initialFormData: PatientData = {
  respiratory_rate: 20,
  oxygen_saturation: 95,
  o2_scale: 1,
  systolic_bp: 120,
  heart_rate: 80,
  temperature: 37.0,
  consciousness: 'A',
  on_oxygen: 0,
};

export default function PatientForm({ onSubmit, isLoading }: PatientFormProps) {
  const [formData, setFormData] = useState<PatientData>(initialFormData);

  const handleChange = (name: keyof PatientData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleReset = () => {
    setFormData(initialFormData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="Respiratory Rate (breaths/min)"
          name="respiratory_rate"
          type="number"
          value={formData.respiratory_rate}
          onChange={handleChange}
          min={10}
          max={50}
          step={1}
          required
        />
        <InputField
          label="Oxygen Saturation (%)"
          name="oxygen_saturation"
          type="number"
          value={formData.oxygen_saturation}
          onChange={handleChange}
          min={70}
          max={100}
          step={1}
          required
        />
        <InputField
          label="O2 Scale"
          name="o2_scale"
          type="select"
          value={formData.o2_scale}
          onChange={handleChange}
          options={[
            { value: 1, label: 'Scale 1' },
            { value: 2, label: 'Scale 2' },
          ]}
          required
        />
        <InputField
          label="Systolic BP (mmHg)"
          name="systolic_bp"
          type="number"
          value={formData.systolic_bp}
          onChange={handleChange}
          min={50}
          max={200}
          step={1}
          required
        />
        <InputField
          label="Heart Rate (bpm)"
          name="heart_rate"
          type="number"
          value={formData.heart_rate}
          onChange={handleChange}
          min={40}
          max={200}
          step={1}
          required
        />
        <InputField
          label="Temperature (°C)"
          name="temperature"
          type="number"
          value={formData.temperature}
          onChange={handleChange}
          min={35.0}
          max={42.0}
          step={0.1}
          required
        />
        <InputField
          label="Consciousness Level"
          name="consciousness"
          type="select"
          value={formData.consciousness}
          onChange={handleChange}
          options={[
            { value: 'A', label: 'Alert (A)' },
            { value: 'P', label: 'Pain (P)' },
            { value: 'U', label: 'Unresponsive (U)' },
            { value: 'V', label: 'Voice (V)' },
            { value: 'C', label: 'Confused (C)' },
          ]}
          required
        />
        <InputField
          label="On Oxygen"
          name="on_oxygen"
          type="select"
          value={formData.on_oxygen}
          onChange={handleChange}
          options={[
            { value: 0, label: 'No' },
            { value: 1, label: 'Yes' },
          ]}
          required
        />
      </div>
      <div className="flex gap-4 pt-6 border-t border-gray-200">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 px-6 py-3 bg-gray-900 text-white font-medium rounded-lg
                     hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed
                     focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2
                     transition-colors"
        >
          {isLoading ? 'Processing...' : 'Predict Risk Level'}
        </button>
        <button
          type="button"
          onClick={handleReset}
          disabled={isLoading}
          className="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg
                     hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed
                     focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2
                     transition-colors"
        >
          Reset
        </button>
      </div>
    </form>
  );
}

