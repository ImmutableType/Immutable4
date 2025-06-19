// components/charts/PlatformProgressChart.tsx
'use client'

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Calculate exponential growth from 69 FLOW (month 1) to 6,900 FLOW (month 24)
const generateProgressData = () => {
  const startGoal = 69;
  const endGoal = 6900;
  const months = 24;
  
  // Calculate growth factor: 6900 = 69 * (growth_factor)^23
  const growthFactor = Math.pow(endGoal / startGoal, 1 / (months - 1));
  
  const data = [];
  
  for (let month = 1; month <= months; month++) {
    const monthlyGoal = Math.round(startGoal * Math.pow(growthFactor, month - 1));
    
    // Mock actual data - start with some success, then realistic progression
    let actualAmount = 0;
    if (month <= 3) {
      // First 3 months - some early success
      actualAmount = Math.round(monthlyGoal * (0.7 + Math.random() * 0.4));
    } else if (month <= 6) {
      // Months 4-6 - building momentum
      actualAmount = Math.round(monthlyGoal * (0.5 + Math.random() * 0.3));
    } else if (month <= 12) {
      // Months 7-12 - growth phase
      actualAmount = Math.round(monthlyGoal * (0.3 + Math.random() * 0.4));
    } else {
      // Future months - no actual data yet
      actualAmount = 0;
    }
    
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    
    const currentYear = new Date().getFullYear();
    const year = currentYear + Math.floor((month - 1) / 12);
    const monthIndex = ((month - 1) % 12);
    const monthLabel = `${monthNames[monthIndex]} ${year}`;
    
    data.push({
      month: monthLabel,
      monthNumber: month,
      goal: monthlyGoal,
      actual: actualAmount,
      // Add cumulative totals for better visualization
      cumulativeGoal: data.reduce((sum, item) => sum + item.goal, 0) + monthlyGoal,
      cumulativeActual: data.reduce((sum, item) => sum + item.actual, 0) + actualAmount
    });
  }
  
  return data;
};

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div style={{
        backgroundColor: 'white',
        padding: '12px',
        border: '1px solid #D9D9D9',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
      }}>
        <p style={{ 
          margin: '0 0 8px 0', 
          fontWeight: 'bold',
          color: '#B3211E'
        }}>
          {label}
        </p>
        <p style={{ 
          margin: '4px 0', 
          color: '#1D7F6E',
          fontSize: '14px'
        }}>
          <span style={{ fontWeight: 'bold' }}>Goal:</span> {data.goal.toLocaleString()} FLOW
        </p>
        {data.actual > 0 && (
          <p style={{ 
            margin: '4px 0', 
            color: '#E8A317',
            fontSize: '14px'
          }}>
            <span style={{ fontWeight: 'bold' }}>Actual:</span> {data.actual.toLocaleString()} FLOW
          </p>
        )}
        {data.actual > 0 && (
          <p style={{ 
            margin: '4px 0 0 0', 
            color: '#666',
            fontSize: '12px'
          }}>
            Progress: {Math.round((data.actual / data.goal) * 100)}%
          </p>
        )}
      </div>
    );
  }
  return null;
};

const PlatformProgressChart: React.FC = () => {
  const data = generateProgressData();
  const currentMonth = 3; // Simulate we're in month 3

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
          📈 Platform Growth Progress
        </h2>
        <p style={{
          fontSize: '1rem',
          margin: 0,
          color: '#666'
        }}>
          Monthly funding goals vs actual community support (24-month roadmap)
        </p>
      </div>

      {/* Chart */}
      <div style={{ width: '100%', height: '400px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 60
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="month" 
              stroke="#666"
              fontSize={12}
              angle={-45}
              textAnchor="end"
              height={60}
              interval={0}
            />
            <YAxis 
              stroke="#666"
              fontSize={12}
              tickFormatter={(value) => `${value.toLocaleString()}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ 
                paddingTop: '20px',
                fontSize: '14px'
              }}
            />
            
            {/* Goal line */}
            <Line
              type="monotone"
              dataKey="goal"
              stroke="#1D7F6E"
              strokeWidth={3}
              name="Monthly Goal"
              dot={{ fill: '#1D7F6E', strokeWidth: 2, r: 4 }}
              strokeDasharray="5 5"
            />
            
            {/* Actual performance line */}
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#E8A317"
              strokeWidth={3}
              name="Actual Raised"
              dot={{ fill: '#E8A317', strokeWidth: 2, r: 6 }}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Stats Summary */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginTop: '1.5rem',
        padding: '1rem',
        backgroundColor: '#F4F1E8',
        borderRadius: '8px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            fontSize: '1.5rem', 
            fontWeight: 'bold', 
            color: '#1D7F6E',
            fontFamily: "'Inter', sans-serif"
          }}>
            {data[currentMonth - 1]?.goal.toLocaleString()} FLOW
          </div>
          <div style={{ fontSize: '0.9rem', color: '#666' }}>
            Current Month Goal
          </div>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            fontSize: '1.5rem', 
            fontWeight: 'bold', 
            color: '#E8A317',
            fontFamily: "'Inter', sans-serif"
          }}>
            {data.slice(0, currentMonth).reduce((sum, item) => sum + item.actual, 0).toLocaleString()} FLOW
          </div>
          <div style={{ fontSize: '0.9rem', color: '#666' }}>
            Total Raised So Far
          </div>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            fontSize: '1.5rem', 
            fontWeight: 'bold', 
            color: '#B3211E',
            fontFamily: "'Inter', sans-serif"
          }}>
            {Math.round((data.slice(0, currentMonth).reduce((sum, item) => sum + item.actual, 0) / 
                       data.slice(0, currentMonth).reduce((sum, item) => sum + item.goal, 0)) * 100)}%
          </div>
          <div style={{ fontSize: '0.9rem', color: '#666' }}>
            Overall Progress
          </div>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            fontSize: '1.5rem', 
            fontWeight: 'bold', 
            color: '#2B3990',
            fontFamily: "'Inter', sans-serif"
          }}>
            {21} months
          </div>
          <div style={{ fontSize: '0.9rem', color: '#666' }}>
            Remaining in Roadmap
          </div>
        </div>
      </div>

      {/* Milestones */}
      <div style={{ marginTop: '1.5rem' }}>
        <h3 style={{
          fontFamily: "'Special Elite', monospace",
          fontSize: '1.2rem',
          margin: '0 0 1rem 0',
          color: '#B3211E'
        }}>
          🎯 Key Milestones
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1rem'
        }}>
          <div style={{
            padding: '1rem',
            border: '1px solid #D9D9D9',
            borderRadius: '8px',
            backgroundColor: '#f8f9fa'
          }}>
            <div style={{ fontWeight: 'bold', color: '#1D7F6E' }}>Month 6</div>
            <div style={{ fontSize: '0.9rem', margin: '0.25rem 0' }}>Austin Launch</div>
            <div style={{ fontSize: '0.8rem', color: '#666' }}>Goal: 420 FLOW</div>
          </div>
          
          <div style={{
            padding: '1rem',
            border: '1px solid #D9D9D9',
            borderRadius: '8px',
            backgroundColor: '#f8f9fa'
          }}>
            <div style={{ fontWeight: 'bold', color: '#E8A317' }}>Month 12</div>
            <div style={{ fontSize: '0.9rem', margin: '0.25rem 0' }}>5 Cities Active</div>
            <div style={{ fontSize: '0.8rem', color: '#666' }}>Goal: 1,680 FLOW</div>
          </div>
          
          <div style={{
            padding: '1rem',
            border: '1px solid #D9D9D9',
            borderRadius: '8px',
            backgroundColor: '#f8f9fa'
          }}>
            <div style={{ fontWeight: 'bold', color: '#B3211E' }}>Month 24</div>
            <div style={{ fontSize: '0.9rem', margin: '0.25rem 0' }}>National Network</div>
            <div style={{ fontSize: '0.8rem', color: '#666' }}>Goal: 6,900 FLOW</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlatformProgressChart;