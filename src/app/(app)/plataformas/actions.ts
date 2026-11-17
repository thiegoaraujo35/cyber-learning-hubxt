"use server";

import { removeRow, saveRow, type FormState } from "@/lib/crud";
import { platformSchema } from "@/lib/schemas";

export async function savePlatform(_: FormState, formData: FormData): Promise<FormState> {
  return saveRow({ table: "platforms", schema: platformSchema, formData, path: "/plataformas" });
}

export async function deletePlatform(formData: FormData) {
  await removeRow("platforms", formData, "/plataformas");
}
