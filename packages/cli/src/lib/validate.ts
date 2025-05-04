"use server";

export const validate = async (schema, data) => {
  return schema.safeParse(data).error;
};
