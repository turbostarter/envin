"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { type UseFormReturn, useForm } from "react-hook-form";
import { useFilters } from "@/components/filters/context";
import { useHotreload } from "@/lib/hooks/use-hot-reload";
import type { StandardSchemaV1 } from "@/lib/standard";
import { type FileValues, Status, type Variables } from "@/lib/types";
import { validate } from "@/lib/validate";
import { getFileValues } from "@/lib/variables";

export const VariablesContext = createContext<VariablesContextType>({
  form: {} as UseFormReturn,
  issues: [],
  variables: {},
  filteredKeys: [],
  fileValues: {},
});

export type VariablesContextType = {
  form: UseFormReturn;
  variables: Variables;
  issues: ReadonlyArray<StandardSchemaV1.Issue>;
  filteredKeys: string[];
  fileValues: FileValues;
};

export const VariablesProvider = ({
  children,
  variables,
}: {
  children: React.ReactNode;
  variables: Variables;
}) => {
  const router = useRouter();
  const { query, status, environment } = useFilters();
  const [fileValues, setFileValues] = useState<FileValues>({});
  const isResettingRef = useRef(false);
  const form = useForm({
    defaultValues: Object.fromEntries(
      Object.entries(variables).map(([key, value]) => [
        key,
        fileValues[key]?.value ?? value.default ?? "",
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
      callback: (data) => {
        if (!isResettingRef.current) {
          onValidate(data.values);
        }
      },
    });

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

  useHotreload(() => {
    router.refresh();
  });

  useEffect(() => {
    setFilteredKeys(
      filterByStatus(filterByQuery(Object.keys(variables), query), status),
    );
  }, [filterByStatus, filterByQuery, query, status, variables]);

  useEffect(() => {
    getFileValues(environment).then((newFileValues) => {
      setFileValues(newFileValues);
      const newValues = Object.fromEntries(
        Object.entries(variables).map(([key, value]) => [
          key,
          newFileValues[key]?.value ?? value.default ?? "",
        ]),
      );

      isResettingRef.current = true;
      form.reset(newValues, { keepDirtyValues: true });
      isResettingRef.current = false;

      onValidate(newValues);
    });
  }, [environment, variables, form, onValidate]);

  return (
    <VariablesContext.Provider
      value={{
        form,
        variables,
        issues,
        filteredKeys,
        fileValues,
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
  const { form, variables, issues, fileValues } = useVariables();

  const variable = key in variables ? variables[key] : null;
  const issue = issues.find((issue) => issue.path?.includes(key));

  const field = form.watch(key);

  return {
    variable,
    issue,
    field,
    fileValue: fileValues[key],
  };
};
