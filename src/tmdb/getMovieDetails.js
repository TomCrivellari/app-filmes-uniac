import { API_KEY, BASE_URL, requireApiKey } from './config';

export default async function getMovieDetails(id) {
  requireApiKey();
  const url = `${BASE_URL}/movie/${id}`;
  const params = { api_key: API_KEY, language: 'pt-BR' };
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`${url}?${query}`);
  if (!response.ok) throw new Error('Falha ao carregar detalhes.');
  const movie = await response.json();

  return {
    id: movie.id,
    title: movie.title,
    overview: movie.overview,
    runtime: movie.runtime,
    genres: (movie.genres || []).map((genre) => genre.name),
    releaseDate: movie.release_date,
  };
}
