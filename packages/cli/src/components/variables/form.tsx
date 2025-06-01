"use client";

import { AlertCircle, Check, Copy, File, Lock, ShieldOff } from "lucide-react";
import { useState } from "react";
import type {
  Control,
  ControllerRenderProps,
  FieldValues,
} from "react-hook-form";
import { z } from "zod";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  Form as Root,
} from "@/components/ui/form";
import {
  Fly,
  Neon,
  Netlify,
  Railway,
  Render,
  Uploadthing,
  Upstash,
  Vercel,
} from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useVariable, useVariables } from "@/components/variables/context";
import { useCopyToClipboard } from "@/lib/hooks/use-copy-to-clipboard";
import type { StandardSchemaV1 } from "@/lib/standard";
import {
  DEFAULT_PRESET,
  type VariableGroup,
  type VariableWithKey,
} from "@/lib/types";
import { cn } from "@/utils/cn";

const PresetIcons = {
  "neon-vercel": Neon,
  vercel: Vercel,
  uploadthing: Uploadthing,
  render: Render,
  railway: Railway,
  fly: Fly,
  netlify: Netlify,
  "upstash-redis": Upstash,
} as const;

export const Form = () => {
  const { form, variables, filteredKeys } = useVariables();

  if (!filteredKeys.length) {
    return <Empty />;
  }

  const sections = Object.groupBy(
    filteredKeys.map((key) => {
      return {
        ...variables[key],
        key,
      };
    }),
    ({ preset }) => preset ?? DEFAULT_PRESET,
  );

  const presets = Object.keys(sections).reverse();

  return (
    <ScrollArea className="w-full h-full">
      <Accordion type="multiple" defaultValue={presets}>
        <Root {...form}>
          <form className="space-y-3">
            {presets.map((key) => {
              const Icon =
                key in PresetIcons
                  ? PresetIcons[key as keyof typeof PresetIcons]
                  : null;
              return (
                <AccordionItem
                  key={key}
                  className={cn("flex flex-col", key === "root" && "pt-5")}
                  value={key}
                >
                  {key !== "root" && (
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        {Icon && <Icon className="size-4" />}
                        {key.replace("-", " ")}
                      </div>
                    </AccordionTrigger>
                  )}
                  <AccordionContent>
                    {sections[key]?.map((variable) => (
                      <Variable
                        key={variable.key}
                        variable={variable as VariableWithKey}
                        control={form.control}
                      />
                    ))}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </form>
        </Root>
      </Accordion>
    </ScrollArea>
  );
};

const AccessBadge = ({ group }: { group: VariableGroup }) => {
  if (["client", "shared"].includes(group)) {
    return (
      <Badge variant="secondary">
        <ShieldOff className="size-4" />
        Public variable
      </Badge>
    );
  }

  if (group === "server") {
    return (
      <Badge variant="secondary">
        <Lock className="size-4" />
        Secret variable
      </Badge>
    );
  }

  return null;
};

const FilesBadge = ({ files }: { files: string[] }) => {
  return (
    <>
      {files.map((file) => (
        <Badge variant="outline" key={file}>
          <File className="size-4" />
          {file}
        </Badge>
      ))}
    </>
  );
};

const StatusBadge = ({ valid }: { valid: boolean }) => {
  if (valid) {
    return (
      <Badge variant="outline" className="border-green-500 text-green-500">
        <Check className="size-4" />
        Valid
      </Badge>
    );
  }

  return (
    <Badge variant="destructive">
      <AlertCircle className="size-4" />
      Invalid value
    </Badge>
  );
};

const ValueInput = ({
  variable,
  field,
}: {
  variable: VariableWithKey;
  field: ControllerRenderProps<FieldValues, string>;
}) => {
  const [, copy] = useCopyToClipboard();
  const [showCheck, setShowCheck] = useState(false);

  const handleCopy = async () => {
    const success = await copy(field.value);
    if (success) {
      setShowCheck(true);
      setTimeout(() => setShowCheck(false), 2000);
    }
  };

  return (
    <div className="flex gap-2">
      <FormControl>
        <Input
          placeholder={`Set a value for ${variable.key}`}
          className="font-mono"
          {...field}
        />
      </FormControl>

      <Button variant="outline" size="icon" onClick={handleCopy} type="button">
        {showCheck ? (
          <>
            <Check className="size-4" />
            <span className="sr-only">Copied to clipboard</span>
          </>
        ) : (
          <>
            <Copy className="size-4" />
            <span className="sr-only">Copy to clipboard</span>
          </>
        )}
      </Button>
    </div>
  );
};

const hasCode = (
  issue: StandardSchemaV1.Issue,
): issue is StandardSchemaV1.Issue & { code: string } => {
  return z.object({ code: z.string() }).safeParse(issue).success;
};

const ErrorMessage = ({
  variable,
  issue,
}: {
  variable: string;
  issue: StandardSchemaV1.Issue;
}) => {
  return (
    <div className="mt-1 border border-destructive rounded-md p-4 text-destructive text-sm">
      {hasCode(issue) && (
        <code className="font-medium font-mono mb-1.5 block bg-destructive/10 px-2 w-fit rounded-md">
          {issue.code}
        </code>
      )}
      <div>
        The value for <span className="font-mono font-medium">{variable}</span>{" "}
        is invalid:
      </div>
      <ul className="list-disc list-inside mt-1 ml-2">
        <li>{issue.message}</li>
      </ul>
    </div>
  );
};

const Variable = ({
  variable,
  control,
}: {
  variable: VariableWithKey;
  control: Control;
}) => {
  const { issue } = useVariable(variable.key);

  return (
    <FormField
      key={variable.key}
      control={control}
      name={variable.key}
      render={({ field }) => (
        <FormItem className="border-b py-7 first:pt-1 last:pb-0 last:border-b-0">
          <div className="space-y-1">
            <FormLabel className="font-mono font-semibold">
              {variable.key}
            </FormLabel>
            {variable.description && (
              <FormDescription>{variable.description}</FormDescription>
            )}
          </div>
          <ValueInput variable={variable} field={field} />
          <div className="flex gap-2 mt-0.5">
            <AccessBadge group={variable.group} />
            <FilesBadge files={variable.files} />
            <StatusBadge valid={!issue} />
          </div>

          {issue && <ErrorMessage variable={variable.key} issue={issue} />}
        </FormItem>
      )}
    />
  );
};

const Empty = () => {
  return (
    <div className="w-full h-full relative grow min-w-0 flex items-center justify-center">
      <p className="text-muted-foreground w-full max-w-md text-center text-balance">
        No variables found. Please add some variables to the config or modify
        the filters.
      </p>
    </div>
  );
};
