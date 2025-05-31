"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { type UseFormReturn, useForm } from "react-hook-form";
import { Status, useFilters } from "@/components/filters/context";
import type { StandardSchemaV1 } from "@/lib/standard";
import type { Variables } from "@/lib/types";
import { validate } from "@/lib/validate";

export const VariablesContext = createContext<VariablesContextType>({
  form: {} as UseFormReturn,
  issues: [],
  variables: {},
  filteredKeys: [],
});

export type VariablesContextType = {
  form: UseFormReturn;
  variables: Variables;
  issues: ReadonlyArray<StandardSchemaV1.Issue>;
  filteredKeys: string[];
};

export const VariablesProvider = ({
  children,
  variables,
}: {
  children: React.ReactNode;
  variables: Variables;
}) => {
  const { query, status } = useFilters();
  const form = useForm({
    defaultValues: Object.fromEntries(
      Object.entries(variables).map(([key, value]) => [
        key,
        value.default || "",
      ]),
    ),
  });
  const [issues, setIssues] = useState<VariablesContextType["issues"]>([]);
  const [filteredKeys, setFilteredKeys] = useState(Object.keys(variables));

  const onValidate = useCallback(async (data: Record<string, unknown>) => {
    const result = await validate(data);
    setIssues(result.issues ?? []);
  }, []);

  useEffect(() => {
    const unsubscribe = form.subscribe({
      formState: {
        values: true,
      },
      callback: (data) => onValidate(data.values),
    });

    onValidate(form.getValues());

    return () => unsubscribe();
  }, [form, onValidate]);

  const filterByStatus = useCallback(
    (keys: string[], status: Status) => {
      switch (status) {
        case Status.VALID:
          return keys.filter(
            (key) => !issues.some((issue) => issue.path?.includes(key)),
          );
        case Status.INVALID:
          return keys.filter((key) =>
            issues.some((issue) => issue.path?.includes(key)),
          );
        default:
          return keys;
      }
    },
    [issues],
  );

  const filterByQuery = useCallback(
    (keys: string[], query: string) => {
      if (!query) return keys;

      return keys.filter((key) => {
        const variable = variables[key];
        const description = variable?.description?.toLowerCase() || "";
        return (
          key.toLowerCase().includes(query.toLowerCase()) ||
          description.toLowerCase().includes(query.toLowerCase())
        );
      });
    },
    [variables],
  );

  useEffect(() => {
    setFilteredKeys(
      filterByStatus(filterByQuery(Object.keys(variables), query), status),
    );
  }, [filterByStatus, filterByQuery, query, status, variables]);

  return (
    <VariablesContext.Provider
      value={{
        form,
        variables,
        issues,
        filteredKeys,
      }}
    >
      {children}
    </VariablesContext.Provider>
  );
};

export const useVariables = () => {
  const context = useContext(VariablesContext);

  if (!context) {
    throw new Error("useVariables must be used within a VariablesProvider");
  }

  return context;
};

export const useVariable = (key: string) => {
  const { form, variables, issues } = useVariables();

  const variable = key in variables ? variables[key] : null;
  const issue = issues.find((issue) => issue.path?.includes(key));

  const field = form.watch(key);

  return {
    variable,
    issue,
    field,
  };
};
