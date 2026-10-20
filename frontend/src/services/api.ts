import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface ImpactMetrics {
  total_sightings_analyzed: number;
  sightings_in_high_risk_zones: number;
  overall_species_risk_index_pct: number;
}

export interface ImpactResponse {
  metrics: ImpactMetrics;
  impacted_points: any;
  active_risk_zones: any;
}

export const fetchImpactAnalysis = async (): Promise<ImpactResponse> => {
  const response = await axios.get(`${API_BASE_URL}/impact-analysis/`);
  return response.data;
};

export const fetchAllSightings = async (): Promise<any> => {
  const response = await axios.get(`${API_BASE_URL}/sightings/`);
  return response.data;
};

export const fetchAllPlasticZones = async (): Promise<any> => {
  const response = await axios.get(`${API_BASE_URL}/plastic-zones/`);
  return response.data;
};