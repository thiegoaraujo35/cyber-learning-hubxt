"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ShieldCheck, X } from "lucide-react";
import { useState } from "react";
import { NAV_ITEMS } from "@/config/nav";
import { cn } from "@/lib/utils";

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1 px-3">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              active
                ? "bg-primary/10 text-primary shadow-[inset_2px_0_0_0_var(--primary)]"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-2 px-6 py-5">
      <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#ff8a3d] to-[#ff4d6d]">
        <ShieldCheck className="size-4 text-white" />
      </span>
      <span className="text-sm font-bold tracking-tight">Cyber Learning <span className="text-gradient">Hub</span></span>
    </div>
  );
}

export function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop */}
      <aside className="hidden w-64 shrink-0 border-r border-border bg-sidebar md:block">
        <div className="sticky top-0 flex h-screen flex-col overflow-y-auto">
          <Brand />
          <NavList />
        </div>
      </aside>

      {/* Mobile */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-sidebar px-4 py-3 md:hidden">
        <span className="text-sm font-semibold">Cyber Learning Hub</span>
        <button
          type="button"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg p-2 hover:bg-muted"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>
      {open && (
        <div className="fixed inset-0 top-[53px] z-20 overflow-y-auto bg-sidebar py-4 md:hidden">
          <NavList onNavigate={() => setOpen(false)} />
        </div>
      )}
    </>
  );
}
