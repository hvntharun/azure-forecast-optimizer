import { Cloud, Database } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-card py-4">
      <div className="container flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <span>Powered by</span>
        <Cloud className="h-4 w-4 text-primary" />
        <span className="font-semibold text-primary">Azure</span>
        <span>&</span>
        <Database className="h-4 w-4 text-accent" />
        <span className="font-semibold text-accent">Databricks</span>
      </div>
    </footer>
  );
}
