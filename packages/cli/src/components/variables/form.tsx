"use client";

import { AlertCircle, Check, Copy, File, Lock, ShieldOff } from "lucide-react";
import { useMemo, useState } from "react";
import type {
  Control,
  ControllerRenderProps,
  FieldValues,
} from "react-hook-form";
import * as z from "zod";
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
  Supabase,
  Uploadthing,
  Upstash,
  Vercel,
  Vite,
  Wxt,
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
  "supabase-vercel": Supabase,
  vite: Vite,
  wxt: Wxt,
} as const;

const getIconComponent = (key: string) =>
  key in PresetIcons ? PresetIcons[key as keyof typeof PresetIcons] : null;

const toDisplayLabel = (key: string) => key.replaceAll("-", " ");

type TreeNode = {
  name: string;
  variables: VariableWithKey[];
  children: Record<string, TreeNode>;
};

const createNode = (name: string): TreeNode => ({
  name,
  variables: [],
  children: {},
});

type Tree = {
  rootVariables: VariableWithKey[];
  children: Record<string, TreeNode>;
};

const buildTree = (items: VariableWithKey[]): Tree => {
  const tree: Tree = { rootVariables: [], children: {} };

  for (const item of items) {
    const fullPath = item.preset?.path ?? [DEFAULT_PRESET];
    const path = fullPath.filter((segment) => segment !== DEFAULT_PRESET);

    if (!path.length) {
      tree.rootVariables.push(item);
      continue;
    }

    const top = path[0] ?? "";
    if (!tree.children[top]) {
      tree.children[top] = createNode(top);
    }
    let current = tree.children[top];

    if (path.length === 1) {
      current.variables.push(item);
      continue;
    }

    for (let i = 1; i < path.length; i++) {
      const segment = path[i] ?? "";
      if (!current.children[segment]) {
        current.children[segment] = createNode(segment);
      }

      current = current.children[segment];
      if (i === path.length - 1) {
        current.variables.push(item);
      }
    }
  }

  return tree;
};

export const Form = () => {
  const { form, variables, filteredKeys } = useVariables();

  const items = useMemo(
    () =>
      filteredKeys
        .map((key) => ({
          ...variables[key],
          key,
        }))
        .filter((variable): variable is VariableWithKey => Boolean(variable)),
    [filteredKeys, variables],
  );

  const tree = useMemo(() => buildTree(items), [items]);

  const topLevelKeys = useMemo(
    () => [DEFAULT_PRESET, ...Object.keys(tree.children).reverse()],
    [tree.children],
  );

  if (!filteredKeys.length) {
    return <Empty />;
  }

  const renderNode = (node: TreeNode) => {
    const childKeys = Object.keys(node.children);
    return (
      <>
        {node.variables.length > 0 && (
          <div
            className={cn({
              "pb-5": childKeys.length > 0,
            })}
          >
            {node.variables.map((variable) => (
              <Variable
                key={variable.key}
                variable={variable}
                control={form.control}
              />
            ))}
          </div>
        )}
        {childKeys.length > 0 && (
          <Accordion type="multiple">
            {childKeys.map((child) => {
              const childNode = node.children[child];
              const Icon = getIconComponent(child);

              if (!childNode) {
                return null;
              }

              return (
                <AccordionItem
                  key={child}
                  value={child}
                  className="mb-3 last:mb-0"
                >
                  <AccordionTrigger>
                    <div className="flex items-center gap-2 uppercase">
                      {Icon && <Icon className="size-4" />}
                      {toDisplayLabel(child)}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>{renderNode(childNode)}</AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
      </>
    );
  };

  return (
    <ScrollArea className="w-full h-full">
      <Accordion type="multiple" defaultValue={topLevelKeys}>
        <Root {...form}>
          <form className="space-y-3">
            {topLevelKeys.map((key) => {
              const Icon = getIconComponent(key);

              return (
                <AccordionItem
                  key={key}
                  className={cn(
                    "flex flex-col",
                    key === DEFAULT_PRESET && "pt-5",
                  )}
                  value={key}
                >
                  {key !== DEFAULT_PRESET && (
                    <AccordionTrigger>
                      <div className="flex items-center gap-2 uppercase">
                        {Icon && <Icon className="size-4" />}
                        {toDisplayLabel(key)}
                      </div>
                    </AccordionTrigger>
                  )}
                  <AccordionContent>
                    {key === DEFAULT_PRESET
                      ? renderNode({
                          name: DEFAULT_PRESET,
                          variables: tree.rootVariables,
                          children: {},
                        })
                      : tree.children[key]
                        ? renderNode(tree.children[key])
                        : null}
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
  const { issue, fileValue } = useVariable(variable.key);

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
            <FilesBadge files={fileValue?.files ?? []} />
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
