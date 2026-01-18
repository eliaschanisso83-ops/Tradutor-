import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  // Load environment variables
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    define: {
      // Replace process.env.API_KEY with the string value from Vercel
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      // Polyfill process.env to empty object to prevent "process is not defined" errors
      'process.env': {}
    }
  };
});