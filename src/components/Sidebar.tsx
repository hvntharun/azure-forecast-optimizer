import { Home, Database, TrendingUp, ShoppingCart, FileText, ChevronLeft } from "lucide-react";
import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Data", url: "/data", icon: Database },
  { title: "Forecasting", url: "/forecast", icon: TrendingUp },
  { title: "Reservations", url: "/reservations", icon: ShoppingCart },
  { title: "Reports", url: "/reports", icon: FileText },
];

const recentItems = [
  "DSv5 Series Analysis",
  "Q4 2025 Forecast",
  "Reservation Export",
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "fixed left-0 top-16 bottom-0 bg-sidebar border-r transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-full flex-col">
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-2">
            {navItems.map((item) => (
              <NavLink
                key={item.url}
                to={item.url}
                end={item.url === "/"}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sidebar-foreground transition-colors",
                    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  )
                }
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span>{item.title}</span>}
              </NavLink>
            ))}
          </nav>

          {!collapsed && (
            <div className="mt-8 px-4">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/60">
                Recent
              </h3>
              <div className="space-y-1">
                {recentItems.map((item, index) => (
                  <div
                    key={index}
                    className="rounded-md px-2 py-1.5 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent/50 cursor-pointer transition-colors"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="border-t p-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="w-full"
          >
            <ChevronLeft
              className={cn(
                "h-5 w-5 transition-transform",
                collapsed && "rotate-180"
              )}
            />
          </Button>
        </div>
      </div>
    </aside>
  );
}
