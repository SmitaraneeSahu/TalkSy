
// src/context/UserContext.jsx
import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { auth, db } from '../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';

const UserContext = createContext({
  authUser: null,
  userProfile: null,
  loading: true,
  error: null,
});

export const UserProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Listen to auth changes
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      setAuthUser(user);

      if (!user) {
        setUserProfile(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const userDocRef = doc(db, 'users', user.uid);

        // First, fetch current snapshot once
        const initialSnap = await getDoc(userDocRef);
        if (initialSnap.exists()) {
          const data = initialSnap.data();
          setUserProfile({
            id: user.uid,
            name: data.name ?? user.displayName ?? '',
            email: data.email ?? user.email ?? '',
            photoURL: data.photoURL ?? user.photoURL ?? null,
          });
        } else {
          // Fallback to auth info if doc doesn't exist yet
          setUserProfile({
            id: user.uid,
            name: user.displayName ?? '',
            email: user.email ?? '',
            photoURL: user.photoURL ?? null,
          });
        }

        // Then subscribe for live updates
        const unsubDoc = onSnapshot(
          userDocRef,
          (snap) => {
            if (snap.exists()) {
              const data = snap.data();
              setUserProfile((prev) => ({
                id: user.uid,
                name: data.name ?? user.displayName ?? prev?.name ?? '',
                email: data.email ?? user.email ?? prev?.email ?? '',
                photoURL: data.photoURL ?? user.photoURL ?? prev?.photoURL ?? null,
              }));
            }
          },
          (err) => {
            console.error('[UserProvider] onSnapshot error:', err);
            setError(err);
          }
        );

        setLoading(false);

        // Cleanup doc subscription when auth user changes
        return () => unsubDoc();
      } catch (err) {
        console.error('[UserProvider] Failed to fetch user doc:', err);
        setError(err);
        // Safe fallback to auth
        setUserProfile({
          id: user.uid,
          name: user.displayName ?? '',
          email: user.email ?? '',
          photoURL: user.photoURL ?? null,
        });
        setLoading(false);
      }
    });

    return () => unsubAuth();
  }, []);

  const value = useMemo(
    () => ({ authUser, userProfile, loading, error }),
    [authUser, userProfile, loading, error]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => useContext(UserContext);
