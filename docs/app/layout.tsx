import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "micro-rq Docs",
  description: "Documentation for micro-rq, a typed REST helper for TanStack Query.",
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
