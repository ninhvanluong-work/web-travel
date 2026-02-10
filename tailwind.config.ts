/* eslint-disable global-require */
const { fontFamily } = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    container: {
      center: true,
      screens: {
        xss: '320px',
        xs: '375px',
        sm: '414px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1440px',
        '3xl': '1920px',
      },
    },
    extend: {
      fontFamily: {
        dinpro: ['DINPro', 'sans-serif'],
        dinprocond: ['DIN Pro Cond', 'sans-serif'],
      },
      fontSize: {
        d1: [
          '6rem',
          {
            fontWeight: '500',
            lineHeight: '7rem',
            tracking: '-1%',
          },
        ],
        d2: [
          '5rem',
          {
            fontWeight: '500',
            lineHeight: '6rem',
            tracking: '-1%',
          },
        ],
        d3: [
          '4.5rem',
          {
            fontWeight: '500',
            lineHeight: '5.375rem',
            tracking: '-1%',
          },
        ],
        h1: [
          '4rem',
          {
            fontWeight: '500',
            lineHeight: '4.75rem',
            tracking: '-1%',
          },
        ],
        h2: [
          '3rem',
          {
            fontWeight: '500',
            lineHeight: '3.5rem',
            tracking: '-1%',
          },
        ],
        h3: [
          '2.5rem',
          {
            fontWeight: '500',
            lineHeight: '3rem',
            tracking: '-1%',
          },
        ],
        h4: [
          '2.25rem',
          {
            fontWeight: '500',
            lineHeight: '2.75rem',
            tracking: '-1%',
          },
        ],
        h5: [
          '2rem',
          {
            fontWeight: '500',
            lineHeight: '2.5rem',
            tracking: '-1%',
          },
        ],
        h6: [
          '1.5rem',
          {
            fontWeight: '500',
            lineHeight: '2rem',
            tracking: '-1%',
          },
        ],
        caption1: [
          '0.875rem',
          {
            fontWeight: '500 ',
            lineHeight: '1.25rem',
          },
        ],
        caption2: [
          '0.75rem',
          {
            fontWeight: '500 ',
            lineHeight: '1.125rem',
          },
        ],
        body1: [
          '1.25rem',
          {
            fontWeight: '500',
            lineHeight: '1.75rem',
            tracking: '-1%',
          },
        ],
        body2: [
          '1rem',
          {
            fontWeight: '500',
            lineHeight: '1.5rem',
            tracking: '-1%',
          },
        ],
        body3: [
          '0.875rem',
          {
            fontWeight: '500',
            lineHeight: '1.25rem',
            tracking: '-2%',
          },
        ],
        body4: [
          '0.75rem',
          {
            fontWeight: '500',
            lineHeight: '1.125rem',
            tracking: '-2%',
          },
        ],
        overline1: [
          '1rem',
          {
            fontWeight: '500',
            lineHeight: '1.5rem',
            tracking: '2%',
          },
        ],
        overline2: [
          '0.875rem',
          {
            fontWeight: '500',
            lineHeight: '1.25rem',
            tracking: '2%',
          },
        ],
        overline3: [
          '0.75rem',
          {
            fontWeight: '500',
            lineHeight: '1.125rem',
            tracking: '2%',
          },
        ],
        button1: [
          '0.875rem',
          {
            fontWeight: '500',
            lineHeight: '0.875rem',
          },
        ],
        button2: [
          '0.75rem',
          {
            fontWeight: '500',
            lineHeight: '0.75rem',
          },
        ],
        button3: [
          '0.625rem',
          {
            fontWeight: '500',
            lineHeight: '0.625rem',
          },
        ],
      },
      spacing: {
        4: '0.25rem',
        8: '0.5rem',
        12: '0.5rem',
        16: '1rem',
        24: '1.5rem',
        32: '2rem',
        40: '2.5rem',
        48: '3rem',
        56: '3.5rem',
        64: '4rem',
        72: '4.5rem',
        80: '5rem',
        88: '5.5rem',
        96: '6rem',
      },
      flex: {
        full: '0 0 100%',
      },
      maxWidth: {
        dashboard: 'var(--dashboard-container)',
      },
      width: {
        sidebar: 'var(--w-sidebar)',
      },
      height: {
        header: 'var(--header-h)',
      },
      zIndex: {
        header: 999,
      },
      borderWidth: {
        DEFAULT: '1.5px',
        '0': '0',
        '2': '2px',
        '3': '3px',
        '4': '4px',
        '6': '6px',
        '8': '8px',
      },
      colors: {
        neon: {
          100: '#EDFFC2',
          200: '#E1FF9A',
          300: '#D3FE6F',
          400: '#B9E15B',
          500: '#9FC449',
          600: '#86A739',
          700: '#6D892A',
          800: '#556C1E',
          900: '#3D4F13',
        },
        pink: {
          100: '#FCEDFF',
          200: '#FADAFD',
          300: '#F9C4F9',
          400: '#F3AFEE',
          500: '#EB9DDE',
          600: '#DA88CA',
          700: '#A66499',
          800: '#814A75',
          900: '#5B3250',
        },
        neutral: {
          white: '#FFFFFF',
          100: '#F3F3F7',
          200: '#E5E5ED',
          300: '#CACBD9',
          400: '#B1B5C4',
          500: '#A5AAB9',
          600: '#959EAC',
          700: '#7F8691',
          800: '#5A616C',
          900: '#373C45',
          black: '#0F1D33',
        },
        blue: {
          100: '#DFF5FF',
          200: '#B2E1FF',
          300: '#82C7FE',
          400: '#58A8F5',
          500: '#3387E7',
          600: '#216BC7',
          700: '#124FA2',
          800: '#083675',
          900: '#021F47',
        },
        green: {
          100: '#CEFFED',
          200: '#ACFFE1',
          300: '#89FFD5',
          400: '#67FFC8',
          500: '#52E9B3',
          600: '#3CC795',
          700: '#29A578',
          800: '#1A835D',
          900: '#0E6143',
        },
        yellow: {
          100: '#FFF3D9',
          200: '#FFE8B0',
          300: '#FFDC80',
          400: '#FCD055',
          500: '#EFC530',
          600: '#C9A71D',
          700: '#99840F',
          800: '#665D05',
          900: '#333200',
        },
        red: {
          100: '#FFEAEE',
          200: '#FEBDC5',
          300: '#F9959D',
          400: '#EF7076',
          500: '#E15050',
          600: '#BC3C39',
          700: '#942A26',
          800: '#691B16',
          900: '#380E0A',
        },
        border: {
          DEFAULT: 'hsl(var(--border))',
        },
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        surface: 'hsl(var(--surface))',
        background: {
          DEFAULT: 'hsl(var(--background))',
        },
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsla(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        success: {
          DEFAULT: 'hsl(var(--success))',
          light: 'hsl(var(--success-light))',
        },
        error: {
          DEFAULT: 'hsl(var(--error))',
          light: 'hsl(var(--error-light))',
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          light: 'hsl(var(--warning-light))',
        },
        info: {
          DEFAULT: 'hsl(var(--info))',
          light: 'hsl(var(--info-light))',
        },
        divider: 'hsl(var(--divider))',
        main: {
          DEFAULT: '#133C65',
          '0': '#ECF0F4',
          '10': '#DBE4ED',
          '20': '#DBE4ED',
          '30': '#B4D2F0',
          '40': '#6391C0',
          '50': '#133C65',
          '60': '#0B233A',
        },
        readonly: {
          DEFAULT: '#E6E6E6',
          border: '#B6B6B6',
        },
      },
      backgroundImage: {
        'neon-grad-1': 'linear-gradient(180deg, #EDFFC2 0%, #EDFFC2 50%, #D3FE6F 100%);',
        'neon-grad-2': 'linear-gradient(180deg, #EDFFC2 0%, #CEFC65 50%, #D3FE6F 100%);',
        'pink-grad-1': 'linear-gradient(180deg, #FCEDFF 0%, #FCEDFF 50%, #F9C4F9 100%);',
        'neutral-grad-1': 'linear-gradient(180deg, #EDFFC2 0%, #CEFC65 50%, #D3FE6F 100%);',
        'neutral-grad-2': 'linear-gradient(180deg, #FFFFFF 0%, #E3E4E6 50%, #FFFFFF 100%);',
        'neutral-grad-3': 'linear-gradient(180deg, #FFFFFF 0%, #F3F3F7 100%);',
        'blue-grad-1': 'linear-gradient(180deg, #DFF5FF 0%, #DFF5FF 50%, #B2E1FF 100%);',
        'yellow-grad-1': 'linear-gradient(180deg, #FFF3D9 0%, #FFF3D9 50%, #FFE8B0 100%);',
        'red-grad-1': 'linear-gradient(180deg, #FFEAEE 0%, #FFEAEE 50%, #FEBDC5 100%);',
        'green-grad-1': 'linear-gradient(180deg, #EDFFC2 0%, #EDFFC2 50%, #D3FE6F 100%);',
        'green-grad-2': 'linear-gradient(180deg, #EDFFC2 0%, #CEFC65 50%, #D3FE6F 100%);',
      },
      borderRadius: {
        '3xl': '36px',
        '2xl': '24px',
        xl: '16px',
        lg: '12px',
        md: '8px',
        sm: '4px',
        haft: '50%',
      },
      boxShadow: {
        active: '0 0 80px 0 rgba(0, 0, 0, 0.10)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate'), require('@tailwindcss/typography')],
};

export {};
