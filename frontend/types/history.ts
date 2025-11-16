export interface PredictionHistory {
  id: string;
  user_id?: string;
  timestamp: string;
  risk_level: string;
  respiratory_rate: number;
  oxygen_saturation: number;
  o2_scale: number;
  systolic_bp: number;
  heart_rate: number;
  temperature: number;
  consciousness: string;
  on_oxygen: number;
  probabilities?: Record<string, number>;
}

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  organization?: string;
  created_at?: string;
  updated_at?: string;
}

