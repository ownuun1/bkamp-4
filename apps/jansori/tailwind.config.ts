import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Jansori Hand-drawn Theme
        primary: '#f97316',      // Orange - 메인 컬러
        secondary: '#fbbf24',    // Yellow - 보조 컬러
        background: '#fffbf5',   // Warm cream - 배경
        surface: '#ffffff',      // White - 카드 배경
        text: '#1f2937',         // Dark gray - 텍스트
        muted: '#6b7280',        // Gray - 보조 텍스트
      },
      fontFamily: {
        // Hand-drawn style fonts
        hand: ['Schoolbell', 'cursive'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'hand': '255px 15px 225px 15px/15px 225px 15px 255px',
      },
    },
  },
  plugins: [],
};

export default config;
