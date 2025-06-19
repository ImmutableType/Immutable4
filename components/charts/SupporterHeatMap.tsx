// components/charts/SupporterHeatMap.tsx
'use client'

import React, { useState } from 'react';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';

// Type definitions
interface SupporterData {
  supporters: number;
  totalFlow: number;
  status: 'active' | 'interested';
}

interface City {
  name: string;
  coordinates: [number, number];
  state: string;
  status: 'active' | 'planned' | 'potential';
}

interface TooltipState {
  show: boolean;
  x: number;
  y: number;
  state: string;
  data: SupporterData | null;
}

// Mock supporter data by state
const supporterData: Record<string, SupporterData> = {
  'Florida': { supporters: 247, totalFlow: 8420, status: 'active' },
  'Texas': { supporters: 89, totalFlow: 2150, status: 'interested' },
  'California': { supporters: 156, totalFlow: 4890, status: 'interested' },
  'New York': { supporters: 73, totalFlow: 1960, status: 'interested' },
  'Illinois': { supporters: 45, totalFlow: 1100, status: 'interested' },
  'Georgia': { supporters: 38, totalFlow: 890, status: 'interested' },
  'North Carolina': { supporters: 29, totalFlow: 720, status: 'interested' },
  'Arizona': { supporters: 34, totalFlow: 850, status: 'interested' },
  'Colorado': { supporters: 27, totalFlow: 680, status: 'interested' },
  'Washington': { supporters: 42, totalFlow: 1080, status: 'interested' },
  'Oregon': { supporters: 19, totalFlow: 480, status: 'interested' },
  'Massachusetts': { supporters: 31, totalFlow: 790, status: 'interested' },
  'Virginia': { supporters: 22, totalFlow: 550, status: 'interested' },
  'Tennessee': { supporters: 18, totalFlow: 450, status: 'interested' },
  'Pennsylvania': { supporters: 25, totalFlow: 630, status: 'interested' },
  'Ohio': { supporters: 21, totalFlow: 520, status: 'interested' },
  'Michigan': { supporters: 16, totalFlow: 400, status: 'interested' },
  'Nevada': { supporters: 14, totalFlow: 350, status: 'interested' },
  'Utah': { supporters: 12, totalFlow: 300, status: 'interested' },
  'Wisconsin': { supporters: 13, totalFlow: 320, status: 'interested' }
};

// Major cities to highlight with markers
const majorCities: City[] = [
  { name: 'Miami', coordinates: [-80.1918, 25.7617], state: 'Florida', status: 'active' },
  { name: 'Austin', coordinates: [-97.7431, 30.2672], state: 'Texas', status: 'planned' },
  { name: 'Los Angeles', coordinates: [-118.2437, 34.0522], state: 'California', status: 'potential' },
  { name: 'New York', coordinates: [-74.0060, 40.7128], state: 'New York', status: 'potential' },
  { name: 'Chicago', coordinates: [-87.6298, 41.8781], state: 'Illinois', status: 'potential' },
  { name: 'Atlanta', coordinates: [-84.3880, 33.7490], state: 'Georgia', status: 'potential' },
  { name: 'Denver', coordinates: [-104.9903, 39.7392], state: 'Colorado', status: 'potential' },
  { name: 'Seattle', coordinates: [-122.3321, 47.6062], state: 'Washington', status: 'potential' }
];

// US Topology URL
const geoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

// Get color intensity based on supporter count
const getStateColor = (stateName: string): string => {
  const data = supporterData[stateName];
  
  if (!data) {
    return '#E5E5E5'; // Grey for states with no supporters
  }
  
  if (data.status === 'active') {
    return '#B3211E'; // Red for active (Miami)
  }
  
  // Color intensity based on supporter count for interested states
  const supporters = data.supporters;
  if (supporters >= 100) return '#1D7F6E'; // Dark green
  if (supporters >= 50) return '#4ECDC4';  // Medium green
  if (supporters >= 25) return '#00CDAC';  // Light green
  if (supporters >= 10) return '#F8B500';  // Yellow
  return '#E8A317'; // Light orange
};

// Get marker color based on city status
const getMarkerColor = (status: string): string => {
  switch (status) {
    case 'active': return '#B3211E';
    case 'planned': return '#1D7F6E';
    case 'potential': return '#E8A317';
    default: return '#E5E5E5';
  }
};

// Custom tooltip component
const TooltipContent = ({ state, data }: { state: string; data: SupporterData | null }) => (
  <div style={{
    backgroundColor: 'white',
    padding: '12px',
    border: '1px solid #D9D9D9',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    fontSize: '14px',
    maxWidth: '200px'
  }}>
    <div style={{ fontWeight: 'bold', marginBottom: '4px', color: '#B3211E' }}>
      {state}
    </div>
    {data ? (
      <>
        <div style={{ margin: '2px 0' }}>
          <strong>Supporters:</strong> {data.supporters.toLocaleString()}
        </div>
        <div style={{ margin: '2px 0' }}>
          <strong>Total Support:</strong> {data.totalFlow.toLocaleString()} FLOW
        </div>
        <div style={{ margin: '2px 0' }}>
          <strong>Status:</strong> {data.status === 'active' ? '🟢 Active' : '🟡 Interested'}
        </div>
      </>
    ) : (
      <div style={{ color: '#666', fontSize: '12px' }}>
        No supporters yet - be the first!
      </div>
    )}
  </div>
);

const SupporterHeatMap: React.FC = () => {
  const [tooltip, setTooltip] = useState<TooltipState>({
    show: false,
    x: 0,
    y: 0,
    state: '',
    data: null
  });

  // Calculate stats
  const totalStates = 50;
  const statesWithSupporters = Object.keys(supporterData).length;
  const statesRemaining = totalStates - statesWithSupporters;
  const totalSupporters = Object.values(supporterData).reduce((sum, state) => sum + state.supporters, 0);
  const totalFlow = Object.values(supporterData).reduce((sum, state) => sum + state.totalFlow, 0);

  const handleMouseEnter = (event: React.MouseEvent, geo: any) => {
    const stateName = geo.properties.name;
    const data = supporterData[stateName];
    
    setTooltip({
      show: true,
      x: event.clientX,
      y: event.clientY,
      state: stateName,
      data: data || null
    });
  };

  const handleMouseLeave = () => {
    setTooltip({ show: false, x: 0, y: 0, state: '', data: null });
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (tooltip.show) {
      setTooltip(prev => ({
        ...prev,
        x: event.clientX,
        y: event.clientY
      }));
    }
  };

  return (
    <div style={{
      backgroundColor: 'white',
      padding: '2rem',
      borderRadius: '12px',
      border: '1px solid #D9D9D9',
      marginBottom: '2rem'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
        <h2 style={{
          fontFamily: "'Special Elite', monospace",
          fontSize: '1.8rem',
          margin: '0 0 0.5rem 0',
          color: '#B3211E'
        }}>
          🗺️ Supporter Heat Map
        </h2>
        <p style={{
          fontSize: '1rem',
          margin: 0,
          color: '#666'
        }}>
          Where ImmutableType supporters are building the future of journalism
        </p>
      </div>

      {/* Map Container */}
      <div 
        style={{ 
          width: '100%', 
          height: '500px', 
          position: 'relative',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          overflow: 'hidden'
        }}
        onMouseMove={handleMouseMove}
      >
        <ComposableMap
          projection="geoAlbersUsa"
          style={{ width: '100%', height: '100%' }}
        >
          <Geographies geography={geoUrl}>
            {({ geographies }: { geographies: any[] }) =>
              geographies.map((geo: any) => {
                const stateName = geo.properties.name;
                const fillColor = getStateColor(stateName);
                
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={fillColor}
                    stroke="#FFFFFF"
                    strokeWidth={1}
                    style={{
                      default: { outline: 'none' },
                      hover: { 
                        fill: fillColor === '#E5E5E5' ? '#D0D0D0' : fillColor,
                        outline: 'none',
                        cursor: 'pointer',
                        filter: 'brightness(1.1)'
                      },
                      pressed: { outline: 'none' }
                    }}
                    onMouseEnter={(event: any) => handleMouseEnter(event, geo)}
                    onMouseLeave={handleMouseLeave}
                  />
                );
              })
            }
          </Geographies>
          
          {/* City Markers */}
          {majorCities.map((city) => (
            <Marker key={city.name} coordinates={city.coordinates}>
              <circle
                r={city.status === 'active' ? 8 : 5}
                fill={getMarkerColor(city.status)}
                stroke="#FFFFFF"
                strokeWidth={2}
                style={{ cursor: 'pointer' }}
              />
              <text
                textAnchor="middle"
                y={-12}
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '12px',
                  fontWeight: 'bold',
                  fill: '#333'
                }}
              >
                {city.name}
              </text>
            </Marker>
          ))}
        </ComposableMap>

        {/* Tooltip */}
        {tooltip.show && (
          <div
            style={{
              position: 'fixed',
              left: tooltip.x + 10,
              top: tooltip.y - 10,
              zIndex: 1000,
              pointerEvents: 'none'
            }}
          >
            <TooltipContent state={tooltip.state} data={tooltip.data} />
          </div>
        )}
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '1rem',
        marginTop: '1rem',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '16px', height: '16px', backgroundColor: '#B3211E', borderRadius: '2px' }}></div>
          <span style={{ fontSize: '0.9rem' }}>Active Market</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '16px', height: '16px', backgroundColor: '#1D7F6E', borderRadius: '2px' }}></div>
          <span style={{ fontSize: '0.9rem' }}>High Interest (100+)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '16px', height: '16px', backgroundColor: '#4ECDC4', borderRadius: '2px' }}></div>
          <span style={{ fontSize: '0.9rem' }}>Growing (50+)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '16px', height: '16px', backgroundColor: '#F8B500', borderRadius: '2px' }}></div>
          <span style={{ fontSize: '0.9rem' }}>Emerging (25+)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '16px', height: '16px', backgroundColor: '#E8A317', borderRadius: '2px' }}></div>
          <span style={{ fontSize: '0.9rem' }}>Starting (10+)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '16px', height: '16px', backgroundColor: '#E5E5E5', borderRadius: '2px' }}></div>
          <span style={{ fontSize: '0.9rem' }}>Available</span>
        </div>
      </div>

      {/* Stats Summary */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1rem',
        marginTop: '1.5rem',
        padding: '1rem',
        backgroundColor: '#F4F1E8',
        borderRadius: '8px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            fontSize: '2rem', 
            fontWeight: 'bold', 
            color: '#B3211E',
            fontFamily: "'Inter', sans-serif"
          }}>
            {statesRemaining}
          </div>
          <div style={{ fontSize: '0.9rem', color: '#666' }}>
            States Remaining
          </div>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            fontSize: '1.8rem', 
            fontWeight: 'bold', 
            color: '#1D7F6E',
            fontFamily: "'Inter', sans-serif"
          }}>
            {statesWithSupporters}
          </div>
          <div style={{ fontSize: '0.9rem', color: '#666' }}>
            States with Supporters
          </div>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            fontSize: '1.8rem', 
            fontWeight: 'bold', 
            color: '#E8A317',
            fontFamily: "'Inter', sans-serif"
          }}>
            {totalSupporters.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.9rem', color: '#666' }}>
            Total Supporters
          </div>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            fontSize: '1.8rem', 
            fontWeight: 'bold', 
            color: '#2B3990',
            fontFamily: "'Inter', sans-serif"
          }}>
            {totalFlow.toLocaleString()} FLOW
          </div>
          <div style={{ fontSize: '0.9rem', color: '#666' }}>
            Community Support
          </div>
        </div>
      </div>

      {/* Next Markets Preview */}
      <div style={{ marginTop: '1.5rem' }}>
        <h3 style={{
          fontFamily: "'Special Elite', monospace",
          fontSize: '1.2rem',
          margin: '0 0 1rem 0',
          color: '#B3211E'
        }}>
          🎯 Next Markets
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          <div style={{
            padding: '1rem',
            border: '2px solid #1D7F6E',
            borderRadius: '8px',
            backgroundColor: 'rgba(29, 127, 110, 0.05)'
          }}>
            <div style={{ fontWeight: 'bold', color: '#1D7F6E', marginBottom: '0.25rem' }}>
              🚀 Austin, TX
            </div>
            <div style={{ fontSize: '0.9rem', margin: '0.25rem 0' }}>
              {supporterData.Texas.supporters} supporters ready
            </div>
            <div style={{ fontSize: '0.8rem', color: '#666' }}>
              Launch Target: Month 6
            </div>
          </div>
          
          <div style={{
            padding: '1rem',
            border: '1px solid #D9D9D9',
            borderRadius: '8px',
            backgroundColor: '#f8f9fa'
          }}>
            <div style={{ fontWeight: 'bold', color: '#E8A317', marginBottom: '0.25rem' }}>
              🌟 Los Angeles, CA
            </div>
            <div style={{ fontSize: '0.9rem', margin: '0.25rem 0' }}>
              {supporterData.California.supporters} supporters interested
            </div>
            <div style={{ fontSize: '0.8rem', color: '#666' }}>
              Potential Launch: Month 12
            </div>
          </div>
          
          <div style={{
            padding: '1rem',
            border: '1px solid #D9D9D9',
            borderRadius: '8px',
            backgroundColor: '#f8f9fa'
          }}>
            <div style={{ fontWeight: 'bold', color: '#E8A317', marginBottom: '0.25rem' }}>
              🗽 New York, NY
            </div>
            <div style={{ fontSize: '0.9rem', margin: '0.25rem 0' }}>
              {supporterData['New York'].supporters} supporters interested
            </div>
            <div style={{ fontSize: '0.8rem', color: '#666' }}>
              Potential Launch: Month 18
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupporterHeatMap;