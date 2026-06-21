import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
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
  onOfferPress: (offer: MapOffer) => void;
};

export function OffersListScreen({
  offers,
  loading,
  error,
  onRefresh,
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
        refreshControl={<RefreshControl refreshing={loading} tintColor={colors.primary} onRefresh={onRefresh} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <BrandLogo />
              <ThemeToggle />
            </View>
            <Text style={[styles.description, { color: colors.muted }]}>Toca una oferta para verla ubicada en el mapa.</Text>
            {error ? <Text style={[styles.error, { backgroundColor: colors.errorBg, color: colors.primary }]}>{error}</Text> : null}
          </View>
        }
        ListEmptyComponent={
          <ScreenState title="Sin ofertas activas" description="Cuando haya publicaciones disponibles apareceran aqui." />
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
  separator: {
    height: spacing.md,
  },
});
