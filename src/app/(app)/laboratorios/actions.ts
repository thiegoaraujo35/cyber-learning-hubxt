"use server";

import { removeRow, saveRow, type FormState } from "@/lib/crud";
import { todayISO } from "@/lib/dates";
import { labSchema } from "@/lib/schemas";

export async function saveLab(_: FormState, formData: FormData): Promise<FormState> {
  return saveRow({
    table: "labs",
    schema: labSchema,
    formData,
    path: "/laboratorios",
    prepare: (d) =>
      d.status === "concluido" ? { ...d, completed_at: d.completed_at ?? todayISO() } : d,
  });
}

export async function deleteLab(formData: FormData) {
  await removeRow("labs", formData, "/laboratorios");
}
