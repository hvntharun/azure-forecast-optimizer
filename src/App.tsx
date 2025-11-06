import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, HashRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { EligibilityProvider } from "./contexts/EligibilityContext";
import { Layout } from "@/components/Layout";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import DataManagement from "./pages/DataManagement";
import Forecasting from "./pages/Forecasting";
import ClassificationDetail from "./pages/ClassificationDetail";
import Reservations from "./pages/Reservations";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Use HashRouter in production (Databricks static) to avoid 404 on deep refresh
const RouterImpl: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isProd = import.meta.env.PROD;
  return isProd ? <HashRouter>{children}</HashRouter> : <BrowserRouter>{children}</BrowserRouter>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark">
      <EligibilityProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <RouterImpl>
            <Layout>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/dashboard/azure-vm" element={<Dashboard />} />
                <Route path="/dashboard/databricks" element={<Dashboard />} />
                <Route path="/dashboard/azure-storage" element={<Dashboard />} />
                <Route path="/data" element={<DataManagement />} />
                <Route path="/forecast" element={<Forecasting />} />
                <Route path="/classification/:cardId" element={<ClassificationDetail />} />
                <Route path="/classification-detail" element={<ClassificationDetail />} />
                <Route path="/reservations" element={<Reservations />} />
                <Route path="/reports" element={<Reports />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </RouterImpl>
        </TooltipProvider>
      </EligibilityProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
