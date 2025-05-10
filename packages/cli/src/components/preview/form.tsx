"use client";

import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { cn } from "@/utils";
import JSONSchemaForm from "@rjsf/shadcn";
import type { FieldTemplateProps, RJSFSchema } from "@rjsf/utils";
import validator from "@rjsf/validator-ajv8";
import { AlertCircle, Copy, File, ShieldOff } from "lucide-react";
import type { BaseInputTemplateProps } from "@rjsf/utils";
import { generateTemplates } from "@rjsf/shadcn";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface EnvVariablesFormProps {
  schema: RJSFSchema;
}

export const Form = ({ schema }: EnvVariablesFormProps) => {
  return (
    <ScrollArea className="w-full h-full border rounded-md p-6">
      <JSONSchemaForm
        schema={schema}
        validator={validator}
        liveValidate
        templates={{
          FieldTemplate: CustomFieldTemplate,
          ButtonTemplates: {
            SubmitButton: () => null,
          },
          BaseInputTemplate: MyBaseInputTemplate,
        }}
        showErrorList={false}
        onChange={(x) => {
          console.log(x);
        }}
      />
    </ScrollArea>
  );
};

const { BaseInputTemplate } = generateTemplates();

function MyBaseInputTemplate(props: BaseInputTemplateProps) {
  const customProps = {};
  return (
    <div className="flex gap-2 [&>:first-child]:grow">
      <BaseInputTemplate {...props} {...customProps} />
      <Button variant="outline" size="icon">
        <Copy className="size-4" />
      </Button>
    </div>
  );
}

function CustomFieldTemplate(props: FieldTemplateProps) {
  const { id, classNames, style, label, required, description, children } =
    props;

  if (id === "root") {
    return <div className="flex flex-col gap-12 [&>*]:gap-12">{children}</div>;
  }

  return (
    <div className={cn("flex flex-col gap-2", classNames)} style={style}>
      <div>
        <Label htmlFor={id} className="text-base">
          <span className="font-mono font-semibold">{label}</span>
          {required && (
            <Badge variant="outline" className="ml-1 font-bold">
              Required
            </Badge>
          )}
        </Label>
        <div className="text-sm text-muted-foreground">{description}</div>
      </div>
      {children}
      {/* {errors}/ */}

      <div className="flex gap-2 mt-0.5">
        <Badge variant="secondary">
          <ShieldOff className="size-4" />
          Public variable
        </Badge>
        <Badge variant="outline">
          <File className="size-4" />
          .env
        </Badge>

        <Badge variant="destructive">
          <AlertCircle className="size-4" />
          Invalid value
        </Badge>
      </div>
    </div>
  );
}
