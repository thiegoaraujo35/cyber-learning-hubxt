import { ExternalLink, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DeleteButton } from "@/components/crud/delete-button";
import type { BadgeTone } from "@/lib/types";

type Props = {
  title: string;
  subtitle?: string | null;
  badges?: { label: string; tone: BadgeTone }[];
  meta?: (string | null | undefined)[];
  /** 0–100 — mostra barra de progresso. */
  progress?: number;
  url?: { href: string; label: string } | null;
  notes?: string | null;
  onEdit: () => void;
  onDelete: () => void | Promise<void>;
  /** Conteúdo extra no rodapé (ex.: botão de ação rápida). */
  extra?: React.ReactNode;
};

export function ResourceItem({ title, subtitle, badges, meta, progress, url, notes, onEdit, onDelete, extra }: Props) {
  const metaLines = (meta ?? []).filter(Boolean) as string[];
  return (
    <Card className="flex flex-col gap-3 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-semibold">{title}</h3>
          {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        <div className="flex shrink-0 items-center">
          <Button type="button" variant="ghost" size="sm" aria-label="Editar" onClick={onEdit}>
            <Pencil />
          </Button>
          <DeleteButton onDelete={onDelete} />
        </div>
      </div>

      {badges && badges.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {badges.map((b) => (
            <Badge key={b.label} variant={b.tone}>
              {b.label}
            </Badge>
          ))}
        </div>
      )}

      {progress !== undefined && (
        <div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#ff8a3d] to-[#ff4d6d]"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
          <p className="mt-1 text-xs tabular-nums text-muted-foreground">{progress}%</p>
        </div>
      )}

      {metaLines.length > 0 && (
        <ul className="flex flex-col gap-0.5 text-xs text-muted-foreground">
          {metaLines.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      )}

      {notes && <p className="line-clamp-3 whitespace-pre-line text-sm text-muted-foreground">{notes}</p>}

      {extra}

      {url && (
        <a
          href={url.href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
        >
          <ExternalLink className="size-3.5" /> {url.label}
        </a>
      )}
    </Card>
  );
}
