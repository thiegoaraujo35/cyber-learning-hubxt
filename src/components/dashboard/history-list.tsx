"use client";

import { DeleteButton } from "@/components/crud/delete-button";
import { formatDate } from "@/lib/dates";

export type HistoryItem = {
  id: string;
  studied_on: string;
  minutes: number;
  note: string | null;
  courseTitle: string | null;
};

export function HistoryList({
  items,
  onDelete,
}: {
  items: HistoryItem[];
  onDelete: (id: string) => void | Promise<void>;
}) {
  if (items.length === 0) {
    return <p className="py-10 text-center text-sm text-muted-foreground">Nenhuma atividade registrada.</p>;
  }
  return (
    <ul className="divide-y divide-border">
      {items.map((s) => (
        <li key={s.id} className="flex items-center justify-between gap-2 py-2.5">
          <div className="min-w-0 text-sm">
            <p className="truncate font-medium">{s.courseTitle ?? "Estudo livre"}</p>
            <p className="truncate text-xs text-muted-foreground">
              {formatDate(s.studied_on)} · {s.minutes} min{s.note ? ` · ${s.note}` : ""}
            </p>
          </div>
          <DeleteButton onDelete={() => onDelete(s.id)} confirmText="Excluir este registro de estudo?" />
        </li>
      ))}
    </ul>
  );
}
