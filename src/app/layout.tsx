import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Greentek Inventory",
  description: "Aplikasi Inventaris PT. Greentek Elektrikal Indonesia",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
