import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';

import { getMapOffers } from '../api/offers';
import { FloatingTabBar } from '../components/FloatingTabBar';
import { useAppTheme } from '../context/ThemeContext';
import { AssistedPublicationScreen } from '../screens/AssistedPublicationScreen';
import { MapScreen } from '../screens/MapScreen';
import { OffersListScreen } from '../screens/OffersListScreen';
import type { MapOffer } from '../types/offers';

type TabsParamList = {
  Mapa: undefined;
  Ofertas: undefined;
  Publicar: undefined;
};

const Tab = createBottomTabNavigator<TabsParamList>();

export function RootNavigator() {
  const { mode, theme } = useAppTheme();
  const [offers, setOffers] = useState<MapOffer[]>([]);
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [navigationReady, setNavigationReady] = useState(false);

  const loadOffers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMapOffers();
      setOffers(data);
      setError('');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No se pudieron cargar las ofertas.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOffers();
  }, [loadOffers]);

  return (
    <NavigationContainer
      onReady={() => setNavigationReady(true)}
      theme={{
        ...(mode === 'dark' ? DarkTheme : DefaultTheme),
        colors: {
          ...(mode === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
          background: theme.colors.cream,
          card: theme.colors.surface,
          primary: theme.colors.primary,
          text: theme.colors.text,
        },
      }}
    >
      <Tab.Navigator
        tabBar={(props) => <FloatingTabBar {...props} offersCount={offers.length} />}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tab.Screen name="Mapa">
          {() => (
            <MapScreen
              offers={offers}
              loading={loading}
              error={error}
              selectedOfferId={selectedOfferId}
              onOfferSelect={(offer) => setSelectedOfferId(offer.id)}
              onRefresh={loadOffers}
            />
          )}
        </Tab.Screen>
        <Tab.Screen name="Ofertas">
          {({ navigation }) => (
            <OffersListScreen
              offers={offers}
              loading={loading}
              error={error}
              onRefresh={loadOffers}
              onOfferPress={(offer) => {
                setSelectedOfferId(offer.id);
                if (navigationReady) {
                  navigation.navigate('Mapa');
                }
              }}
            />
          )}
        </Tab.Screen>
        <Tab.Screen name="Publicar" component={AssistedPublicationScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
