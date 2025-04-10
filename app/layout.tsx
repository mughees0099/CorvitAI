import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Corvit AI",
  description: "Created for corvit",
  generator: "corvit.ai",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
