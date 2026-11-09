import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface VectorGridPoint {
  lon: number;
  lat: number;
  u: number;
  v: number;
}

export interface OceanCurrentsHeader {
  min_lon: number;
  max_lon: number;
  min_lat: number;
  max_lat: number;
  step: number;
  units: string;
}

export interface OceanCurrentsGridResponse {
  header: OceanCurrentsHeader;
  vectors: VectorGridPoint[];
}

export interface ImpactMetrics {
  total_sightings_analyzed: number;
  sightings_in_high_risk_zones: number;
  overall_species_risk_index_pct: number;
}

export interface ImpactResponse {
  metrics: ImpactMetrics;
  impacted_points?: any;
  active_risk_zones?: any;
}

export const fetchImpactAnalysis = async (forecastDays = 0, category = 'ALL'): Promise<ImpactResponse> => {
  const response = await axios.get(`${API_BASE_URL}/impact-analysis/`, {
    params: { 
      forecast_days: forecastDays,
      category: category 
    },
  });
  return response.data;
};

export const fetchAllSightings = async (category = 'ALL'): Promise<any> => {
  const response = await axios.get(`${API_BASE_URL}/sightings/`, {
    params: { category }
  });
  return response.data;
};

export const fetchAllPlasticZones = async (forecastDays = 0): Promise<any> => {
  const response = await axios.get(`${API_BASE_URL}/plastic-zones/`, {
    params: { forecast_days: forecastDays },
  });
  return response.data;
};

/**
 * Fetches structured ocean surface current velocity vectors (u, v in m/s) for the particle vector layer.
 */
export const fetchOceanCurrentsGrid = async (): Promise<OceanCurrentsGridResponse> => {
  const response = await axios.get(`${API_BASE_URL}/ocean-currents-grid/`);
  return response.data;
};