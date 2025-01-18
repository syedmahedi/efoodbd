/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',         // If you're using a plain HTML file
    './src/**/*.{js,jsx,ts,tsx}',  // React components in the src folder
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FC8934',
        hover: '#B66326',
        gold: '#ffcc00'// Your custom primary color
      },
    },
  },
  plugins: [
    require('daisyui'),
  ],
}
