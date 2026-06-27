import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandLogo } from '../components/BrandLogo';
import { OfferCard } from '../components/OfferCard';
import { ScreenState } from '../components/ScreenState';
import { ThemeToggle } from '../components/ThemeToggle';
import { spacing } from '../constants/theme';
import { useAppTheme } from '../context/ThemeContext';
import type { MapOffer } from '../types/offers';

type OffersListScreenProps = {
  offers: MapOffer[];
  loading: boolean;
  error: string;
  onRefresh: () => void;
  searchQuery: string;
  searchStatus: string;
  searching: boolean;
  onSearchQueryChange: (query: string) => void;
  onSemanticSearch: () => void;
  onClearSemanticSearch: () => void;
  onOfferPress: (offer: MapOffer) => void;
};

export function OffersListScreen({
  offers,
  loading,
  error,
  onRefresh,
  searchQuery,
  searchStatus,
  searching,
  onSearchQueryChange,
  onSemanticSearch,
  onClearSemanticSearch,
  onOfferPress,
}: OffersListScreenProps) {
  const { theme } = useAppTheme();
  const { colors } = theme;

  if (loading && !offers.length) {
    return <ScreenState loading title="Cargando ofertas" description="Preparando el listado." />;
  }

  if (error && !offers.length) {
    return (
      <ScreenState
        title="No se pudieron cargar las ofertas"
        description={error}
        actionLabel="Reintentar"
        onActionPress={onRefresh}
      />
    );
  }

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: colors.cream }]}>
      <FlatList
        data={offers}
        keyExtractor={(offer) => offer.id}
        contentContainerStyle={[
          offers.length ? styles.content : styles.emptyContent,
          { backgroundColor: colors.cream },
        ]}
        refreshControl={
          <RefreshControl refreshing={loading} tintColor={colors.primary} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <BrandLogo />
              <ThemeToggle />
            </View>
            <Text style={[styles.description, { color: colors.muted }]}>
              Toca una oferta para verla ubicada en el mapa.
            </Text>
            <View
              style={[
                styles.searchPanel,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.surfaceSoft,
                  ...theme.shadow,
                },
              ]}
            >
              <View style={styles.searchIntro}>
                <View style={styles.searchIntroCopy}>
                  <Text style={[styles.searchTitle, { color: colors.text }]}>
                    Busqueda inteligente
                  </Text>
                  <Text style={[styles.searchHint, { color: colors.muted }]}>
                    Ej. parrillada, sopa familiar o desayuno.
                  </Text>
                </View>
              </View>
              <TextInput
                value={searchQuery}
                placeholder="Ej. quiero hacer parrillada"
                placeholderTextColor={colors.muted}
                returnKeyType="search"
                onChangeText={onSearchQueryChange}
                onSubmitEditing={onSemanticSearch}
                style={[
                  styles.searchInput,
                  {
                    borderColor: colors.border,
                    color: colors.text,
                    backgroundColor: colors.surface,
                  },
                ]}
              />
              <View style={styles.searchActions}>
                <TouchableOpacity
                  activeOpacity={0.84}
                  disabled={searching}
                  onPress={onSemanticSearch}
                  style={[
                    styles.searchButton,
                    {
                      backgroundColor: colors.primary,
                      opacity: searching ? 0.68 : 1,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.searchButtonText,
                      {
                        color: theme.mode === 'dark' ? '#101722' : colors.surface,
                      },
                    ]}
                  >
                    {searching ? 'Buscando...' : 'Buscar'}
                  </Text>
                </TouchableOpacity>
                {searchQuery || searchStatus ? (
                  <TouchableOpacity
                    activeOpacity={0.78}
                    onPress={onClearSemanticSearch}
                    style={styles.clearButton}
                  >
                    <Text style={[styles.clearButtonText, { color: colors.primary }]}>
                      Ver todas
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>
              {searchStatus ? (
                <Text
                  style={[
                    styles.searchStatus,
                    {
                      borderColor: colors.border,
                      backgroundColor: colors.badgeBg,
                      color: colors.muted,
                    },
                  ]}
                >
                  {searchStatus}
                </Text>
              ) : null}
            </View>
            {error ? (
              <Text
                style={[styles.error, { backgroundColor: colors.errorBg, color: colors.primary }]}
              >
                {error}
              </Text>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          <ScreenState
            title="Sin ofertas activas"
            description="Cuando haya publicaciones disponibles apareceran aqui."
          />
        }
        renderItem={({ item }) => <OfferCard offer={item} onPress={() => onOfferPress(item)} />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 124,
  },
  emptyContent: {
    flexGrow: 1,
    paddingBottom: 124,
  },
  header: {
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  description: {
    fontSize: 14,
  },
  error: {
    marginTop: spacing.sm,
    padding: spacing.md,
    fontWeight: '700',
  },
  searchPanel: {
    gap: spacing.sm,
    marginTop: spacing.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderRadius: 8,
  },
  searchIntro: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  searchIntroCopy: {
    flex: 1,
  },
  searchTitle: {
    fontSize: 14,
    fontWeight: '900',
  },
  searchHint: {
    marginTop: 1,
    fontSize: 12,
  },
  searchInput: {
    minHeight: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    fontSize: 14,
  },
  searchActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  searchButton: {
    flex: 1,
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  searchButtonText: {
    fontWeight: '800',
  },
  clearButton: {
    minHeight: 42,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: 8,
  },
  clearButtonText: {
    fontWeight: '800',
  },
  searchStatus: {
    padding: spacing.sm,
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 12,
    lineHeight: 17,
  },
  separator: {
    height: spacing.md,
  },
});
