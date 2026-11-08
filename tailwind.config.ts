import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FDFCFB',
          100: '#FAF8F5',
          200: '#F4EFEA',
          300: '#ECE5DD',
          900: '#1E242B',
        },
        coral: {
          50: '#FFF5F2',
          100: '#FFE8DF',
          200: '#FFD1C2',
          400: '#FF886E',
          500: '#FF6B4A',
          600: '#F0522E',
        },
        peach: {
          50: '#FFF8F4',
          100: '#FFEFE7',
          200: '#FFDFCF',
          300: '#FFCEB6',
          500: '#FFA07A',
        },
        butter: {
          50: '#FFFDF5',
          100: '#FEF9E6',
          200: '#FCF1C2',
          300: '#FBE694',
          500: '#F5CE42',
        },
        mint: {
          50: '#F2FAF6',
          100: '#E2F6EB',
          200: '#C2ECD5',
          500: '#4EBA87',
          600: '#38A16F',
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(30, 36, 43, 0.05)',
        'card': '0 8px 30px -4px rgba(255, 107, 74, 0.07)',
        'button': '0 6px 20px -2px rgba(255, 107, 74, 0.25)',
      }
    },
  },
  plugins: [],
};
export default config;

