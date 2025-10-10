import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { Footer } from "./Footer";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const validRoutes = ['/', '/dashboard/azure-vm', '/dashboard/databricks', '/dashboard/azure-storage', '/data', '/forecast', '/reservations', '/reports'];
  const isValidRoute = validRoutes.includes(location.pathname);
  const isLandingPage = location.pathname === '/';

  if (!isValidRoute) {
    return <>{children}</>;
  }

  if (isLandingPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen w-full">
      <Header />
      <Sidebar />
      <main className="ml-[72px] mt-16 min-h-[calc(100vh-4rem)] transition-all duration-300">
        <div className="px-6 py-8 max-w-[1600px] mx-auto">{children}</div>
        <Footer />
      </main>
    </div>
  );
}
