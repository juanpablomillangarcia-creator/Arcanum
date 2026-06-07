import { toolById } from "@/src/data/tools";

export function PageHeader({ toolId, kicker }: { toolId: string; kicker?: string }) {
  const tool = toolById(toolId);
  if (!tool) return null;
  return (
    <header className="mb-6">
      <div className="page-kicker">{kicker ?? tool.icon + "  " + tool.group}</div>
      <h1 className="page-title">{tool.name}</h1>
      <p className="page-sub">{tool.desc}</p>
    </header>
  );
}
