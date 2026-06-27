import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, type Region } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DEFAULT_MAP_REGION } from '../constants/map';
import { spacing } from '../constants/theme';
import { useAppTheme } from '../context/ThemeContext';
import type { MapOffer } from '../types/offers';
import { BrandLogo } from './BrandLogo';
import { OfferCard } from './OfferCard';
import { ThemeToggle } from './ThemeToggle';

type OfferMapProps = {
  offers: MapOffer[];
  selectedOfferId?: string | null;
  onOfferSelect?: (offer: MapOffer) => void;
  searchQuery: string;
  searchStatus: string;
  searching: boolean;
  onSearchQueryChange: (query: string) => void;
  onSemanticSearch: () => void;
  onClearSemanticSearch: () => void;
};

export function OfferMap({
  offers,
  selectedOfferId,
  onOfferSelect,
  searchQuery,
  searchStatus,
  searching,
  onSearchQueryChange,
  onSemanticSearch,
  onClearSemanticSearch,
}: OfferMapProps) {
  const mapRef = useRef<MapView>(null);
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const { colors } = theme;
  const [activeOffer, setActiveOffer] = useState<MapOffer | null>(null);
  const previewProgress = useRef(new Animated.Value(0)).current;

  const selectedOffer = useMemo(
    () => offers.find((offer) => offer.id === selectedOfferId) ?? null,
    [offers, selectedOfferId],
  );

  useEffect(() => {
    if (!selectedOffer) {
      return;
    }

    setActiveOffer(selectedOffer);
    mapRef.current?.animateToRegion(regionForOffer(selectedOffer), 460);
  }, [selectedOffer]);

  useEffect(() => {
    Animated.spring(previewProgress, {
      toValue: activeOffer ? 1 : 0,
      damping: 20,
      mass: 0.75,
      stiffness: 180,
      useNativeDriver: true,
    }).start();
  }, [activeOffer, previewProgress]);

  const handleMarkerPress = (offer: MapOffer) => {
    setActiveOffer(offer);
    onOfferSelect?.(offer);
    mapRef.current?.animateToRegion(regionForOffer(offer), 360);
  };

  const closePreview = () => {
    Animated.timing(previewProgress, {
      toValue: 0,
      duration: 160,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setActiveOffer(null);
      }
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.cream }]}>
      <MapView ref={mapRef} initialRegion={DEFAULT_MAP_REGION} style={StyleSheet.absoluteFill}>
        {offers.map((offer) => (
          <Marker
            key={offer.id}
            coordinate={{
              latitude: Number(offer.latitude),
              longitude: Number(offer.longitude),
            }}
            onPress={() => handleMarkerPress(offer)}
            pinColor={offer.id === activeOffer?.id ? colors.success : colors.primaryActive}
            title={offer.productName}
            description={offer.locationDescription ?? undefined}
          />
        ))}
      </MapView>

      {theme.mode === 'dark' ? <View pointerEvents="none" style={styles.darkMapOverlay} /> : null}

      <View
        style={[
          styles.header,
          {
            top: insets.top + spacing.md,
            backgroundColor: colors.mapHeader,
            borderColor: colors.border,
            ...theme.shadow,
          },
        ]}
      >
        <View style={styles.headerTop}>
          <BrandLogo />
          <ThemeToggle />
        </View>
        <Text style={[styles.count, { color: colors.muted }]}>{offers.length} ofertas activas</Text>
        <View style={styles.searchIntro}>
          <View style={styles.searchIntroCopy}>
            <Text style={[styles.searchTitle, { color: colors.text }]}>Busqueda inteligente</Text>
            <Text style={[styles.searchHint, { color: colors.muted }]}>
              Describe lo que quieres preparar.
            </Text>
          </View>
        </View>
        <View style={styles.searchRow}>
          <TextInput
            value={searchQuery}
            placeholder="Quiero hacer parrillada"
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
                { color: theme.mode === 'dark' ? '#101722' : colors.surface },
              ]}
            >
              {searching ? '...' : 'Buscar'}
            </Text>
          </TouchableOpacity>
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
        {searchQuery || searchStatus ? (
          <TouchableOpacity activeOpacity={0.78} onPress={onClearSemanticSearch}>
            <Text style={[styles.clearSearch, { color: colors.primary }]}>
              Ver todas las ofertas
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {activeOffer ? (
        <Animated.View
          style={[
            styles.preview,
            {
              bottom: insets.bottom + 102,
              opacity: previewProgress,
              transform: [
                {
                  translateY: previewProgress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [24, 0],
                  }),
                },
                {
                  scale: previewProgress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.98, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <OfferCard compact offer={activeOffer} />
          <TouchableOpacity
            activeOpacity={0.82}
            onPress={closePreview}
            style={[styles.closeButton, { backgroundColor: colors.primary }]}
          >
            <Text
              style={[
                styles.closeText,
                { color: theme.mode === 'dark' ? '#101722' : colors.surface },
              ]}
            >
              Cerrar
            </Text>
          </TouchableOpacity>
        </Animated.View>
      ) : null}
    </View>
  );
}

function regionForOffer(offer: MapOffer): Region {
  return {
    latitude: Number(offer.latitude),
    longitude: Number(offer.longitude),
    latitudeDelta: 0.025,
    longitudeDelta: 0.025,
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  darkMapOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(16, 23, 34, 0.18)',
  },
  header: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    gap: spacing.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderRadius: 8,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  count: {
    paddingLeft: spacing.xs,
    fontSize: 13,
  },
  searchIntro: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.xs,
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
  searchRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    minHeight: 42,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    fontSize: 14,
  },
  searchButton: {
    minHeight: 42,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: 8,
  },
  searchButtonText: {
    fontWeight: '800',
  },
  searchStatus: {
    padding: spacing.sm,
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 12,
    lineHeight: 17,
  },
  clearSearch: {
    fontSize: 12,
    fontWeight: '800',
  },
  preview: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    gap: spacing.sm,
  },
  closeButton: {
    alignSelf: 'flex-end',
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    borderRadius: 14,
  },
  closeText: {
    fontWeight: '800',
  },
});
