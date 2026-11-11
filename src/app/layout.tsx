import type { Metadata } from "next";
import "./globals.css";
import { ToastContainer } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: "RA Universal | Handcrafted Scarves, Dupattas & Gamchas",
  description:
    "Authentic Indian ethnic handloom textiles. Shop breathable Men's Cotton Gamchas and luxurious Women's Dupattas & Scarves directly from regional weaver clusters.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col font-sans antialiased text-neutral-900 bg-brand-secondary">
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}
