import { useEffect, useState } from 'react';

import { offersService } from '../../services/offersService';

export function useOffersMap() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadOffers() {
      setLoading(true);
      try {
        const data = await offersService.listForMap();
        setOffers(data);
        setError('');
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setLoading(false);
      }
    }

    loadOffers();
  }, []);

  return { offers, loading, error };
}
