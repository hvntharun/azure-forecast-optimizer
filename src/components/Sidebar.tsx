import { Home, Database, TrendingUp, ShoppingCart, FileText, ChevronRight, Clock, BarChart3 } from "lucide-react";
import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Dashboard", url: "/dashboard/azure-vm", icon: BarChart3 },
  { title: "Data", url: "/data", icon: Database },
  { title: "Forecasting", url: "/forecast", icon: TrendingUp },
  { title: "Reservations", url: "/reservations", icon: ShoppingCart },
  { title: "Reports", url: "/reports", icon: FileText },
];

const recentItems = [
  { title: "DSv5 Series Analysis", time: "2m ago" },
  { title: "Q4 2025 Forecast", time: "1h ago" },
  { title: "Reservation Export", time: "3h ago" },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <TooltipProvider delayDuration={0}>
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 72 : 280 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="fixed left-0 top-16 bottom-0 bg-sidebar border-r border-sidebar-border z-40"
        style={{ boxShadow: 'var(--shadow-sm)' }}
      >
        <div className="flex h-full flex-col">
          {/* Main Navigation */}
          <div className="flex-1 overflow-y-auto py-6">
            <nav className="space-y-2 px-3">
              {navItems.map((item) => (
                <Tooltip key={item.url}>
                  <TooltipTrigger asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                    >
                      {({ isActive }) => (
                        <div 
                          className={cn(
                            "flex items-center gap-3 rounded-xl px-3 py-3 text-sidebar-foreground transition-all duration-200 group relative overflow-hidden",
                            "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:scale-105",
                            isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                          )}
                          style={isActive ? { boxShadow: '0 0 20px hsl(var(--primary) / 0.15)' } : undefined}
                        >
                          <item.icon className={cn(
                            "h-5 w-5 flex-shrink-0 transition-transform duration-200",
                            "group-hover:scale-110",
                            isActive && "text-sidebar-primary"
                          )} />
                          <AnimatePresence>
                            {!collapsed && (
                              <motion.span
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.2 }}
                                className="whitespace-nowrap"
                              >
                                {item.title}
                              </motion.span>
                            )}
                          </AnimatePresence>
                          {isActive && (
                            <motion.div
                              layoutId="activeIndicator"
                              className="absolute left-0 top-0 bottom-0 w-1 bg-sidebar-primary rounded-r-full"
                              transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            />
                          )}
                        </div>
                      )}
                    </NavLink>
                  </TooltipTrigger>
                  {collapsed && (
                    <TooltipContent side="right" className="font-medium">
                      {item.title}
                    </TooltipContent>
                  )}
                </Tooltip>
              ))}
            </nav>

            {/* Recent Items */}
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-8 px-3"
                >
                  <div className="flex items-center gap-2 mb-3 px-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Recent
                    </h3>
                  </div>
                  <div className="space-y-1">
                    {recentItems.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="rounded-lg px-3 py-2 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground cursor-pointer transition-all duration-200 group"
                      >
                        <div className="font-medium group-hover:text-sidebar-accent-foreground transition-colors">
                          {item.title}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">{item.time}</div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Toggle Button */}
          <div className="border-t border-sidebar-border p-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCollapsed(!collapsed)}
                  className={cn(
                    "w-full h-10 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200",
                    !collapsed && "justify-end"
                  )}
                >
                  <motion.div
                    animate={{ rotate: collapsed ? 0 : 180 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </motion.div>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                {collapsed ? "Expand sidebar" : "Collapse sidebar"}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </motion.aside>
    </TooltipProvider>
  );
}
