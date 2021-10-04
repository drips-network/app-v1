module.exports = {
  purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      screens: {
        '2xl': '1440px'
      },
      colors: {
        indigo: {
          700: '#17164B',
          900: '#090928'
        }
      }
    }
  },
  variants: {
    extend: {}
  },
  plugins: []
}
