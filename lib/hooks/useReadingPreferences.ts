// lib/hooks/useReadingPreferences.ts
import { useState, useEffect } from 'react';

export interface Theme {
  bgColor: string;
  textColor: string;
  linkColor: string;
  borderColor: string;
  bioBgColor: string;
}

export interface ReadingPreferences {
  theme: 'light' | 'sepia' | 'dark' | 'high-contrast';
  fontSize: 'small' | 'medium' | 'large' | 'xlarge';
  fontFamily: 'serif' | 'sans';
}

const themes: Record<ReadingPreferences['theme'], Theme> = {
  light: {
    bgColor: 'var(--color-white)',
    textColor: 'var(--color-black)',
    linkColor: 'var(--color-blockchain-blue)',
    borderColor: 'var(--color-digital-silver)',
    bioBgColor: 'var(--color-parchment)'
  },
  sepia: {
    bgColor: '#fbf0d9',
    textColor: '#5f4b32',
    linkColor: '#8B4513',
    borderColor: '#d4c4a8',
    bioBgColor: '#f5e6d3'
  },
  dark: {
    bgColor: '#121212',
    textColor: '#e0e0e0',
    linkColor: '#6db3f2',
    borderColor: '#333333',
    bioBgColor: '#1e1e1e'
  },
  'high-contrast': {
    bgColor: '#000000',
    textColor: '#ffffff',
    linkColor: '#ffff00',
    borderColor: '#ffffff',
    bioBgColor: '#222222'
  }
};

const fontSizes = {
  small: '0.875rem',
  medium: '1rem',
  large: '1.125rem',
  xlarge: '1.25rem'
};

const fontFamilies = {
  serif: 'var(--font-body)',
  sans: 'var(--font-ui)'
};

export function useReadingPreferences() {
  const [preferences, setPreferences] = useState<ReadingPreferences>({
    theme: 'light',
    fontSize: 'medium',
    fontFamily: 'serif'
  });

  // Load preferences on mount
  useEffect(() => {
    const stored = localStorage.getItem('reading-preferences');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setPreferences(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error('Failed to parse reading preferences:', e);
      }
    }
  }, []);

  // Save preferences whenever they change
  useEffect(() => {
    localStorage.setItem('reading-preferences', JSON.stringify(preferences));
  }, [preferences]);

  const updateTheme = (theme: ReadingPreferences['theme']) => {
    setPreferences(prev => ({ ...prev, theme }));
  };

  const updateFontSize = (fontSize: ReadingPreferences['fontSize']) => {
    setPreferences(prev => ({ ...prev, fontSize }));
  };

  const updateFontFamily = (fontFamily: ReadingPreferences['fontFamily']) => {
    setPreferences(prev => ({ ...prev, fontFamily }));
  };

  const increaseFontSize = () => {
    const sizes: ReadingPreferences['fontSize'][] = ['small', 'medium', 'large', 'xlarge'];
    const currentIndex = sizes.indexOf(preferences.fontSize);
    if (currentIndex < sizes.length - 1) {
      updateFontSize(sizes[currentIndex + 1]);
    }
  };

  const decreaseFontSize = () => {
    const sizes: ReadingPreferences['fontSize'][] = ['small', 'medium', 'large', 'xlarge'];
    const currentIndex = sizes.indexOf(preferences.fontSize);
    if (currentIndex > 0) {
      updateFontSize(sizes[currentIndex - 1]);
    }
  };

  return {
    preferences,
    theme: themes[preferences.theme],
    fontSize: fontSizes[preferences.fontSize],
    fontFamily: fontFamilies[preferences.fontFamily],
    updateTheme,
    updateFontSize,
    updateFontFamily,
    increaseFontSize,
    decreaseFontSize
  };
}