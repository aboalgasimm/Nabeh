export enum Language {
  EN = 'en',
  AR = 'ar'
}

export enum RiskLevel {
  LOW = 'Low',
  MODERATE = 'Moderate',
  HIGH = 'High',
  CRITICAL = 'Critical'
}

export type RoadConditionType = 'Normal' | 'Bumpy' | 'Construction';

export interface RoadZone {
  id: string;
  type: RoadConditionType;
  // Simple rectangular bounding box for demo purposes
  bounds: { xMin: number; xMax: number; yMin: number; yMax: number }; 
  label: string;
}

export interface Coordinates {
  x: number; // Relative 0-100 for demo map
  y: number; // Relative 0-100 for demo map
}

export interface VehicleTelemetry {
  id: string;
  plateNumber: string;
  driverName: string;
  speed: number; // km/h
  coordinates: Coordinates;
  lat: number;
  lng: number;
  riskScore: number; // 0-100
  riskLevel: RiskLevel;
  factors: string[]; // e.g., "Harsh Braking", "Speeding"
  status: 'active' | 'idle' | 'incident';
  lastUpdate: string;
  heading?: number;
  verticalG: number; // Vertical G-Force (1.0 is normal gravity)
}

export interface Incident {
  id: string;
  timestamp: string;
  type: string;
  location: string;
  severity: string; // Changed to string to support Arabic (e.g., 'حرج', 'متوسط')
  status: string; // Changed to string to support Arabic (e.g., 'مفتوح')
}

export interface AnalyticsData {
  time: string;
  avgRisk: number;
  incidents: number;
}

export interface GeminiAnalysis {
  summary: string;
  recommendations: string[];
}

export interface LocationInsight {
  text: string;
  sources: Array<{ title: string; uri: string }>;
}