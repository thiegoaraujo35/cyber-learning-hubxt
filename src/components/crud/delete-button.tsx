"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DeleteButton({
  onDelete,
  confirmText = "Excluir este item? Esta ação não pode ser desfeita.",
}: {
  onDelete: () => void | Promise<void>;
  confirmText?: string;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      aria-label="Excluir"
      className="text-muted-foreground hover:text-destructive"
      onClick={() => {
        if (confirm(confirmText)) void onDelete();
      }}
    >
      <Trash2 />
    </Button>
  );
}
