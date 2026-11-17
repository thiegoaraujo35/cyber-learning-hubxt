"use server";

import { removeRow, saveRow, type FormState } from "@/lib/crud";
import { goalSchema } from "@/lib/schemas";

export async function saveGoal(_: FormState, formData: FormData): Promise<FormState> {
  return saveRow({ table: "goals", schema: goalSchema, formData, path: "/metas" });
}

export async function deleteGoal(formData: FormData) {
  await removeRow("goals", formData, "/metas");
}
