export const theme = {
    colors: {
      primary: {
        main: '#0ea5e9',
        light: '#38bdf8',
        dark: '#0369a1',
      },
      secondary: {
        main: '#64748b',
        light: '#94a3b8',
        dark: '#475569',
      },
      error: {
        main: '#ef4444',
        light: '#f87171',
        dark: '#dc2626',
      },
      success: {
        main: '#22c55e',
        light: '#4ade80',
        dark: '#16a34a',
      },
      warning: {
        main: '#f59e0b',
        light: '#fbbf24',
        dark: '#d97706',
      },
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '3rem',
    },
    breakpoints: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
  };
  
  export type Theme = typeof theme;
  export default theme;