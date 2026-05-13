/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  important: true,
  corePlugins: {
    preflight: false, // desativa o reset base que quebra o Angular Material
  },
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff8e1',
          400: '#ffee58',
          500: '#ffe600',
          600: '#f9d100',
        },
      },
    },
  },
  plugins: [],
};
