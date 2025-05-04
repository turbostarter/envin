"use client";

import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { cn } from "@/utils";
import Form from "@rjsf/shadcn";
import type { FieldTemplateProps, RJSFSchema } from "@rjsf/utils";
import validator from "@rjsf/validator-ajv8";
import { AlertCircle, File } from "lucide-react";
import { BaseInputTemplateProps } from "@rjsf/utils";
import { generateTemplates } from "@rjsf/shadcn";

const schema: RJSFSchema = {
  title: "Test form",
  type: "string",
};

interface EnvVariablesFormProps {
  schema: any;
}

export const EnvVariablesForm = ({ schema }: EnvVariablesFormProps) => {
  return (
    <>
      <Form
        schema={schema}
        validator={validator}
        liveValidate
        templates={{
          FieldTemplate: CustomFieldTemplate,
          FieldErrorTemplate: () => null,
          BaseInputTemplate: MyBaseInputTemplate,
        }}
      />
    </>
  );
};

const { BaseInputTemplate } = generateTemplates(); // To get templates from core
// const { BaseInputTemplate } = Templates; // To get templates from a theme do this

function MyBaseInputTemplate(props: BaseInputTemplateProps) {
  const customProps = {};
  // get your custom props from where you need to
  return (
    <>
      <BaseInputTemplate {...props} {...customProps} />
      <div>XD</div>
    </>
  );
}

function CustomFieldTemplate(props: FieldTemplateProps) {
  const { id, classNames, style, label, required, description, children } =
    props;

  return (
    <div className={cn("flex flex-col gap-2", classNames)} style={style}>
      <div>
        <Label htmlFor={id} className="text-base">
          <span className="font-mono">{label}</span>
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

      <div className="flex gap-2">
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
