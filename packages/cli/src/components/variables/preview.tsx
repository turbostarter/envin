"use client";

import { Fragment } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useVariables } from "@/components/variables/context";
import { DEFAULT_PRESET } from "@/lib/types";
import { cn } from "@/utils/cn";
import { getVariablePresetLabel, groupVariablesByPreset } from "@/utils/preset";

export const FileContent = () => {
  const { form, issues, filteredKeys, variables } = useVariables();

  if (!filteredKeys.length) {
    return <Empty />;
  }

  const values = form.watch();

  const { sections, presets } = groupVariablesByPreset(variables, filteredKeys);

  return (
    <ScrollArea className="w-full h-full grow bg-muted rounded-md p-4 px-5 min-w-0">
      <div className="font-mono text-sm">
        {Object.keys(presets)
          .reverse()
          .map((preset) => (
            <Fragment key={preset}>
              {presets[preset]?.id !== DEFAULT_PRESET && presets[preset] && (
                <span
                  className={cn(
                    "uppercase tracking-tight text-muted-foreground mt-8 block",
                    {
                      "mt-4": presets[preset]?.path.length > 2,
                    },
                  )}
                >
                  {getVariablePresetLabel(presets[preset])}
                </span>
              )}
              {sections[preset]?.map((variable, index) => {
                const hasIssue = issues.some((issue) =>
                  issue.path?.includes(variable.key),
                );

                const value = values[variable.key];

                return (
                  <Fragment key={variable.key}>
                    {variable.description && (
                      <span
                        className={cn("text-muted-foreground truncate block", {
                          "mt-4": index > 0,
                        })}
                      >
                        # {variable.description}
                      </span>
                    )}
                    <span
                      className={cn("text-foreground block", {
                        "text-destructive": hasIssue,
                      })}
                    >
                      {value
                        ? `${variable.key}="${value ?? ""}"`
                        : `${variable.key}=`}
                    </span>
                  </Fragment>
                );
              })}
            </Fragment>
          ))}
      </div>
    </ScrollArea>
  );
};

const Empty = () => {
  return (
    <ScrollArea className="w-full h-full relative grow bg-muted rounded-md p-4 px-5 min-w-0">
      <p className="text-muted-foreground w-full max-w-md text-center text-balance absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        No variables found. Please add some variables to the config or modify
        the filters.
      </p>
    </ScrollArea>
  );
};
