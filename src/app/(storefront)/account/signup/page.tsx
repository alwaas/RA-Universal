"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { AlertCircle, CheckCircle2 } from "lucide-react";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/account/profile";

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [successMessage, setSuccessMessage] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    setFieldErrors({});
    setSuccessMessage("");

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.status === 201 && data.success) {
        setSuccessMessage("Account created successfully! Redirecting to your profile...");
        setTimeout(() => {
          router.push(redirectPath);
          router.refresh();
        }, 600);
      } else {
        if (data.error?.details) {
          setFieldErrors(data.error.details);
        }
        setErrorMessage(data.error?.message || "Failed to register account.");
      }
    } catch {
      setErrorMessage("Network error during registration. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white border border-neutral-300 rounded-[12px] p-6 sm:p-8 shadow-sm space-y-6">
      <div className="text-center space-y-1">
        <h1 className="font-serif text-2xl font-bold text-neutral-900">
          Create an Account
        </h1>
        <p className="text-xs text-neutral-500">
          Save delivery addresses and access order history
        </p>
      </div>

      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-800 rounded-[8px] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 rounded-[8px] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSignup} className="space-y-4">
        <Input
          label="Full Name"
          required
          placeholder="e.g. Priya Sharma"
          value={formData.fullName}
          error={fieldErrors.fullName?.[0]}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
        />

        <Input
          label="Phone Number (10 digits)"
          required
          placeholder="e.g. 7388553867"
          value={formData.phone}
          error={fieldErrors.phone?.[0]}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />

        <Input
          label="Email Address (Optional)"
          type="email"
          placeholder="e.g. priya@example.com"
          value={formData.email}
          error={fieldErrors.email?.[0]}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />

        <Input
          label="Password"
          type="password"
          required
          placeholder="Minimum 6 characters"
          value={formData.password}
          error={fieldErrors.password?.[0]}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          className="w-full"
        >
          Register Account
        </Button>
      </form>

      <div className="text-center text-xs text-neutral-600 border-t border-neutral-100 pt-4">
        Already have an account?{" "}
        <Link
          href={`/account/login${redirectPath ? `?redirect=${encodeURIComponent(redirectPath)}` : ""}`}
          className="font-semibold text-brand-primary hover:underline"
        >
          Sign In here
        </Link>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-16 sm:py-24">
      <Suspense fallback={<div className="h-64 bg-white rounded animate-pulse" />}>
        <SignupForm />
      </Suspense>
    </div>
  );
}
