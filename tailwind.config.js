/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      keyframes: {
        float: {
          '0%': { 
            transform: 'translate3d(0, 0, 0)',
          },
          '50%': { 
            transform: 'translate3d(0, -20px, 0)',
          },
          '100%': { 
            transform: 'translate3d(0, 0, 0)',
          }
        },
        blink: {
          '0%, 99.5%, 100%': { 
            transform: 'scaleY(1)',
          },
          '99.8%': { 
            transform: 'scaleY(0.1)',
          }
        },
        talk: {
          '0%, 100%': {
            transform: 'translate(-50%, 0) scaleY(1)',
            borderRadius: '0 0 200px 200px',
            clipPath: 'none'
          },
          '33%': {
            transform: 'translate(-50%, 0) scaleY(0.3) scaleX(0.6)',
            borderRadius: '10px',
            clipPath: 'polygon(50% 100%, 0% 0%, 100% 0%)'
          },
          '66%': {
            transform: 'translate(-50%, 0) scaleY(0.5) scaleX(0.5)',
            borderRadius: '20px',
            clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'
          }
        }
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'blink': 'blink 30s linear infinite',
        'talk': 'talk 1.5s ease-in-out infinite',
      }
    },
  },
  plugins: [],
} 