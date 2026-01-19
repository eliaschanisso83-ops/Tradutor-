import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  // Load environment variables from .env files
  // The third argument '' ensures we load all variables, not just VITE_ prefixed ones
  const env = loadEnv(mode, (process as any).cwd(), '');

  // CRITICAL: On Vercel, the secret is in process.env.API_KEY (System Env).
  // We must prioritize process.env.API_KEY over env.API_KEY (which comes from .env files).
  const apiKey = process.env.API_KEY || env.API_KEY;

  return {
    define: {
      // Inject the API Key string directly into the build
      'process.env.API_KEY': JSON.stringify(apiKey),
      // Polyfill process.env to prevent "process is not defined" crashes in browser
      'process.env': {}
    }
  };
});