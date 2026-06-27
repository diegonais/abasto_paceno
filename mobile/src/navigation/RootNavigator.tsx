import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';

import { getMapOffers } from '../api/offers';
import { searchSemanticOffers } from '../api/semanticSearch';
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
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchStatus, setSearchStatus] = useState('');
  const [navigationReady, setNavigationReady] = useState(false);

  const loadOffers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMapOffers();
      setOffers(data);
      setError('');
      setSearchStatus('');
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : 'No se pudieron cargar las ofertas.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSemanticSearch = useCallback(async () => {
    const query = searchQuery.trim();

    if (query.length < 2) {
      setSearchStatus('Escribe al menos 2 caracteres para buscar.');
      return;
    }

    setSearching(true);
    setError('');

    try {
      const result = await searchSemanticOffers(query);
      setOffers(result.offers);
      setSelectedOfferId(null);
      setSearchStatus(
        result.products.length
          ? `${result.offers.length} ofertas para: ${result.products.join(', ')}`
          : result.message || 'No encontramos productos relacionados en el catalogo.',
      );
    } catch (requestError) {
      setSearchStatus(
        requestError instanceof Error ? requestError.message : 'No se pudo completar la busqueda.',
      );
    } finally {
      setSearching(false);
    }
  }, [searchQuery]);

  const clearSemanticSearch = useCallback(() => {
    setSearchQuery('');
    setSearchStatus('');
    void loadOffers();
  }, [loadOffers]);

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
              searchQuery={searchQuery}
              searchStatus={searchStatus}
              searching={searching}
              onSearchQueryChange={setSearchQuery}
              onSemanticSearch={handleSemanticSearch}
              onClearSemanticSearch={clearSemanticSearch}
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
              searchQuery={searchQuery}
              searchStatus={searchStatus}
              searching={searching}
              onSearchQueryChange={setSearchQuery}
              onSemanticSearch={handleSemanticSearch}
              onClearSemanticSearch={clearSemanticSearch}
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
