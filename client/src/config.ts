export type ClientConfig = {
  apiBaseUrl: string;
  searchUrlBase: string;
  apiKey?: string;
};

function readEnv(): ClientConfig {
  const env = (import.meta as any).env || {};
  const apiBase = env.VITE_API_BASE_URL || '';
  const searchBase = env.VITE_SEARCH_URL_BASE || 'https://www.google.com/search?q=';
  const apiKey = env.VITE_API_KEY || '';
  return {
    apiBaseUrl: apiBase,
    searchUrlBase: searchBase,
    apiKey: apiKey ? apiKey : undefined
  };
}

export const clientConfig: ClientConfig = readEnv();


