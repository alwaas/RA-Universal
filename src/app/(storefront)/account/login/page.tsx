"use client";

import React, { useState } from "react";
import Link from "next/link";
import { User, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Mock login simulation for demo phase
    setTimeout(() => {
      setIsLoading(false);
      setMessage("Demo login successful! Customer accounts module is active.");
    }, 700);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 sm:py-24">
      <div className="bg-white border border-neutral-300 rounded-[12px] p-6 sm:p-8 shadow-sm space-y-6">
        <div className="text-center space-y-1">
          <h1 className="font-serif text-2xl font-bold text-neutral-900">
            Welcome Back
          </h1>
          <p className="text-xs text-neutral-500">
            Sign in to access your saved profile and order tracking
          </p>
        </div>

        {message && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 rounded">
            {message}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            label="Phone Number or Email"
            required
            placeholder="e.g. 9876543210 or user@example.com"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />

          <Input
            label="Password"
            type="password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button type="submit" variant="primary" size="lg" isLoading={isLoading} className="w-full">
            Sign In
          </Button>
        </form>

        <div className="text-center text-xs text-neutral-600 border-t border-neutral-100 pt-4">
          Don&apos;t have an account?{" "}
          <Link href="/account/signup" className="font-semibold text-brand-primary hover:underline">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
}
