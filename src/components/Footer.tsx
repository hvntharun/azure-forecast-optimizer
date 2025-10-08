import { Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/50 py-8 mt-12">
      <div className="flex items-center justify-center gap-3 text-sm">
        <Sparkles className="h-4 w-4 text-primary" />
        <span className="text-muted-foreground">Powered by</span>
        <span className="font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Azure
        </span>
        <span className="text-muted-foreground">&</span>
        <span className="font-bold text-accent">Databricks</span>
      </div>
      <div className="text-center mt-2">
        <p className="text-xs text-muted-foreground">
          © 2025 Azure Forecast Optimizer. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
