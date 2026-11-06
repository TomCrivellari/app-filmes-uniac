import { API_KEY, BASE_URL, IMAGE_BASE_URL, requireApiKey } from './config';

export default async function searchWithFetch(query) {
  requireApiKey();
  const url = `${BASE_URL}/search/movie?api_key=${API_KEY}&language=pt-BR&query=${encodeURIComponent(query)}`;
  const response = await fetch(url);

  if (!response.ok) throw new Error('Falha ao buscar filmes.');

  const data = await response.json();
  return (data.results || []).map((movie) => ({
    id: movie.id,
    title: movie.title,
    releaseDate: movie.release_date,
    vote_average: movie.vote_average,
    posterUrl: movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : null,
  }));
}
