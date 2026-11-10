"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setMessage("Account registered successfully! You can now sign in.");
    }, 700);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 sm:py-24">
      <div className="bg-white border border-neutral-300 rounded-[12px] p-6 sm:p-8 shadow-sm space-y-6">
        <div className="text-center space-y-1">
          <h1 className="font-serif text-2xl font-bold text-neutral-900">
            Create an Account
          </h1>
          <p className="text-xs text-neutral-500">
            Save delivery addresses and access order history
          </p>
        </div>

        {message && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 rounded">
            {message}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <Input
            label="Full Name"
            required
            placeholder="e.g. Priya Sharma"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          />

          <Input
            label="Phone Number (10 digits)"
            required
            placeholder="e.g. 9876543210"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />

          <Input
            label="Email Address (Optional)"
            type="email"
            placeholder="e.g. priya@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />

          <Input
            label="Password"
            type="password"
            required
            placeholder="Minimum 6 characters"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />

          <Button type="submit" variant="primary" size="lg" isLoading={isLoading} className="w-full">
            Register Account
          </Button>
        </form>

        <div className="text-center text-xs text-neutral-600 border-t border-neutral-100 pt-4">
          Already have an account?{" "}
          <Link href="/account/login" className="font-semibold text-brand-primary hover:underline">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}
