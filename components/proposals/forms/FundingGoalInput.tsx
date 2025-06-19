// components/proposals/forms/FundingGoalInput.tsx
'use client'

import React, { useState } from 'react';

interface FundingGoalInputProps {
  value: number;
  onChange: (value: number) => void;
}

export default function FundingGoalInput({ value, onChange }: FundingGoalInputProps) {
  const minValue = 0.5;
  const maxValue = 5.0;
  const step = 0.5;
  
  // Handle slider input
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseFloat(e.target.value));
  };
  
  // Handle direct number input
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    if (!isNaN(newValue)) {
      onChange(Math.min(Math.max(newValue, minValue), maxValue));
    }
  };
  
  return (
    <div className="funding-goal-input">
      <div style={{ marginBottom: '16px' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center',
          gap: '16px',
          marginBottom: '12px'
        }}>
          <div style={{ 
            position: 'relative', 
            width: '90px' 
          }}>
            <span style={{ 
              position: 'absolute', 
              left: '12px', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              color: '#6c757d',
              fontSize: '16px'
            }}>
              $
            </span>
            <input
              type="number"
              value={value}
              min={minValue}
              max={maxValue}
              step={step}
              onChange={handleNumberChange}
              style={{
                width: '100%',
                padding: '10px 10px 10px 24px', // Extra left padding for the $ sign
                borderRadius: '4px',
                border: '1px solid #D9D9D9',
                fontSize: '16px'
              }}
            />
          </div>
          
          <input
            type="range"
            min={minValue}
            max={maxValue}
            step={step}
            value={value}
            onChange={handleSliderChange}
            style={{ 
              flex: 1,
              cursor: 'pointer'
            }}
          />
        </div>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          fontSize: '14px', 
          color: '#6c757d' 
        }}>
          <span>${minValue.toFixed(1)}</span>
          <span>${maxValue.toFixed(1)}</span>
        </div>
      </div>
      
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '12px', 
        borderRadius: '4px',
        fontSize: '14px'
      }}>
        <p style={{ marginBottom: '8px' }}>
          <strong>Funding Goal Guidelines:</strong>
        </p>
        <ul style={{ 
          margin: 0, 
          paddingLeft: '20px',
          color: '#6c757d'
        }}>
          <li>Small investigations: $0.5 - $1.5</li>
          <li>Medium-sized stories: $1.5 - $3.0</li>
          <li>Complex investigations: $3.0 - $5.0</li>
        </ul>
      </div>
    </div>
  );
}