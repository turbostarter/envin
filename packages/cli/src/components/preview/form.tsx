"use client";

import { AlertCircle, Copy, File, ShieldOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/utils";
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

type FormProps = {
  config: any;
};

export const Form = ({ config }: FormProps) => {
  const form = useForm();

  const onSubmit = (data: any) => {
    console.log(data);
  };

  const sections = [config.shared, config.client, config.server].filter(
    (section) => !!section && Object.values(section).length > 0,
  );

  return (
    <ScrollArea className="w-full h-full">
      <Root {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {sections.map((section, i) => (
            <section
              key={i}
              className="flex flex-col border rounded-md p-5 gap-6"
            >
              <span className="text-lg leading-tight font-semibold">
                Client variables
              </span>
              <div className="flex flex-col">
                {Object.entries(section).map(([key, value]) => (
                  <FormField
                    key={key}
                    control={form.control}
                    name={`username-${i}`}
                    render={({ field }) => (
                      <FormItem className="border-b py-6 first:pt-0 last:pb-0 last:border-b-0">
                        <div className="space-y-1">
                          <FormLabel className="font-mono font-semibold">
                            {key}
                          </FormLabel>
                          <FormDescription>
                            This is your public display name.
                          </FormDescription>
                        </div>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input
                              placeholder="Set a value for NEXT_PUBLIC_USERNAME"
                              className="font-mono"
                              {...field}
                            />
                          </FormControl>

                          <Button variant="outline" size="icon">
                            <Copy className="size-4" />
                            <span className="sr-only">Copy to clipboard</span>
                          </Button>
                        </div>
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

                        <div className="mt-2 border border-destructive rounded-md p-4 text-destructive text-sm">
                          <div className="font-semibold mb-1">
                            Invalid Value
                          </div>
                          <div>
                            The value for{" "}
                            <span className="font-mono font-medium">
                              NEXT_PUBLIC_SITE_URL
                            </span>{" "}
                            is invalid:
                          </div>
                          <ul className="list-disc list-inside mt-1 ml-2">
                            <li>
                              The{" "}
                              <span className="font-mono">
                                NEXT_PUBLIC_SITE_URL
                              </span>{" "}
                              variable must start with https
                            </li>
                          </ul>
                        </div>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </section>
          ))}
        </form>
      </Root>
    </ScrollArea>
  );
};

function MyBaseInputTemplate(props) {
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

function CustomFieldTemplate(props) {
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
    </div>
  );
}
