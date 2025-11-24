import React, { useEffect, useState } from "react";
import { auth } from "../firebase/config";
import { onAuthStateChanged, type User } from "firebase/auth";

type AuthContextType = {
  currUser: User | null;
  loggedIn: boolean;
  loading: boolean;
};

export const AuthContext = React.createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currUser, setCurrUser] = useState<User | null>(null);
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrUser(user);
        setLoggedIn(true);
      } else {
        setCurrUser(null);
        setLoggedIn(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ currUser, loggedIn, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
