// components/article/ReadingControls.tsx
'use client';

import React, { useState } from 'react';
import { useReadingPreferences, ReadingPreferences } from '../../lib/hooks/useReadingPreferences';

const ReadingControls: React.FC = () => {
  const {
    preferences,
    theme,
    increaseFontSize,
    decreaseFontSize,
    updateTheme,
    updateFontFamily
  } = useReadingPreferences();

  const [isExpanded, setIsExpanded] = useState(false);

  const controlsStyle: React.CSSProperties = {
    backgroundColor: theme.bgColor,
    border: `1px solid ${theme.borderColor}`,
    borderRadius: '8px',
    padding: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    justifyContent: 'center'
  };

  const buttonStyle: React.CSSProperties = {
    background: 'none',
    border: `1px solid ${theme.borderColor}`,
    borderRadius: '4px',
    padding: '0.25rem 0.5rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
    color: theme.textColor,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    transition: 'all 0.2s ease',
    minWidth: '32px'
  };

  const activeButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: theme.linkColor,
    color: theme.bgColor,
    borderColor: theme.linkColor
  };

  const expandButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    marginLeft: '0.25rem',
    padding: '0.25rem 0.375rem',
    fontSize: '1rem'
  };

  const themes: Array<{ id: ReadingPreferences['theme']; label: string; icon: string }> = [
    { id: 'light', label: 'Light', icon: '☀️' },
    { id: 'sepia', label: 'Sepia', icon: '📜' },
    { id: 'dark', label: 'Dark', icon: '🌙' },
    { id: 'high-contrast', label: 'High Contrast', icon: '👁️' }
  ];

  return (
    <div style={controlsStyle}>
      {/* Font Size Controls */}
      <button
        onClick={decreaseFontSize}
        style={buttonStyle}
        aria-label="Decrease font size"
        disabled={preferences.fontSize === 'small'}
      >
        A-
      </button>
      <button
        onClick={increaseFontSize}
        style={buttonStyle}
        aria-label="Increase font size"
        disabled={preferences.fontSize === 'xlarge'}
      >
        A+
      </button>

      {/* Font Type Toggle */}
      <button
        onClick={() => updateFontFamily(preferences.fontFamily === 'serif' ? 'sans' : 'serif')}
        style={preferences.fontFamily === 'sans' ? activeButtonStyle : buttonStyle}
        aria-label={`Switch to ${preferences.fontFamily === 'serif' ? 'sans-serif' : 'serif'} font`}
      >
        {preferences.fontFamily === 'serif' ? 'Aa' : 'Aa'}
      </button>

      {/* Expand/Collapse Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={expandButtonStyle}
        aria-label="More reading options"
      >
        {isExpanded ? '×' : '⋯'}
      </button>

      {/* Theme Selector - Only visible when expanded */}
      {isExpanded && (
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          {themes.map(t => (
            <button
              key={t.id}
              onClick={() => updateTheme(t.id)}
              style={preferences.theme === t.id ? activeButtonStyle : buttonStyle}
              aria-label={`Switch to ${t.label} theme`}
              title={t.label}
            >
              {t.icon}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReadingControls;