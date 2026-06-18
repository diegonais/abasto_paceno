import { AuthProvider } from './AuthProvider';

export function AppProviders({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}
