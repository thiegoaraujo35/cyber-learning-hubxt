"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { removeRow, saveRow, type FormState } from "@/lib/crud";
import { pathItemSchema, pathSchema } from "@/lib/schemas";

export async function savePath(_: FormState, formData: FormData): Promise<FormState> {
  return saveRow({ table: "learning_paths", schema: pathSchema, formData, path: "/learning-paths" });
}

export async function deletePath(formData: FormData) {
  await removeRow("learning_paths", formData, "/learning-paths");
}

/** Adiciona um curso, certificação ou laboratório à trilha (valor do select: "tipo:uuid"). */
export async function addPathItem(_: FormState, formData: FormData): Promise<FormState> {
  const pathId = formData.get("path_id");
  const safePath =
    typeof pathId === "string" && z.uuid().safeParse(pathId).success
      ? `/learning-paths/${pathId}`
      : "/learning-paths";

  return saveRow({
    table: "path_items",
    schema: pathItemSchema,
    formData,
    path: safePath,
    prepare: (d) => {
      const [kind, ref_id] = d.item.split(":");
      return { path_id: d.path_id, kind, ref_id };
    },
  });
}

export async function removePathItem(formData: FormData) {
  await removeRow("path_items", formData, "/learning-paths");
  revalidatePath("/learning-paths/[id]", "page");
}
