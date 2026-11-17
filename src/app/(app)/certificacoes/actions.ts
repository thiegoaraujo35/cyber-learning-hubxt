"use server";

import { removeRow, saveRow, type FormState } from "@/lib/crud";
import { todayISO } from "@/lib/dates";
import { certificationSchema } from "@/lib/schemas";

export async function saveCertification(_: FormState, formData: FormData): Promise<FormState> {
  return saveRow({
    table: "certifications",
    schema: certificationSchema,
    formData,
    path: "/certificacoes",
    prepare: (d) =>
      d.status === "conquistada" ? { ...d, obtained_at: d.obtained_at ?? todayISO() } : d,
  });
}

export async function deleteCertification(formData: FormData) {
  await removeRow("certifications", formData, "/certificacoes");
}
