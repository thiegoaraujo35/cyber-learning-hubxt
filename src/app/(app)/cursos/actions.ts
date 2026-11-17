"use server";

import { removeRow, saveRow, type FormState } from "@/lib/crud";
import { todayISO } from "@/lib/dates";
import { courseSchema } from "@/lib/schemas";

export async function saveCourse(_: FormState, formData: FormData): Promise<FormState> {
  return saveRow({
    table: "courses",
    schema: courseSchema,
    formData,
    path: "/cursos",
    // Curso concluído = 100% e data de conclusão (hoje, se não informada).
    prepare: (d) =>
      d.status === "concluido"
        ? { ...d, progress: 100, completed_at: d.completed_at ?? todayISO() }
        : d,
  });
}

export async function deleteCourse(formData: FormData) {
  await removeRow("courses", formData, "/cursos");
}
