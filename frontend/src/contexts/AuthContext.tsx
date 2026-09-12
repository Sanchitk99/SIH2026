import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { auth } from '../firebase/config';
import { axiosClient } from '../api/axiosClient';

interface BackendUser {
  uid: string;
  name: string;
  role: 'ADMIN' | 'RECYCLER' | 'COLLECTOR';
  is_active: boolean;
}

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  backendUser: BackendUser | null;
  role: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  refreshProfile: () => Promise<void>; // Add this line
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [backendUser, setBackendUser] = useState<BackendUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Expose a manual fetch function
  const refreshProfile = async () => {
    try {
      const res = await axiosClient.get('/auth/me');
      setBackendUser(res.data.data);
    } catch (error: any) {
      if (error.response?.status !== 404) {
        console.error("Backend profile fetch failed.", error);
      }
      setBackendUser(null);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        await refreshProfile(); // Use the function here
      } else {
        setBackendUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{
      firebaseUser,
      backendUser,
      role: backendUser?.role || null,
      loading,
      isAuthenticated: !!firebaseUser,
      refreshProfile // Provide it to the app
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

// import React, { createContext, useContext, useEffect, useState } from 'react';
// import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
// import { auth } from '../firebase/config';
// import { axiosClient } from '../api/axiosClient';

// interface BackendUser {
//   uid: string;
//   name: string;
//   role: 'ADMIN' | 'RECYCLER' | 'COLLECTOR';
//   is_active: boolean;
// }

// interface AuthContextType {
//   firebaseUser: FirebaseUser | null;
//   backendUser: BackendUser | null;
//   role: string | null;
//   loading: boolean;
//   isAuthenticated: boolean;
// }

// const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
//   const [backendUser, setBackendUser] = useState<BackendUser | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, async (user) => {
//       setFirebaseUser(user);
//       if (user) {
//         try {
//           // Token is automatically injected by axiosClient interceptor
//           const res = await axiosClient.get('/auth/me');
//           setBackendUser(res.data.data);
//         } catch (error) {
//           console.error("Backend profile fetch failed. User may need to register.", error);
//           setBackendUser(null);
//         }
//       } else {
//         setBackendUser(null);
//       }
//       setLoading(false);
//     });
//     return unsubscribe;
//   }, []);

//   return (
//     <AuthContext.Provider value={{
//       firebaseUser,
//       backendUser,
//       role: backendUser?.role || null,
//       loading,
//       isAuthenticated: !!firebaseUser
//     }}>
//       {!loading && children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => useContext(AuthContext);