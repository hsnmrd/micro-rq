import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "tanstack-rest-query Docs",
  description: "Documentation for tanstack-rest-query: define REST resources once and generate TanStack Query configs.",
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
