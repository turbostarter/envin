"use client";

import { Fragment } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useVariables } from "@/components/variables/context";
import { DEFAULT_PRESET } from "@/lib/types";
import { cn } from "@/utils/cn";

export const FileContent = () => {
  const { form, issues, filteredKeys, variables } = useVariables();

  const values = form.watch();

  const sections = Object.groupBy(
    filteredKeys.map((key) => {
      return {
        ...variables[key],
        value: values[key],
        key,
      };
    }),
    ({ preset }) => preset ?? DEFAULT_PRESET,
  );

  const presets = Object.keys(sections).reverse();

  return (
    <ScrollArea className="w-full h-full grow bg-muted rounded-md p-4 px-5 min-w-0">
      <div className="font-mono text-sm">
        {presets.map((preset) => (
          <Fragment key={preset}>
            {preset !== DEFAULT_PRESET && (
              <span className="uppercase text-muted-foreground mt-8 block">
                ### {preset} ###
              </span>
            )}
            {sections[preset]?.map((variable) => {
              const hasIssue = issues.some((issue) =>
                issue.path?.includes(variable.key),
              );

              return (
                <Fragment key={variable.key}>
                  {variable.description && (
                    <span className="text-muted-foreground truncate mt-4 first:mt-0 block">
                      # {variable.description}
                    </span>
                  )}
                  <span
                    className={cn("text-foreground block", {
                      "text-destructive": hasIssue,
                    })}
                  >
                    {variable.value
                      ? `${variable.key}="${variable.value ?? ""}"`
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
