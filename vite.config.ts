import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  // Carrega as variáveis de ambiente baseadas no modo atual (production, development, etc.)
  // O terceiro argumento '' garante que carregamos todas as variáveis, não apenas as com prefixo VITE_
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    define: {
      // Isso substitui qualquer ocorrência de 'process.env.API_KEY' no código
      // pelo valor real da string da chave durante o build
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    }
  };
});