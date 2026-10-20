'use client';

import React from 'react';
import { ImpactMetrics } from '@/services/api';

interface DashboardOverlayProps {
  metrics: ImpactMetrics | null;
  loading: boolean;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

const CATEGORY_LEGEND = [
  { id: 'ALL', label: 'All Species', color: '#94a3b8' },
  { id: 'Reptile', label: 'Sea Turtles', color: '#10b981' },
  { id: 'Mammal', label: 'Cetaceans / Whales', color: '#3b82f6' },
  { id: 'Bird', label: 'Pelagic Birds', color: '#f59e0b' },
];

export default function DashboardOverlay({
  metrics,
  loading,
  selectedCategory,
  onSelectCategory,
}: DashboardOverlayProps) {
  return (
    <div
      style={{
        position: 'fixed',
        top: '24px',
        left: '24px',
        zIndex: 999999,
        width: '320px',
        backgroundColor: 'rgba(15, 23, 42, 0.92)',
        backdropFilter: 'blur(12px)',
        padding: '20px',
        borderRadius: '12px',
        border: '1px solid rgba(51, 65, 85, 0.8)',
        color: '#ffffff',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
        pointerEvents: 'auto',
      }}
    >
      <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, color: '#2dd4bf' }}>
        Eco-Impact Predictor
      </h1>
      <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px', marginBottom: '12px' }}>
        Ocean Microplastic & Marine Migration Overlap
      </p>

      <hr style={{ borderColor: 'rgba(51, 65, 85, 0.6)', margin: '12px 0' }} />

      {/* Secciones de Métricas */}
      {loading ? (
        <div style={{ fontSize: '12px', color: '#94a3b8', padding: '8px 0' }}>
          Computing PostGIS spatial intersections...
        </div>
      ) : metrics ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 600 }}>
              Species Exposure Risk
            </span>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#2dd4bf', marginTop: '2px' }}>
              {metrics.overall_species_risk_index_pct}%
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', paddingTop: '8px', borderTop: '1px solid #1e293b' }}>
            <div>
              <span style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>Total Telemetry</span>
              <p style={{ fontSize: '16px', fontWeight: 600, margin: '2px 0 0 0', color: '#e2e8f0' }}>
                {metrics.total_sightings_analyzed}
              </p>
            </div>
            <div>
              <span style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>Gyre Overlaps</span>
              <p style={{ fontSize: '16px', fontWeight: 600, margin: '2px 0 0 0', color: '#f43f5e' }}>
                {metrics.sightings_in_high_risk_zones}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <hr style={{ borderColor: 'rgba(51, 65, 85, 0.6)', margin: '12px 0' }} />

      {/* Filtro por Especie */}
      <div>
        <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
          Filter Wildlife Telemetry
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {CATEGORY_LEGEND.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelectCategory(item.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                border: selectedCategory === item.id ? '1px solid #14b8a6' : '1px solid transparent',
                backgroundColor: selectedCategory === item.id ? '#1e293b' : 'rgba(2, 6, 23, 0.4)',
                color: '#ffffff',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: item.color }} />
                <span>{item.label}</span>
              </div>
              {selectedCategory === item.id && (
                <span style={{ fontSize: '10px', color: '#2dd4bf' }}>Active</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Explicación Leyenda Capas */}
      <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(30, 41, 59, 0.8)', fontSize: '11px', color: '#94a3b8' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '12px', height: '12px', backgroundColor: 'rgba(239, 68, 68, 0.6)', border: '1px solid #ef4444', borderRadius: '2px' }} />
          <span>Microplastic Convergence Gyres</span>
        </div>
      </div>
    </div>
  );
}