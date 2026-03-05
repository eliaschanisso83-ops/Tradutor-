import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load environment variables from .env files
  const env = loadEnv(mode, (process as any).cwd(), '');

  // CRITICAL: On Vercel, the secret is in process.env.GEMINI_API_KEY or process.env.API_KEY.
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || env.GEMINI_API_KEY || env.API_KEY || "";

  return {
    plugins: [
      react(),
    ],
    define: {
      // Inject the API Key string directly into the build
      'process.env.GEMINI_API_KEY': JSON.stringify(apiKey),
      'process.env.API_KEY': JSON.stringify(apiKey),
      // Polyfill process.env to prevent "process is not defined" crashes in browser
      'process.env': {
        NODE_ENV: JSON.stringify(mode)
      }
    }
  };
});