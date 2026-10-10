import type { ModuleKey } from "@/types/domain";
import { ModuleList } from "./ModuleList";
import { ModuleForm } from "./ModuleForm";
import { ModuleDetail } from "./ModuleDetail";
export function ModulePage({
  module,
  mode,
  id,
}: {
  module: ModuleKey;
  mode: "list" | "new" | "edit" | "detail";
  id?: string;
}) {
  if (mode === "list") return <ModuleList module={module} />;
  if (mode === "detail" && id) return <ModuleDetail module={module} id={id} />;
  return <ModuleForm module={module} {...(id ? { id } : {})} />;
}
