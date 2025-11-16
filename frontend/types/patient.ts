export interface PatientData {
  respiratory_rate: number;
  oxygen_saturation: number;
  o2_scale: number;
  systolic_bp: number;
  heart_rate: number;
  temperature: number;
  consciousness: string;
  on_oxygen: number;
}

export interface PredictionResponse {
  risk_level: string;
  probabilities: Record<string, number>;
}

export interface InputFieldProps {
  label: string;
  name: keyof PatientData;
  type: 'number' | 'text' | 'select';
  value: string | number;
  onChange: (name: keyof PatientData, value: string | number) => void;
  min?: number;
  max?: number;
  step?: number;
  options?: { value: string | number; label: string }[];
  placeholder?: string;
  required?: boolean;
}

