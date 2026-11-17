"use server";

import { removeRow, saveRow, type FormState } from "@/lib/crud";
import { sessionSchema } from "@/lib/schemas";

export async function saveSession(_: FormState, formData: FormData): Promise<FormState> {
  return saveRow({
    table: "study_sessions",
    schema: sessionSchema,
    formData,
    path: "/dashboard",
  });
}

export async function deleteSession(formData: FormData) {
  await removeRow("study_sessions", formData, "/dashboard");
}
