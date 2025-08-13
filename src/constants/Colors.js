// iOS Design System Colors - PRD'den alınan minimal renk paleti
export const Colors = {
  // iOS System Colors
  systemBlue: '#007AFF',
  systemGreen: '#34C759',
  systemIndigo: '#5856D6',
  systemOrange: '#FF9500',
  systemPink: '#FF2D92',
  systemPurple: '#AF52DE',
  systemRed: '#FF3B30',
  systemTeal: '#5AC8FA',
  systemYellow: '#FFCC00',
  
  // iOS Gray Scale
  systemGray: '#8E8E93',
  systemGray2: '#AEAEB2',
  systemGray3: '#C7C7CC',
  systemGray4: '#D1D1D6',
  systemGray5: '#E5E5EA',
  systemGray6: '#F2F2F7',
  
  // iOS Semantic Colors
  label: '#000000',
  secondaryLabel: '#3C3C43',
  tertiaryLabel: '#3C3C43',
  placeholderText: '#3C3C43',
  
  // iOS Background Colors
  systemBackground: '#FFFFFF',
  secondarySystemBackground: '#F2F2F7',
  tertiarySystemBackground: '#FFFFFF',
  
  // iOS Grouped Background Colors
  systemGroupedBackground: '#F2F2F7',
  secondarySystemGroupedBackground: '#FFFFFF',
  tertiarySystemGroupedBackground: '#F2F2F7',
  
  // iOS Separator Colors
  separator: '#3C3C43',
  opaqueSeparator: '#C6C6C8',
  
  // App Specific Colors (10 main colors)
  appColors: {
    red: { hex: '#FF3B30', mood: 'energy', intensity: 9, warmth: 'warm' },
    blue: { hex: '#007AFF', mood: 'calmness', intensity: 4, warmth: 'cool' },
    yellow: { hex: '#FFCC00', mood: 'happiness', intensity: 8, warmth: 'warm' },
    green: { hex: '#34C759', mood: 'balance', intensity: 5, warmth: 'neutral' },
    purple: { hex: '#AF52DE', mood: 'creativity', intensity: 7, warmth: 'cool' },
    orange: { hex: '#FF9500', mood: 'enthusiasm', intensity: 8, warmth: 'warm' },
    pink: { hex: '#FF2D92', mood: 'love', intensity: 6, warmth: 'warm' },
    black: { hex: '#000000', mood: 'power', intensity: 3, warmth: 'neutral' },
    white: { hex: '#FFFFFF', mood: 'purity', intensity: 2, warmth: 'neutral' },
    gray: { hex: '#8E8E93', mood: 'neutral', intensity: 3, warmth: 'neutral' }
  },
  
  // Dark Mode Support
  dark: {
    label: '#FFFFFF',
    secondaryLabel: '#EBEBF5',
    tertiaryLabel: '#EBEBF5',
    systemBackground: '#000000',
    secondarySystemBackground: '#1C1C1E',
    tertiarySystemBackground: '#2C2C2E',
    systemGroupedBackground: '#000000',
    secondarySystemGroupedBackground: '#1C1C1E',
    separator: '#EBEBF5',
    opaqueSeparator: '#38383A'
  }
};

// iOS Typography Scale
export const Typography = {
  // iOS Text Styles
  largeTitle: {
    fontSize: 34,
    fontWeight: '400',
    lineHeight: 41
  },
  title1: {
    fontSize: 28,
    fontWeight: '400',
    lineHeight: 34
  },
  title2: {
    fontSize: 22,
    fontWeight: '400',
    lineHeight: 28
  },
  title3: {
    fontSize: 20,
    fontWeight: '400',
    lineHeight: 25
  },
  headline: {
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 22
  },
  body: {
    fontSize: 17,
    fontWeight: '400',
    lineHeight: 22
  },
  callout: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 21
  },
  subhead: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 20
  },
  footnote: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18
  },
  caption1: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16
  },
  caption2: {
    fontSize: 11,
    fontWeight: '400',
    lineHeight: 13
  }
};

// iOS Spacing System
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48
};

// iOS Border Radius
export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999
};

// iOS Shadows
export const Shadows = {
  small: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2
  },
  medium: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4
  },
  large: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.20,
    shadowRadius: 16,
    elevation: 8
  }
};

