/**
 * Design System Tokens
 * Central source of truth for colors, typography, spacing, and other design values
 * Based on PRD requirements for UX/UI Redesign
 */

export const colors = {
  // Primary - STAGE Brand Red
  primary: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626', // Main STAGE red
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },

  // Brand - STAGE Identity Colors
  brand: {
    red: '#DC2626',      // Primary brand red
    redLight: '#EF4444', // Lighter red for hover states
    redDark: '#B91C1C',  // Darker red for pressed states
    black: '#1A1A1A',    // Brand black
    gray: '#F5F5F5',     // Light background gray
  },

  // Success - Green
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#10b981', // Main success color
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },

  // Warning - Amber
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b', // Main warning color
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },

  // Error - Red
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444', // Main error color
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },

  // Neutral - Gray scale
  neutral: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },

  // Semantic colors
  info: {
    light: '#dbeafe',
    main: '#3b82f6',
    dark: '#1e40af',
  },

  // Background colors
  background: {
    white: '#ffffff',
    gray: '#f9fafb',
    dark: '#111827',
  },
};

export const typography = {
  // Font families
  fontFamily: {
    sans: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: '"Fira Code", "Courier New", monospace',
  },

  // Font sizes
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2rem',    // 32px
  },

  // Font weights
  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const spacing = {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
};

export const borderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  full: '9999px',
};

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
};

export const transitions = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
};

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// Field type mappings for plain language
export const fieldTypeLabels: Record<string, string> = {
  text: "Person's Name / Text",
  number: 'Number or Amount',
  currency: 'Money Amount (₹)',
  date: 'Date (DD/MM/YYYY)',
  email: 'Email Address',
  phone: 'Phone Number',
  pan_number: 'Indian PAN (Tax ID)',
  gst_number: 'Indian GST Number',
  dropdown: 'Choose from Options',
  checkbox: 'Yes/No Choice',
};

// Field type descriptions for users
export const fieldTypeDescriptions: Record<string, string> = {
  text: "Use this for names, titles, or any text information",
  number: "Use this for whole numbers like counts, quantities, or ages",
  currency: "Use this for money amounts, fees, or payments (₹ Rupees)",
  date: "Use this for any calendar dates",
  email: "Use this for email addresses",
  phone: "Use this for Indian mobile or landline numbers",
  pan_number: "We'll automatically verify the format: AAAAA1234A (5 letters, 4 numbers, 1 letter)",
  gst_number: "We'll check this is 15 characters in valid GST format",
  dropdown: "Users will choose from a list of options you provide",
  checkbox: "Users will check or uncheck a box",
};

// Validation format hints
export const validationHints: Record<string, string> = {
  pan_number: "Format: AAAAA1234A (5 letters, 4 numbers, 1 letter)",
  gst_number: "Format: 22AAAAA0000A1Z5 (15 characters)",
  phone: "Example: 9876543210 (10 digits)",
  email: "Example: user@example.com",
  date: "Format: DD/MM/YYYY",
  currency: "Example: ₹5000 or 5000",
};
