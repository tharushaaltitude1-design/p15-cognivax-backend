import logo from "@/assets/cognivax-logo.webp";
import favicon from "@/assets/favicon.png";

export function Logo({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <img
        src={collapsed ? favicon : logo}
        alt="Cognivax"
        className={
          collapsed ? "h-12 w-12 shrink-0 object-contain" : "h-18 w-auto shrink-0 object-contain"
        }
      />
    </div>
  );
}
