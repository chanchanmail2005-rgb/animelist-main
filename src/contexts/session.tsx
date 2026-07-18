import React, { createContext, useContext, useState } from "react";
import { User } from "@/src/lib/api";

type SessionContextValue = {
  user: User | null;
  isLoading: boolean;
  isAuthed: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export const SessionProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<User | null>({
    id: "offline-user",
    email: "offline@mode.com",
    name: "CHANCHAN",
  });
  const [isLoading, setIsLoading] = useState(false);

  const signIn = async (email: string, password: string) => {
    // No-op for offline mode
  };

  const signUp = async (email: string, password: string, name?: string) => {
    // No-op for offline mode
  };

  const signOut = async () => {
    // No-op for offline mode
  };

  return (
    <SessionContext.Provider
      value={{
        user,
        isLoading,
        isAuthed: true,
        signIn,
        signUp,
        signOut,
        refresh: async () => {},
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
