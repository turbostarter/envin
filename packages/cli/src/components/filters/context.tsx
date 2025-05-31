"use client";

import { createContext, useContext, useState } from "react";

export const Status = {
  ALL: "all",
  VALID: "valid",
  INVALID: "invalid",
} as const;

export type Status = (typeof Status)[keyof typeof Status];

export const Environment = {
  DEVELOPMENT: "development",
  PRODUCTION: "production",
} as const;

export type Environment = (typeof Environment)[keyof typeof Environment];

const FiltersContext = createContext<{
  status: Status;
  environment: Environment;
  query: string;
  setStatus: (status: Status) => void;
  setEnvironment: (environment: Environment) => void;
  setQuery: (query: string) => void;
}>({
  status: Status.ALL,
  environment: Environment.DEVELOPMENT,
  query: "",
  setStatus: () => {},
  setEnvironment: () => {},
  setQuery: () => {},
});

export const FiltersProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [status, setStatus] = useState<Status>(Status.ALL);
  const [environment, setEnvironment] = useState<Environment>(
    Environment.DEVELOPMENT,
  );
  const [query, setQuery] = useState("");

  return (
    <FiltersContext.Provider
      value={{
        status,
        environment,
        query,
        setStatus,
        setEnvironment,
        setQuery,
      }}
    >
      {children}
    </FiltersContext.Provider>
  );
};

export const useFilters = () => {
  const context = useContext(FiltersContext);

  if (!context) {
    throw new Error("useFilters must be used within an FiltersProvider");
  }

  return context;
};
