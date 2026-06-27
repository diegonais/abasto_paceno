import { RefreshControl, ScrollView, StyleSheet } from 'react-native';

import { OfferMap } from '../components/OfferMap';
import { ScreenState } from '../components/ScreenState';
import { useAppTheme } from '../context/ThemeContext';
import type { MapOffer } from '../types/offers';

type MapScreenProps = {
  offers: MapOffer[];
  loading: boolean;
  error: string;
  selectedOfferId: string | null;
  onOfferSelect: (offer: MapOffer) => void;
  onRefresh: () => void;
  searchQuery: string;
  searchStatus: string;
  searching: boolean;
  onSearchQueryChange: (query: string) => void;
  onSemanticSearch: () => void;
  onClearSemanticSearch: () => void;
};

export function MapScreen({
  offers,
  loading,
  error,
  selectedOfferId,
  onOfferSelect,
  onRefresh,
  searchQuery,
  searchStatus,
  searching,
  onSearchQueryChange,
  onSemanticSearch,
  onClearSemanticSearch,
}: MapScreenProps) {
  const { theme } = useAppTheme();
  const { colors } = theme;

  if (loading && !offers.length) {
    return (
      <ScreenState loading title="Cargando ofertas" description="Estamos consultando el backend." />
    );
  }

  if (error && !offers.length) {
    return (
      <ScreenState
        title="No se pudo cargar el mapa"
        description={error}
        actionLabel="Reintentar"
        onActionPress={onRefresh}
      />
    );
  }

  if (!offers.length) {
    return (
      <ScrollView
        contentContainerStyle={styles.empty}
        refreshControl={
          <RefreshControl refreshing={loading} tintColor={colors.primary} onRefresh={onRefresh} />
        }
      >
        <ScreenState
          title="Sin ofertas activas"
          description="Cuando haya publicaciones disponibles apareceran aqui."
        />
      </ScrollView>
    );
  }

  return (
    <OfferMap
      offers={offers}
      selectedOfferId={selectedOfferId}
      onOfferSelect={onOfferSelect}
      searchQuery={searchQuery}
      searchStatus={searchStatus}
      searching={searching}
      onSearchQueryChange={onSearchQueryChange}
      onSemanticSearch={onSemanticSearch}
      onClearSemanticSearch={onClearSemanticSearch}
    />
  );
}

const styles = StyleSheet.create({
  empty: {
    flexGrow: 1,
  },
});
