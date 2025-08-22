import React, { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { ApplicationUserEntity } from "../models/entity/ApplicationUserEntity";

type AppContextType = {
  profile: ApplicationUserEntity | null;
  setProfile: (profile: ApplicationUserEntity | null) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
};

// default empty context (will be replaced by Provider)
const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<ApplicationUserEntity | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  return (
    <AppContext.Provider
      value={{
        profile,
        setProfile,
        isLoading,
        setIsLoading,
        isLoggedIn,
        setIsLoggedIn,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// custom hook for easier usage
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
