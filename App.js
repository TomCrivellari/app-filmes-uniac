import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Keyboard,
  Modal,
  Pressable,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import searchWithFetch from './src/tmdb/searchWithFetch';
import getMovieDetails from './src/tmdb/getMovieDetails';
import styles from './styles';

const mensagemErro = 'Não foi possível buscar os filmes. Verifique sua conexão.';

export default function App() {
  const [queryText, setQueryText] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [movies, setMovies] = useState([]);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [details, setDetails] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState('');

  async function pesquisar() {
    if (!queryText.trim() || isSearching) return;

    setIsSearching(true);
    setError('');
    setSearched(true);

    try {
      const result = await searchWithFetch(queryText.trim());
      setMovies(result);
    } catch {
      setMovies([]);
      setError(mensagemErro);
    } finally {
      setIsSearching(false);
    }
  }

  async function abrirDetalhes(movie) {
    setSelectedMovie(movie);
    setDetails(null);
    setDetailsError('');
    setIsLoadingDetails(true);

    try {
      const result = await getMovieDetails(movie.id);
      setDetails(result);
    } catch {
      setDetailsError('Não foi possível carregar os detalhes do filme.');
    } finally {
      setIsLoadingDetails(false);
    }
  }

  function fecharDetalhes() {
    setSelectedMovie(null);
    setDetails(null);
    setDetailsError('');
  }

  function formatarData(data) {
    if (!data) return 'Data não informada';
    const [ano, mes, dia] = data.split('-');
    return dia && mes && ano ? `${dia}/${mes}/${ano}` : data;
  }

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()} accessible={false}>
      <View style={styles.container}>
        <StatusBar style="dark" />
        <Text style={styles.header}>Procurar Filme</Text>
        <Text style={styles.subtitle}>Encontre seu próximo filme favorito.</Text>

        <View style={styles.searchBox}>
          <TextInput
            style={styles.input}
            placeholder="Digite o nome de um filme"
            placeholderTextColor="#8992A5"
            value={queryText}
            onChangeText={setQueryText}
            onSubmitEditing={pesquisar}
            returnKeyType="search"
          />

          <Pressable
            style={[styles.button, isSearching && styles.buttonDisabled]}
            onPress={pesquisar}
            disabled={isSearching}
          >
            <Text style={styles.buttonText}>{isSearching ? 'Pesquisando...' : 'Pesquisar filmes'}</Text>
          </Pressable>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {searched && !isSearching && !error && movies.length === 0 ? (
          <Text style={styles.empty}>Nenhum filme encontrado</Text>
        ) : null}
        {movies.length > 0 ? <Text style={styles.sectionTitle}>Resultados</Text> : null}

        <FlatList
          style={styles.list}
          data={movies}
          keyboardShouldPersistTaps="handled"
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <Pressable style={styles.card} onPress={() => abrirDetalhes(item)}>
              <Image
                source={item.posterUrl ? { uri: item.posterUrl } : require('./assets/sem-poster.png')}
                style={styles.poster}
              />
              <View style={styles.movieInfo}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.meta}>Ano: {item.releaseDate?.slice(0, 4) || 'Não informado'}</Text>
                <View style={styles.rating}>
                  <Text style={styles.ratingStar}>★</Text>
                  <Text style={styles.ratingText}>{item.vote_average?.toFixed?.(1) ?? '—'}</Text>
                </View>
              </View>
            </Pressable>
          )}
        />

        <Modal visible={Boolean(selectedMovie)} animationType="slide" onRequestClose={fecharDetalhes}>
          <View style={styles.modalContainer}>
            <Pressable onPress={fecharDetalhes} style={styles.closeButton}>
              <Text style={styles.closeText}>‹  Voltar</Text>
            </Pressable>
            {isLoadingDetails ? (
              <ActivityIndicator size="large" color="#222" />
            ) : detailsError ? (
              <Text style={styles.error}>{detailsError}</Text>
            ) : details ? (
              <FlatList
                style={styles.detailsList}
                data={[details]}
                keyExtractor={(item) => String(item.id)}
                contentContainerStyle={styles.detailsContent}
                renderItem={({ item }) => (
                  <>
                    <Text style={styles.detailTitle}>{item.title}</Text>
                    <Text style={styles.detailLabel}>Sinopse</Text>
                    <Text style={styles.detailText}>{item.overview || 'Sinopse não disponível.'}</Text>
                    <Text style={styles.detailLabel}>Duração</Text>
                    <Text style={styles.detailText}>{item.runtime ? `${item.runtime} minutos` : 'Não informada'}</Text>
                    <Text style={styles.detailLabel}>Gêneros</Text>
                    <Text style={styles.detailText}>
                      {item.genres?.length ? item.genres.join(', ') : 'Não informados'}
                    </Text>
                    <Text style={styles.detailLabel}>Lançamento</Text>
                    <Text style={styles.detailText}>{formatarData(item.releaseDate)}</Text>
                  </>
                )}
              />
            ) : null}
          </View>
        </Modal>
      </View>
    </TouchableWithoutFeedback>
  );
}
