"use client";

import React from "react";
import { useForm } from "react-hook-form";
import {
  Form as Root,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy, AlertCircle, File, ShieldOff, Lock } from "lucide-react";
import type { ExtractedSchema } from "@/utils/save-schemas";

type FieldInfo = {
  key: string;
  section: "shared" | "client" | "server";
  isPublic: boolean;
  envFile: string;
  description: string;
  schema: any; // The actual schema object
};

type SchemaBasedFormProps = {
  schemas: ExtractedSchema;
  onSubmit?: (data: Record<string, string>) => void;
  onFieldChange?: (key: string, value: string) => void;
  defaultValues?: Record<string, string>;
  className?: string;
};

/**
 * Generate field info from schema objects
 */
function generateFieldsFromSchemas(schemas: ExtractedSchema): FieldInfo[] {
  const fields: FieldInfo[] = [];

  // Add shared fields
  if (schemas.shared) {
    Object.entries(schemas.shared).forEach(([key, schema]) => {
      fields.push({
        key,
        schema,
        section: "shared",
        description:
          "Shared environment variable available on both client and server",
        isPublic: true,
        envFile: ".env",
      });
    });
  }

  // Add client fields
  if (schemas.client) {
    Object.entries(schemas.client).forEach(([key, schema]) => {
      fields.push({
        key,
        schema,
        section: "client",
        description: `Client-side environment variable${schemas.clientPrefix ? ` (must start with ${schemas.clientPrefix})` : ""}`,
        isPublic: true,
        envFile: ".env.local",
      });
    });
  }

  // Add server fields
  if (schemas.server) {
    Object.entries(schemas.server).forEach(([key, schema]) => {
      fields.push({
        key,
        schema,
        section: "server",
        description:
          "Server-only environment variable, not accessible on client",
        isPublic: false,
        envFile: ".env",
      });
    });
  }

  return fields;
}

/**
 * Validate a value using the actual schema object
 */
function validateWithSchema(
  value: string,
  schema: any,
): { isValid: boolean; errors: string[] } {
  // Check if schema has Standard Schema interface
  if (
    schema &&
    schema["~standard"] &&
    typeof schema["~standard"].validate === "function"
  ) {
    try {
      const result = schema["~standard"].validate(value);

      if (result instanceof Promise) {
        return { isValid: true, errors: ["Async validation not supported"] };
      }

      if (result.issues) {
        return {
          isValid: false,
          errors: result.issues.map((issue: any) => issue.message),
        };
      }

      return { isValid: true, errors: [] };
    } catch (error) {
      return {
        isValid: false,
        errors: [error instanceof Error ? error.message : "Validation failed"],
      };
    }
  }

  // Fallback for non-Standard Schema objects
  return { isValid: true, errors: [] };
}

type FieldRendererProps = {
  field: FieldInfo;
  control: any;
  onCopy?: (key: string, value: string) => void;
  watch: (name: string) => string;
};

const FieldRenderer: React.FC<FieldRendererProps> = ({
  field,
  control,
  onCopy,
  watch,
}) => {
  const currentValue = watch(field.key) || "";
  const validation = validateWithSchema(currentValue, field.schema);

  return (
    <FormField
      key={field.key}
      control={control}
      name={field.key}
      render={({ field: formField }) => (
        <FormItem className="border-b py-6 first:pt-0 last:pb-0 last:border-b-0">
          <div className="space-y-1">
            <FormLabel className="font-mono font-semibold">
              {field.key}
              {/* We can't easily determine if required without probing, so we'll skip this for now */}
            </FormLabel>
            <FormDescription>{field.description}</FormDescription>
          </div>

          <div className="flex gap-2">
            <FormControl>
              <Input
                type="text"
                placeholder={`Set a value for ${field.key}`}
                className="font-mono"
                {...formField}
              />
            </FormControl>

            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => onCopy?.(field.key, formField.value)}
            >
              <Copy className="size-4" />
              <span className="sr-only">Copy to clipboard</span>
            </Button>
          </div>

          <div className="flex gap-2 mt-0.5">
            <Badge variant={field.isPublic ? "secondary" : "default"}>
              {field.isPublic ? (
                <ShieldOff className="size-4" />
              ) : (
                <Lock className="size-4" />
              )}
              {field.isPublic ? "Public variable" : "Private variable"}
            </Badge>

            <Badge variant="outline">
              <File className="size-4" />
              {field.envFile}
            </Badge>

            <Badge variant="outline">{field.section}</Badge>

            {!validation.isValid && (
              <Badge variant="destructive">
                <AlertCircle className="size-4" />
                Invalid value
              </Badge>
            )}
          </div>

          {!validation.isValid && (
            <div className="mt-2 border border-destructive rounded-md p-4 text-destructive text-sm">
              <div className="font-semibold mb-1">Invalid Value</div>
              <div>
                The value for{" "}
                <span className="font-mono font-medium">{field.key}</span> is
                invalid:
              </div>
              <ul className="list-disc list-inside mt-1 ml-2">
                {validation.errors.map((error, index) => (
                  <li key={`${field.key}-error-${index}`}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export const SchemaBasedForm: React.FC<SchemaBasedFormProps> = ({
  schemas,
  onSubmit,
  onFieldChange,
  defaultValues = {},
  className,
}) => {
  const form = useForm({
    defaultValues,
    mode: "onChange",
  });

  const { watch } = form;
  const fields = generateFieldsFromSchemas(schemas);

  const handleSubmit = (data: Record<string, string>) => {
    onSubmit?.(data);
  };

  const handleCopy = async (key: string, value: string) => {
    try {
      const envLine = `${key}=${value}`;
      await navigator.clipboard.writeText(envLine);
      // Could add a toast notification here
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
  };

  // Group fields by section
  const groupedFields = fields.reduce(
    (acc, field) => {
      if (!acc[field.section]) {
        acc[field.section] = [];
      }
      acc[field.section]?.push(field);
      return acc;
    },
    {} as Record<string, FieldInfo[]>,
  );

  const sectionTitles = {
    shared: "Shared Variables",
    client: "Client Variables",
    server: "Server Variables",
  };

  // Watch all fields for real-time validation feedback
  React.useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name && onFieldChange) {
        onFieldChange(name, value[name] || "");
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, onFieldChange]);

  if (fields.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <p>No environment schemas found.</p>
        <p className="text-sm mt-2">
          Run your environment configuration code to generate schemas.
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className={`w-full h-full ${className || ""}`}>
      <Root {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          {Object.entries(groupedFields).map(([section, sectionFields]) => (
            <section
              key={section}
              className="flex flex-col border rounded-md p-5 gap-6"
            >
              <span className="text-lg leading-tight font-semibold">
                {sectionTitles[section as keyof typeof sectionTitles]}
              </span>
              <div className="flex flex-col">
                {sectionFields?.map((field) => (
                  <FieldRenderer
                    key={field.key}
                    field={field}
                    control={form.control}
                    onCopy={handleCopy}
                    watch={watch}
                  />
                ))}
              </div>
            </section>
          ))}

          <div className="flex justify-end pt-4">
            <Button type="submit">Save Environment Variables</Button>
          </div>
        </form>
      </Root>
    </ScrollArea>
  );
};
