import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import axios from 'axios';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { auth } from '../firebase/config';
import { axiosClient } from '../api/axiosClient';

export type UserRole = 'ADMIN' | 'RECYCLER' | 'COLLECTOR';

interface BackendUser {
  uid: string;
  name: string;
  role: UserRole;
  is_active: boolean;
}

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  backendUser: BackendUser | null;
  role: UserRole | null;
  loading: boolean;
  isAuthenticated: boolean;
  profileError: string | null;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [backendUser, setBackendUser] = useState<BackendUser | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    setProfileError(null);
    try {
      const response = await axiosClient.get('/auth/me');
      setBackendUser(response.data.data);
    } catch (error: unknown) {
      const status = axios.isAxiosError(error) ? error.response?.status : undefined;
      setProfileError(status === 404 ? 'auth.profileNotFound' : 'auth.serverUnavailable');
      if (import.meta.env.DEV) console.error('Backend profile fetch failed.', error);
      setBackendUser(null);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) await refreshProfile();
      else { setBackendUser(null); setProfileError(null); }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return <AuthContext.Provider value={{ firebaseUser, backendUser, role: backendUser?.role || null, loading, isAuthenticated: Boolean(firebaseUser), profileError, refreshProfile }}>{!loading && children}</AuthContext.Provider>;
}

// This file intentionally exports the provider and its companion hook.
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
