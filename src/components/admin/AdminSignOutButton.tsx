"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function AdminSignOutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch {
      router.push("/admin/login");
    }
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isLoading}
      aria-label="Sign Out of Admin Portal"
      className="flex items-center gap-2 text-xs text-neutral-400 hover:text-white transition-colors w-full text-left pt-2 border-t border-neutral-800"
    >
      <LogOut className="w-4 h-4" />
      <span>{isLoading ? "Signing out..." : "Sign Out of Admin"}</span>
    </button>
  );
}

