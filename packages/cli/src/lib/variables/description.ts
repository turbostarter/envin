import * as z from "zod";
import type { StandardSchemaV1 } from "@/lib/standard";

const zodSchema = z.object({
  description: z.string(),
});

const valibotSchema = z.object({
  pipe: z.array(
    z.object({
      kind: z.string(),
      type: z.string(),
      description: z.string().optional(),
    }),
  ),
});

type ValibotSchema = z.infer<typeof valibotSchema>;

const descriptionSchema = z.union([zodSchema, valibotSchema]);

const _getLastMetadata = (schema: ValibotSchema) => {
  const nestedSchemas = [];
  for (let index = schema.pipe.length - 1; index >= 0; index--) {
    const item = schema.pipe[index];
    if (item?.kind === "schema" && "pipe" in item) {
      // @ts-expect-error
      nestedSchemas.push(item);
    } else if (item?.kind === "metadata" && item?.type === "description") {
      return item.description;
    }
  }
  for (const nestedSchema of nestedSchemas) {
    const result = _getLastMetadata(nestedSchema);
    if (result !== undefined) {
      return result;
    }
  }
};

export const getDescription = (schema: StandardSchemaV1) => {
  const result = descriptionSchema.safeParse(schema);

  if (!result.success) {
    return undefined;
  }

  if ("description" in result.data) {
    return result.data.description;
  }

  if ("pipe" in schema) {
    return _getLastMetadata(schema as ValibotSchema);
  }

  return undefined;
};
