// src/components/shell/AppShell.tsx
"use client";

import { usePathname } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { TopNav } from "./TopNav";
import { BottomNav } from "./BottomNav";
import { type UserRole } from "@/lib/nav";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const { data: session, isPending } = useSession();

  const isAuthenticated = !!session?.user;
  const user = session?.user
    ? {
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        role: (session.user as { role?: string }).role as UserRole | null,
      }
    : null;

  const handleSignOut = async () => {
    await signOut();
    // Clear any role cookies
    document.cookie = "user_role=; path=/; max-age=0";
    window.location.href = "/";
  };

  // Check if we're on a page that manages its own minimal header (dashboard pages in full-screen mode)
  // For now, all pages use the AppShell navigation
  const isDashboardPage = pathname.startsWith("/dashboard");
  const isGamePage = pathname.startsWith("/games/") && pathname !== "/games";

  // Show loading skeleton for nav if session is pending
  const showSkeleton = isPending;

  return (
    <>
      {/* Top Navigation - Always present */}
      <TopNav
        user={user}
        isAuthenticated={isAuthenticated}
        onSignOut={handleSignOut}
      />

      {/* Main Content */}
      <main className="flex-1 pb-16 md:pb-0">
        {children}
      </main>

      {/* Bottom Navigation - Mobile only, not on landing page */}
      <BottomNav user={user} isAuthenticated={isAuthenticated} />
    </>
  );
}

/**
 * Page wrapper that handles dashboard-specific styling
 * Use this in dashboard pages to get consistent padding for bottom nav
 */
export function DashboardPageWrapper({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`min-h-[calc(100vh-4rem)] ${className}`}>
      {children}
    </div>
  );
}
