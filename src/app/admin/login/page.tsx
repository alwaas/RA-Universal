"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Lock, Phone } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function AdminLoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("9999999999");
  const [password, setPassword] = useState("SuperSecureAdminPassword2026!");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Simulate admin login
    setTimeout(() => {
      setIsLoading(false);
      if (phone === "9999999999" && password === "SuperSecureAdminPassword2026!") {
        router.push("/admin");
      } else {
        setError("Invalid admin credentials. Please use the demo credentials provided below.");
      }
    }, 600);
  };

  return (
    <div className="max-w-md mx-auto py-16 sm:py-24 px-4">
      <div className="bg-white border border-neutral-300 rounded-[12px] p-6 sm:p-8 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-neutral-900 text-accent-gold rounded-full flex items-center justify-center mx-auto">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-neutral-900">
            Admin Portal Login
          </h1>
          <p className="text-xs text-neutral-500">
            Secure administrative control for catalogue and inventory
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleAdminLogin} className="space-y-4">
          <Input
            label="Admin Registered Phone"
            required
            placeholder="10-digit phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <Input
            label="Admin Password"
            type="password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button type="submit" variant="primary" size="lg" isLoading={isLoading} className="w-full">
            Enter Admin Dashboard
          </Button>
        </form>

        <div className="p-3 bg-brand-secondary border border-neutral-200 rounded-[6px] text-xs text-neutral-700 space-y-1">
          <p className="font-bold text-neutral-900">Demo Admin Credentials:</p>
          <p>Phone: <span className="font-mono font-semibold">9999999999</span></p>
          <p>Password: <span className="font-mono font-semibold">SuperSecureAdminPassword2026!</span></p>
        </div>
      </div>
    </div>
  );
}
