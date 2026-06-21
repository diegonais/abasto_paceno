import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { spacing } from '../constants/theme';
import { useAppTheme } from '../context/ThemeContext';

type FloatingTabBarProps = BottomTabBarProps & {
  offersCount: number;
};

type IoniconName = keyof typeof Ionicons.glyphMap;

const routeIcon = {
  Mapa: 'map',
  Ofertas: 'list',
} as const satisfies Record<string, IoniconName>;

export function FloatingTabBar({ state, descriptors, navigation, offersCount }: FloatingTabBarProps) {
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const { colors } = theme;

  return (
    <View pointerEvents="box-none" style={[styles.wrapper, { bottom: insets.bottom + spacing.md }]}>
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.tabBar,
            borderColor: colors.border,
            ...theme.shadow,
          },
        ]}
      >
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? String(options.tabBarLabel)
              : options.title !== undefined
                ? options.title
                : route.name;
          const iconName = routeIcon[route.name as keyof typeof routeIcon] ?? 'ellipse';

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <AnimatedTabItem
              key={route.key}
              badge={route.name === 'Ofertas' ? offersCount : 0}
              focused={focused}
              iconName={iconName}
              label={label}
              onPress={onPress}
            />
          );
        })}
      </View>
    </View>
  );
}

function AnimatedTabItem({
  badge,
  focused,
  iconName,
  label,
  onPress,
}: {
  badge: number;
  focused: boolean;
  iconName: IoniconName;
  label: string;
  onPress: () => void;
}) {
  const { theme } = useAppTheme();
  const { colors } = theme;
  const progress = useRef(new Animated.Value(focused ? 1 : 0)).current;
  const pressScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(progress, {
      toValue: focused ? 1 : 0,
      damping: 18,
      mass: 0.7,
      stiffness: 180,
      useNativeDriver: false,
    }).start();
  }, [focused, progress]);

  const scale = Animated.multiply(
    pressScale,
    progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0.96, 1],
    }),
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={focused ? { selected: true } : {}}
      onPress={onPress}
      onPressIn={() => {
        Animated.spring(pressScale, {
          toValue: 0.96,
          damping: 20,
          stiffness: 260,
          useNativeDriver: false,
        }).start();
      }}
      onPressOut={() => {
        Animated.spring(pressScale, {
          toValue: 1,
          damping: 18,
          stiffness: 220,
          useNativeDriver: false,
        }).start();
      }}
      style={styles.pressable}
    >
      <Animated.View
        style={[
          styles.item,
          {
            backgroundColor: progress.interpolate({
              inputRange: [0, 1],
              outputRange: ['rgba(255,255,255,0)', colors.tabActive],
            }),
            transform: [{ scale }],
          },
        ]}
      >
        <View style={styles.iconWrap}>
          <Ionicons
            name={iconName}
            color={focused ? colors.tabTextActive : colors.tabTextInactive}
            size={focused ? 31 : 28}
          />
          {badge > 0 ? (
            <View style={[styles.badge, { backgroundColor: focused ? colors.primaryActive : colors.primary }]}>
              <Text style={styles.badgeText}>{badge > 99 ? '99+' : badge}</Text>
            </View>
          ) : null}
        </View>
        <Text
          numberOfLines={1}
          style={[
            styles.label,
            {
              color: focused ? colors.tabTextActive : colors.tabTextInactive,
            },
          ]}
        >
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
  },
  container: {
    height: 78,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.xs,
    borderWidth: 1,
    borderRadius: 999,
  },
  pressable: {
    flex: 1,
  },
  item: {
    height: 68,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderRadius: 999,
  },
  iconWrap: {
    minWidth: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -7,
    right: -14,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
    borderRadius: 999,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
  },
  label: {
    fontSize: 13,
    fontWeight: '900',
  },
});
