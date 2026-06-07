import Link from "next/link";
import { PageHeader } from "@/src/components/PageHeader";
import { toolById } from "@/src/data/tools";

// Temporary landing for tools not yet ported. Keeps the whole app navigable
// (and on-brand per tool accent) while the remaining tools are built out.
export function ToolPlaceholder({ toolId }: { toolId: string }) {
  const tool = toolById(toolId);
  return (
    <div className="page" data-tool={toolId}>
      <PageHeader toolId={toolId} />
      <div className="card max-w-xl flex flex-col items-start gap-4">
        <span className="text-5xl" style={{ color: "var(--acc)" }}>{tool?.icon}</span>
        <div>
          <h2 className="font-[var(--font-title)] text-2xl text-ink mb-1">En construcción</h2>
          <p className="text-ink-dim">
            Esta herramienta se está portando desde la versión original con el mismo conjunto
            de funciones, ahora pensada para el móvil. Vuelve pronto.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/" className="btn btn-ghost">Volver al inicio</Link>
          <Link href="/dice" className="btn btn-acc">Probar los dados</Link>
        </div>
      </div>
    </div>
  );
}
