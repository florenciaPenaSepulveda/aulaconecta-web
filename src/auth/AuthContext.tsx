import { createContext, useCallback, useContext, useMemo, useState, ReactNode } from "react";
import { useApolloClient } from "@apollo/client";
import { Session, loadSession, saveSession } from "../lib/session";

interface AuthContextValue {
  session: Session | null;
  signIn: (session: Session) => void;
  markPasswordChanged: (token?: string) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const client = useApolloClient();
  const [session, setSession] = useState<Session | null>(loadSession);

  const signIn = useCallback((next: Session) => {
    saveSession(next);
    setSession(next);
  }, []);

  const markPasswordChanged = useCallback((token?: string) => {
    setSession((current) => {
      if (!current) {
        return current;
      }
      const next = { ...current, isChangePassword: false, ...(token ? { token } : {}) };
      saveSession(next);
      return next;
    });
  }, []);

  const signOut = useCallback(() => {
    saveSession(null);
    setSession(null);
    client.clearStore();
  }, [client]);

  const value = useMemo(
    () => ({ session, signIn, markPasswordChanged, signOut }),
    [session, signIn, markPasswordChanged, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
};
