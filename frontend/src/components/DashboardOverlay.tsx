'use client';

import React, { useState } from 'react';
import { ImpactMetrics } from '@/services/api';
import { useTheme } from '@/context/ThemeContext';

interface DashboardOverlayProps {
  metrics: ImpactMetrics | null;
  loading: boolean;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  forecastDays?: number;
  onForecastChange?: (days: number) => void;
}

const CATEGORY_LEGEND = [
  { id: 'ALL', label: 'All Species', color: '#94a3b8' },
  { id: 'Reptile', label: 'Sea Turtles', color: '#10b981' },
  { id: 'Mammal', label: 'Cetaceans / Whales', color: '#3b82f6' },
  { id: 'Bird', label: 'Pelagic Birds', color: '#f59e0b' },
  { id: 'Fish', label: 'Sharks & Pelagics', color: '#a855f7' },
];

export default function DashboardOverlay({
  metrics,
  loading,
  selectedCategory,
  onSelectCategory,
  forecastDays = 0,
  onForecastChange,
}: DashboardOverlayProps) {
  const { theme, toggleTheme } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isOcean = theme === 'ocean';

  const bgColor = isOcean ? 'rgba(3, 20, 42, 0.92)' : 'rgba(15, 23, 42, 0.9)';
  const borderColor = isOcean ? 'rgba(56, 189, 248, 0.5)' : 'rgba(51, 65, 85, 0.6)';
  const accentColor = isOcean ? '#38bdf8' : '#2dd4bf';
  const glowShadow = isOcean
    ? '0 20px 30px -5px rgba(2, 132, 199, 0.3), 0 0 15px rgba(56, 189, 248, 0.2)'
    : '0 20px 25px -5px rgba(0, 0, 0, 0.5)';

  return (
    <div
      style={{
        position: 'fixed',
        top: '16px',
        left: '16px',
        zIndex: 999999,
        width: 'calc(100vw - 32px)',
        maxWidth: '350px',
        maxHeight: 'calc(100vh - 32px)',
        overflowY: 'auto',
        backgroundColor: bgColor,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        padding: isCollapsed ? '12px 16px' : '20px',
        borderRadius: '16px',
        border: `1px solid ${borderColor}`,
        color: '#f8fafc',
        boxShadow: glowShadow,
        pointerEvents: 'auto',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* Header + Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '17px', fontWeight: '800', margin: 0, color: accentColor, letterSpacing: '-0.025em' }}>
            Eco-Impact Predictor
          </h1>
          {!isCollapsed && (
            <p style={{ fontSize: '11px', color: isOcean ? '#7dd3fc' : '#94a3b8', margin: '2px 0 0 0' }}>
              Ocean Microplastic & Telemetry Overlap
            </p>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={toggleTheme}
            style={{
              padding: '5px 9px',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: '700',
              border: `1px solid ${borderColor}`,
              backgroundColor: isOcean ? '#0284c7' : 'rgba(30, 41, 59, 0.8)',
              color: '#ffffff',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            title={isOcean ? 'Switch to Dark Mode' : 'Switch to Ocean Mode'}
          >
            {isOcean ? '🌊' : '🌙'}
          </button>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            style={{
              padding: '5px 9px',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: '700',
              border: `1px solid ${borderColor}`,
              backgroundColor: 'rgba(30, 41, 59, 0.5)',
              color: '#94a3b8',
              cursor: 'pointer',
            }}
            title={isCollapsed ? 'Expand Dashboard' : 'Minimize Dashboard'}
          >
            {isCollapsed ? '▼' : '▲'}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <>
          <hr style={{ border: 'none', borderTop: `1px solid ${isOcean ? 'rgba(56, 189, 248, 0.25)' : 'rgba(51, 65, 85, 0.5)'}`, margin: '12px 0' }} />

          {/* Metrics Section */}
          {loading ? (
            <div style={{ fontSize: '12px', color: '#94a3b8', padding: '10px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Computing PostGIS spatial intersections...</span>
            </div>
          ) : metrics ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '10px', textTransform: 'uppercase', color: isOcean ? '#7dd3fc' : '#94a3b8', fontWeight: 700, letterSpacing: '0.05em' }}>
                  Species Exposure Risk
                </span>
                <span style={{ fontSize: '24px', fontWeight: '900', color: accentColor }}>
                  {metrics.overall_species_risk_index_pct}%
                </span>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '8px',
                  padding: '10px',
                  borderRadius: '12px',
                  backgroundColor: isOcean ? 'rgba(7, 42, 86, 0.6)' : 'rgba(2, 6, 23, 0.5)',
                  border: `1px solid ${isOcean ? 'rgba(56, 189, 248, 0.3)' : 'rgba(30, 41, 59, 0.6)'}`,
                }}
              >
                <div>
                  <span style={{ fontSize: '9px', color: isOcean ? '#7dd3fc' : '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Total Telemetry</span>
                  <p style={{ fontSize: '15px', fontWeight: '700', margin: '2px 0 0 0', color: '#f1f5f9' }}>
                    {metrics.total_sightings_analyzed}
                  </p>
                </div>
                <div>
                  <span style={{ fontSize: '9px', color: isOcean ? '#7dd3fc' : '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Gyre Overlaps</span>
                  <p style={{ fontSize: '15px', fontWeight: '700', margin: '2px 0 0 0', color: '#fb7185' }}>
                    {metrics.sightings_in_high_risk_zones}
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {/* Predictive ML Control (Drift Forecast Slider) */}
          {onForecastChange && (
            <>
              <hr style={{ border: 'none', borderTop: `1px solid ${isOcean ? 'rgba(56, 189, 248, 0.25)' : 'rgba(51, 65, 85, 0.5)'}`, margin: '12px 0' }} />
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '10px', textTransform: 'uppercase', color: isOcean ? '#7dd3fc' : '#94a3b8', fontWeight: 700, letterSpacing: '0.05em' }}>
                    Drift Model Forecast
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: forecastDays > 0 ? '#fb7185' : accentColor }}>
                    {forecastDays === 0 ? 'Live Sensors' : `+${forecastDays} Days`}
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="30"
                  step="7"
                  value={forecastDays}
                  onChange={(e) => onForecastChange(Number(e.target.value))}
                  style={{
                    width: '100%',
                    cursor: 'pointer',
                    accentColor: forecastDays > 0 ? '#fb7185' : accentColor,
                  }}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#64748b', marginTop: '3px' }}>
                  <span>Live</span>
                  <span>+7d</span>
                  <span>+14d</span>
                  <span>+21d</span>
                  <span>+30d</span>
                </div>
              </div>
            </>
          )}

          <hr style={{ border: 'none', borderTop: `1px solid ${isOcean ? 'rgba(56, 189, 248, 0.25)' : 'rgba(51, 65, 85, 0.5)'}`, margin: '12px 0' }} />

          {/* Filter Options */}
          <div>
            <span style={{ fontSize: '10px', textTransform: 'uppercase', color: isOcean ? '#7dd3fc' : '#94a3b8', fontWeight: 700, letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>
              Filter Telemetry by Species
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {CATEGORY_LEGEND.map((item) => {
                const isActive = selectedCategory === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectCategory(item.id)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '7px 12px',
                      borderRadius: '10px',
                      fontSize: '12px',
                      fontWeight: isActive ? '700' : '400',
                      border: isActive ? `1px solid ${accentColor}` : '1px solid transparent',
                      backgroundColor: isActive
                        ? (isOcean ? 'rgba(14, 116, 144, 0.5)' : 'rgba(30, 41, 59, 0.8)')
                        : 'transparent',
                      color: isActive ? '#ffffff' : (isOcean ? '#cbd5e1' : '#94a3b8'),
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: item.color, display: 'inline-block' }} />
                      <span>{item.label}</span>
                    </div>
                    {isActive && <span style={{ fontSize: '10px', color: accentColor }}>●</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}