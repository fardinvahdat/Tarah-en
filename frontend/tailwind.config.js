
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors:{
        primary:{
          default:'#22319e',
          b1:'#22319e',
          b2:'#5f7296',
          b3:'#A0BFE0'
        },
        light:{
          l1:'#e2ebfe'
        },
      }
    },
  },
  plugins: [],
}

