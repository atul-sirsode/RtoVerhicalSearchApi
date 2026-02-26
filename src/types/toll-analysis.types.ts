// Enhanced TollGuru Models for Toll Analysis and Arrival Time Calculations

export interface TollGuruToll {
  name: string;
  tagCost: number;
  cashCost?: number;
  arrival?: {
    time: string;
    timeAtToll?: string;
  };
  location?: {
    lat: number;
    lng: number;
  };
  id?: string;
  type?: string;
  road?: string;
  distanceFromStart?: number;
  distanceFromPreviousToll?: number;
  estimatedArrivalTime?: Date;
  timeFromPreviousToll?: number; // in seconds
}

export interface TollGuruRouteTolls {
  routeIndex: number;
  routeName: string;
  totalTolls: number;
  totalTollCost: number;
  totalFuelCost: number;
  totalCost: number;
  duration: {
    text: string;
    value: number;
  };
  distance: {
    text: string;
    value: number;
  };
  labels: string[];
  meetsCriteria: boolean;
  estimatedArrivalTime: Date;
  tolls: TollGuruToll[];
  tollSequence: TollSequenceAnalysis[];
}

export interface TollSequenceAnalysis {
  tollIndex: number;
  tollName: string;
  tollCost: number;
  estimatedArrivalTime: Date;
  timeFromStart: number; // seconds from journey start
  timeFromPreviousToll: number; // seconds from previous toll
  distanceFromStart: number; // meters from journey start
  distanceFromPreviousToll: number; // meters from previous toll
  averageSpeedBetweenTolls: number; // km/h
}

export interface TollAnalysisSummary {
  origin: string;
  destination: string;
  vehicleType: string;
  currency: string;
  totalRoutes: number;
  recommendedRoute: TollGuruRouteTolls;
  alternativeRoutes: TollGuruRouteTolls[];
  analysisTimestamp: Date;
}

export interface TollComparisonResult {
  cheapestRoute: TollGuruRouteTolls;
  fastestRoute: TollGuruRouteTolls;
  practicalRoute: TollGuruRouteTolls;
  routeComparison: {
    cheapest: {
      cost: number;
      duration: string;
      tollCount: number;
    };
    fastest: {
      cost: number;
      duration: string;
      tollCount: number;
    };
    practical: {
      cost: number;
      duration: string;
      tollCount: number;
    };
  };
}

// API Response Models
export interface EnhancedTollGuruRequest {
  from: {
    address: string;
  };
  to: {
    address: string;
  };
  vehicle: {
    type: string;
  };
  country: string;
  departureTime?: string; // Optional departure time for calculations
}

export interface EnhancedTollGuruResponse {
  status: boolean;
  message: string;
  data?: TollAnalysisSummary;
  statuscode?: number;
}

// Utility Types
export type RouteLabel = 'practical' | 'cheapest' | 'fastest' | 'alternate';
export type VehicleType = '2AxlesAuto' | '2AxlesMotorcycle' | '3AxlesAuto' | '3AxlesAutoPlusTrailer' | 
  '4AxlesAuto' | '4AxlesAutoPlusTrailer' | '5AxlesAuto' | '5AxlesAutoPlusTrailer' | 
  '6AxlesAuto' | '6AxlesAutoPlusTrailer' | '7AxlesAuto' | '7AxlesAutoPlusTrailer' | 
  '8AxlesAuto' | '8AxlesAutoPlusTrailer';

export interface TollCalculationOptions {
  includeFuelCost: boolean;
  includeCashCosts: boolean;
  calculateAverageSpeeds: boolean;
  formatTimeDisplay: boolean;
}
