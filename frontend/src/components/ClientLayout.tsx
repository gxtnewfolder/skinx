"use client";
import { usePathname } from "next/navigation";
import Navigation from "./Navigation";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();
  
  // Don't show navigation on the homepage as it has its own integrated navigation
  const showNavigation = pathname !== "/";

  return (
    <>
      {showNavigation && <Navigation />}
      <div className={showNavigation ? "min-h-screen bg-slate-50" : ""}>
        {children}
      </div>
    </>
  );
}