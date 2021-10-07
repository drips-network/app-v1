module.exports = {
  purge: ['./public/*.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  separator: '_',
  theme: {
    extend: {
      screens: {
        '2xl': '1440px',
        notouch: { raw: '(hover:hover)' }
      },
      colors: {
        violet: {
          600: '#4949DD'
        },
        indigo: {
          700: '#17164B',
          800: '#12123C',
          900: '#090928'
        },
        blue: {
          900: '#101828'
        }
      },
      spacing: {
        px: '1px',
        0: '0rem',
        1: '0.1rem',
        2: '0.2rem',
        3: '0.3rem',
        4: '0.4rem',
        5: '0.5rem',
        6: '0.6rem',
        7: '0.7rem',
        8: '0.8rem',
        9: '0.9rem',
        10: '1.0rem',
        11: '1.1rem',
        12: '1.2rem',
        14: '1.4rem',
        16: '1.6rem',
        18: '1.8rem',
        20: '2.0rem',
        24: '2.4rem',
        28: '2.8rem',
        32: '3.2rem',
        36: '3.6rem',
        40: '4.0rem',
        44: '4.4rem',
        48: '4.8rem',
        52: '5.2rem',
        56: '5.6rem',
        60: '6.0rem',
        64: '6.4rem',
        72: '7.2rem',
        80: '8.0rem',
        96: '9.6rem',
        112: '11.2rem',
        144: '14.4rem'
      },
      fontSize: {
        '2xs': ['0.8rem', { lineHeight: '1.2rem' }],
        xs: ['1rem', { lineHeight: '1.4rem' }],
        sm: ['1.2rem', { lineHeight: '1.6rem' }],
        ms: ['1.5rem', { lineHeight: '1.8rem' }],
        base: ['1.6rem', { lineHeight: '2rem' }],
        md: ['1.8rem', { lineHeight: '2.2rem' }],
        lg: ['2rem', { lineHeight: '2.4rem' }],
        xl: ['2.4rem', { lineHeight: '2.8rem' }],
        '2xl': ['3rem', { lineHeight: '1' }],
        '3xl': ['3.6rem', { lineHeight: '1' }],
        '4xl': ['4.8rem', { lineHeight: '1' }],
        '5xl': ['6.4rem', { lineHeight: '1' }]
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif']
      },
      borderRadius: {
        none: '0px',
        // sm: '0.125rem',
        DEFAULT: '0.4rem',
        // md: '0.375rem',
        // lg: '0.5rem',
        // xl: '0.75rem',
        '2xl': '4rem',
        '2xlb': '4.5rem',
        // '3xl': '1.5rem',
        full: '9999px'
      },
      scale: {
        102: '1.02'
      }
    }
  },
  variants: {
    extend: {
      display: ['group-hover']
    }
  },
  plugins: []
}
