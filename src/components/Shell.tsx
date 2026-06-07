"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, Settings } from "lucide-react";
import { TOOLS, TOOL_GROUPS } from "@/src/data/tools";

const BOTTOM_NAV = [
  { id: "home", href: "/", label: "Inicio", icon: "✦" },
  { id: "dice", href: "/dice", label: "Dados", icon: "⚂" },
  { id: "tracker", href: "/tracker", label: "Combate", icon: "⚜" },
  { id: "oracle", href: "/oracle", label: "Oráculo", icon: "❂" },
];

function currentToolId(pathname: string): string {
  if (pathname === "/") return "home";
  return pathname.split("/")[1] || "home";
}

function NavList({ activeId, onNavigate }: { activeId: string; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-6">
      {TOOL_GROUPS.map((group) => (
        <div key={group.id}>
          <div className="px-3 mb-2 font-mono text-[10px] tracking-[0.3em] uppercase text-ink-soft">
            {group.label}
          </div>
          <ul className="flex flex-col gap-0.5">
            {TOOLS.filter((t) => t.group === group.id).map((tool) => {
              const active = tool.id === activeId;
              return (
                <li key={tool.id} data-tool={tool.id}>
                  <Link
                    href={`/${tool.id}`}
                    onClick={onNavigate}
                    className="flex items-center gap-3 rounded-md px-3 py-2.5 min-h-[44px] transition-colors focus-ring"
                    style={{
                      color: active ? "var(--acc)" : "var(--ink-dim)",
                      background: active ? "color-mix(in srgb, var(--acc) 10%, transparent)" : "transparent",
                      borderLeft: active ? "2px solid var(--acc)" : "2px solid transparent",
                    }}
                  >
                    <span className="text-xl leading-none w-6 text-center" style={{ color: "var(--acc)" }}>
                      {tool.icon}
                    </span>
                    <span className="font-[var(--font-title)] text-[15px]">{tool.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-3 focus-ring rounded-md">
      <span
        className="grid place-items-center w-9 h-9 rotate-45 border"
        style={{ borderColor: "var(--gold-deep)", background: "radial-gradient(circle, rgba(201,165,90,0.15), transparent 70%)" }}
      >
        <span className="-rotate-45 text-gold-bright text-lg leading-none">✶</span>
      </span>
      <span className="leading-none">
        <span className="block font-[var(--font-display)] font-bold text-[20px] tracking-[0.18em] text-gold-bright">
          ARCANUM
        </span>
        <span className="block font-mono text-[9px] tracking-[0.4em] uppercase text-ink-soft mt-1">
          Grimorio del DM
        </span>
      </span>
    </Link>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const activeId = currentToolId(pathname);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Close the drawer on route change — adjust state during render (React's
  // "store previous value" pattern) instead of a setState-in-effect.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setDrawerOpen(false);
  }

  // Lock body scroll while drawer is open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  return (
    <div className="relative z-10 md:grid md:grid-cols-[260px_1fr] min-h-screen" data-tool={activeId}>
      {/* ===== Desktop sidebar ===== */}
      <aside
        className="hidden md:flex md:flex-col gap-6 sticky top-0 h-screen overflow-y-auto py-8 px-4 border-r"
        style={{ borderColor: "var(--line)", background: "linear-gradient(180deg, rgba(15,10,28,0.95), rgba(7,5,13,0.95))" }}
      >
        <div className="px-3 pb-6 border-b" style={{ borderColor: "var(--line)" }}>
          <Brand />
        </div>
        <NavList activeId={activeId} />
        <div className="mt-auto px-3 pt-4 border-t" style={{ borderColor: "var(--line)" }}>
          <Link href="/settings" className="flex items-center gap-2 text-ink-soft hover:text-ink text-sm focus-ring rounded-md py-2">
            <Settings size={16} /> Ajustes de IA
          </Link>
        </div>
      </aside>

      {/* ===== Mobile top bar ===== */}
      <header
        className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 h-14 border-b backdrop-blur"
        style={{ borderColor: "var(--line)", background: "rgba(10,7,9,0.82)" }}
      >
        <Brand />
        <button
          aria-label="Abrir menú"
          onClick={() => setDrawerOpen(true)}
          className="grid place-items-center w-11 h-11 rounded-md text-ink focus-ring"
        >
          <Menu size={22} />
        </button>
      </header>

      {/* ===== Mobile drawer ===== */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <button
            aria-label="Cerrar menú"
            className="absolute inset-0 bg-black/60"
            onClick={() => setDrawerOpen(false)}
          />
          <div
            className="absolute right-0 top-0 h-full w-[84%] max-w-[320px] overflow-y-auto py-6 px-4 border-l shadow-2xl"
            style={{ borderColor: "var(--line)", background: "linear-gradient(180deg, var(--bg-deep), var(--bg-void))" }}
          >
            <div className="flex items-center justify-between px-3 pb-5 mb-4 border-b" style={{ borderColor: "var(--line)" }}>
              <Brand />
              <button aria-label="Cerrar" onClick={() => setDrawerOpen(false)} className="grid place-items-center w-11 h-11 text-ink-dim focus-ring rounded-md">
                <X size={20} />
              </button>
            </div>
            <NavList activeId={activeId} onNavigate={() => setDrawerOpen(false)} />
            <div className="mt-6 px-3 pt-4 border-t" style={{ borderColor: "var(--line)" }}>
              <Link href="/settings" className="flex items-center gap-2 text-ink-soft hover:text-ink text-sm py-2">
                <Settings size={16} /> Ajustes de IA
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ===== Main content ===== */}
      <main className="min-w-0">{children}</main>

      {/* ===== Mobile bottom nav ===== */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-30 flex items-stretch border-t backdrop-blur"
        style={{
          borderColor: "var(--line)",
          background: "rgba(10,7,9,0.92)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {BOTTOM_NAV.map((item) => {
          const active = item.id === activeId;
          return (
            <Link
              key={item.id}
              href={item.href}
              data-tool={item.id === "home" ? undefined : item.id}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 min-h-[56px] focus-ring"
              style={{ color: active ? "var(--acc)" : "var(--ink-soft)" }}
            >
              <span className="text-xl leading-none">{item.icon}</span>
              <span className="font-mono text-[10px] tracking-wide">{item.label}</span>
            </Link>
          );
        })}
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex-1 flex flex-col items-center justify-center gap-0.5 min-h-[56px] text-ink-soft focus-ring"
          aria-label="Más herramientas"
        >
          <Menu size={20} />
          <span className="font-mono text-[10px] tracking-wide">Más</span>
        </button>
      </nav>
    </div>
  );
}
