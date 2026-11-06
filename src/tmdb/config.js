export const API_KEY = process.env.EXPO_PUBLIC_TMDB_API_KEY;
export const BASE_URL = 'https://api.themoviedb.org/3';
export const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

export function requireApiKey() {
  if (!API_KEY) {
    throw new Error('Configure EXPO_PUBLIC_TMDB_API_KEY para usar a busca.');
  }
}
