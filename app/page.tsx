import Link from "next/link";
import { TOOLS, TOOL_GROUPS } from "@/src/data/tools";

export default function Home() {
  return (
    <div className="page">
      {/* Hero */}
      <section className="mb-10 md:mb-14">
        <div className="page-kicker">Grimorio del Director de Juego</div>
        <h1 className="font-[var(--font-display)] font-black leading-[1.05] text-gold-bright" style={{ fontSize: "clamp(40px, 11vw, 88px)" }}>
          ARCANUM
        </h1>
        <p className="page-sub mt-3">
          Tu caja de herramientas para dirigir y jugar D&amp;D 5e en español. Dados,
          combate, oráculo, generadores con IA y todo el compendio — pensado para usarse
          en la mesa, desde el móvil.
        </p>
        <div className="flex flex-wrap gap-3 mt-6">
          <Link href="/dice" className="btn btn-primary" data-tool="dice">
            Tirar dados
          </Link>
          <Link href="/tracker" className="btn btn-ghost" data-tool="tracker">
            Mesa de combate
          </Link>
        </div>
      </section>

      {/* Tool groups */}
      {TOOL_GROUPS.map((group) => (
        <section key={group.id} className="mb-10">
          <h2 className="font-mono text-[11px] tracking-[0.3em] uppercase text-ink-soft mb-4">
            {group.label}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {TOOLS.filter((t) => t.group === group.id).map((tool) => (
              <Link
                key={tool.id}
                href={`/${tool.id}`}
                data-tool={tool.id}
                className="card group flex items-start gap-4 transition-all hover:-translate-y-0.5 focus-ring"
              >
                <span
                  className="grid place-items-center w-12 h-12 shrink-0 rounded-lg text-2xl"
                  style={{
                    color: "var(--acc)",
                    background: "color-mix(in srgb, var(--acc) 12%, transparent)",
                    border: "1px solid color-mix(in srgb, var(--acc) 30%, transparent)",
                  }}
                >
                  {tool.icon}
                </span>
                <span className="min-w-0">
                  <span className="block font-[var(--font-title)] text-lg text-ink group-hover:text-[var(--acc)] transition-colors">
                    {tool.name}
                  </span>
                  <span className="block text-sm text-ink-dim mt-0.5 leading-snug">{tool.desc}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
