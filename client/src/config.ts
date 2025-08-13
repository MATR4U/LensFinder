export type ClientConfig = {
  apiBaseUrl: string;
  searchUrlBase: string;
};

function readEnv(): ClientConfig {
  const env = (import.meta as any).env || {};
  const apiBase = env.VITE_API_BASE_URL || '';
  const searchBase = env.VITE_SEARCH_URL_BASE || 'https://www.google.com/search?q=';
  return {
    apiBaseUrl: apiBase,
    searchUrlBase: searchBase
  };
}

export const clientConfig: ClientConfig = readEnv();


