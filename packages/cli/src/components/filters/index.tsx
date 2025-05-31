"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { Environment, Status, useFilters } from "@/components/filters/context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useVariables } from "@/components/variables/context";
import { useCopyToClipboard } from "@/lib/hooks/use-copy-to-clipboard";
import {
  DEFAULT_PRESET,
  type Variables,
  type VariableWithKey,
} from "@/lib/types";
import { cn } from "@/utils/cn";

export const Filters = () => {
  return (
    <div className="flex gap-2">
      <StatusSelect />
      <EnvironmentSelect />
      <SearchInput />
      <CopyButton />
    </div>
  );
};

const useStatusSuffix = () => {
  const { variables, issues } = useVariables();
  const keys = Object.keys(variables);

  const invalid = keys.filter((key) =>
    issues.some((issue) => issue.path?.includes(key)),
  ).length;

  return {
    [Status.ALL]: keys.length,
    [Status.VALID]: keys.length - invalid,
    [Status.INVALID]: invalid,
  };
};

const StatusSelect = () => {
  const { status, setStatus } = useFilters();
  const statuses = useStatusSuffix();

  return (
    <Select defaultValue={status} onValueChange={setStatus}>
      <SelectTrigger className="capitalize">
        <SelectValue placeholder="Select a status" />
      </SelectTrigger>
      <SelectContent>
        {Object.values(Status).map((status) => (
          <SelectItem key={status} value={status} className="capitalize">
            <div
              className={cn("size-2.5 rounded-full", {
                "bg-primary": status === Status.ALL,
                "bg-green-500": status === Status.VALID,
                "bg-destructive": status === Status.INVALID,
              })}
            />
            {status} ({statuses[status]})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

const EnvironmentSelect = () => {
  const { environment, setEnvironment } = useFilters();

  return (
    <Select defaultValue={environment} onValueChange={setEnvironment}>
      <SelectTrigger className="capitalize">
        <SelectValue placeholder="Select an environment" />
      </SelectTrigger>
      <SelectContent>
        {Object.values(Environment).map((environment) => (
          <SelectItem
            key={environment}
            value={environment}
            className="capitalize"
          >
            {environment}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

const SearchInput = () => {
  const { query, setQuery } = useFilters();

  return (
    <Input
      placeholder="Search for a variable..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
};

const getTextToCopy = (
  variables: Variables,
  values: Record<string, string>,
) => {
  const keys = Object.keys(variables);
  const sections = Object.groupBy(
    keys.map((key) => {
      return {
        ...variables[key],
        key,
      };
    }),
    ({ preset }) => preset ?? DEFAULT_PRESET,
  );

  const presets = Object.keys(sections).reverse();

  const formatPresetHeader = (preset: string, presetIndex: number) => {
    if (preset === DEFAULT_PRESET) return "";
    return `${presetIndex > 0 ? "\n\n" : ""}### ${preset.toUpperCase()} ###\n`;
  };

  const formatVariable = (variable: VariableWithKey, index: number) => {
    const description = variable.description
      ? `${index === 0 ? "" : "\n"}# ${variable.description}\n`
      : "";
    return `${description}${variable.key}="${values[variable.key]}"`;
  };

  const text = presets
    .map((preset, presetIndex) => {
      const presetHeader = formatPresetHeader(preset, presetIndex);
      const variables = sections[preset]?.map(formatVariable).join("\n") ?? "";
      return `${presetHeader}${variables}`;
    })
    .join("\n");

  return text;
};

const CopyButton = () => {
  const { variables, form } = useVariables();
  const [, copy] = useCopyToClipboard();
  const [showCheck, setShowCheck] = useState(false);

  const handleCopy = async () => {
    const values = form.getValues();
    const text = getTextToCopy(variables, values);
    const success = await copy(text);
    if (success) {
      setShowCheck(true);
      setTimeout(() => setShowCheck(false), 2000);
    }
  };

  return (
    <Button variant="outline" onClick={handleCopy}>
      {showCheck ? (
        <>
          <Check className="size-4" />
          Copied to clipboard
        </>
      ) : (
        <>
          <Copy className="size-4" />
          Copy to clipboard
        </>
      )}
    </Button>
  );
};
