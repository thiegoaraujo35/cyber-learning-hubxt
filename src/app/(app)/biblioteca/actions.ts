"use server";

import { removeRow, saveRow, type FormState } from "@/lib/crud";
import { resourceSchema } from "@/lib/schemas";

export async function saveResource(_: FormState, formData: FormData): Promise<FormState> {
  return saveRow({ table: "resources", schema: resourceSchema, formData, path: "/biblioteca" });
}

export async function deleteResource(formData: FormData) {
  await removeRow("resources", formData, "/biblioteca");
}
