import React, { useEffect, useState } from "react";
import { auth } from "../firebase/config";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { useNavigate } from "react-router-dom";

type AuthContextType = {
  currUser: User | null;
  loggedIn: boolean;
  loading: boolean;
  logout: () => Promise<void>;
};

export const AuthContext = React.createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currUser, setCurrUser] = useState<User | null>(null);
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

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

  const logout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ currUser, loggedIn, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
