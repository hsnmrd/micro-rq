import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "micro-rq Next App Router Example",
  description: "TanStack Query usage with micro-rq in a Next.js App Router app.",
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
