import { useContext } from 'react';

import { AuthContext } from '../app/providers/AuthContext';

export function useAuth() {
  return useContext(AuthContext);
}
