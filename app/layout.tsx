import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import QueryProvider from "@/components/QueryProvider";
import RecurringInitializer from "@/components/RecurringInitializer";
import ToastLayer from "@/components/ToastLayer";

export const metadata: Metadata = {
  title: "Expense Tracker",
  description: "Track income, expenses, budgets, and accounts.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <RecurringInitializer />
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex min-h-screen flex-1 flex-col pb-16 md:pb-0">
              {children}
            </div>
          </div>
          <BottomNav />
          <ToastLayer />
        </QueryProvider>
      </body>
    </html>
  );
}
