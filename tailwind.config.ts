import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}", // <--- INI KUNCINYA
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
export default config;