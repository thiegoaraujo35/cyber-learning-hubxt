"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DeleteButton({
  id,
  action,
  confirmText = "Excluir este item? Esta ação não pode ser desfeita.",
}: {
  id: string;
  action: (formData: FormData) => Promise<void>;
  confirmText?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(confirmText)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <Button type="submit" variant="ghost" size="sm" aria-label="Excluir" className="text-muted-foreground hover:text-destructive">
        <Trash2 />
      </Button>
    </form>
  );
}
