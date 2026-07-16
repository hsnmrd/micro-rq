import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "micro-rq Docs",
  description: "Documentation for micro-rq: define REST resources once and generate TanStack Query configs.",
  icons: {
    icon: "/rtq.png",
    shortcut: "/rtq.png",
    apple: "/rtq.png",
  },
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
