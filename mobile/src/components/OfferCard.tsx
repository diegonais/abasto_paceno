import { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import { spacing } from '../constants/theme';
import { useAppTheme } from '../context/ThemeContext';
import type { MapOffer } from '../types/offers';
import { formatCurrency, getMerchantName } from '../utils/format';

type OfferCardProps = {
  offer: MapOffer;
  compact?: boolean;
  onPress?: () => void;
};

export function OfferCard({ offer, compact = false, onPress }: OfferCardProps) {
  const { theme } = useAppTheme();
  const { colors } = theme;
  const scale = useRef(new Animated.Value(1)).current;

  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      onPressIn={() => {
        if (!onPress) {
          return;
        }

        Animated.spring(scale, {
          toValue: 0.985,
          damping: 18,
          stiffness: 260,
          useNativeDriver: true,
        }).start();
      }}
      onPressOut={() => {
        if (!onPress) {
          return;
        }

        Animated.spring(scale, {
          toValue: 1,
          damping: 18,
          stiffness: 220,
          useNativeDriver: true,
        }).start();
      }}
    >
      <Animated.View
        style={[
          styles.card,
          compact && styles.compact,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            transform: [{ scale }],
            ...theme.shadow,
          },
        ]}
      >
        <View style={styles.header}>
        <View style={styles.titleGroup}>
          <Text numberOfLines={1} style={[styles.productName, { color: colors.text }]}>
            {offer.productName || 'Producto'}
          </Text>
          <Text numberOfLines={1} style={[styles.merchant, { color: colors.muted }]}>
            {getMerchantName(offer)}
          </Text>
        </View>
        <Text style={[styles.price, { color: colors.primary }]}>{formatCurrency(offer.price)}</Text>
      </View>

      <View style={styles.metaRow}>
        <Text style={[styles.badge, { backgroundColor: colors.badgeBg, color: colors.primary }]}>
          Venta: {offer.saleType || 'sin dato'}
        </Text>
        {offer.approximateQuantity ? (
          <Text style={[styles.quantity, { color: colors.muted }]}>Cantidad aprox.: {offer.approximateQuantity}</Text>
        ) : null}
      </View>

      {offer.locationDescription ? (
        <Text numberOfLines={compact ? 2 : 3} style={[styles.location, { color: colors.text }]}>
          {offer.locationDescription}
        </Text>
      ) : null}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderRadius: 0,
  },
  compact: {
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  titleGroup: {
    flex: 1,
    minWidth: 0,
  },
  productName: {
    fontSize: 17,
    fontWeight: '900',
  },
  merchant: {
    marginTop: spacing.xs,
    fontSize: 13,
  },
  price: {
    maxWidth: 116,
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'right',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  badge: {
    overflow: 'hidden',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: '700',
  },
  quantity: {
    fontSize: 12,
  },
  location: {
    fontSize: 13,
    lineHeight: 19,
  },
});
