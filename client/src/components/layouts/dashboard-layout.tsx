import { ReactNode } from "react";
import { Sidebar } from "../ui/sidebar";
import { Navbar } from "../ui/navbar";

interface DashboardLayoutProps {
  children: ReactNode;
  role?: "admin" | "supplier" | "client";
}

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar role={role} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}