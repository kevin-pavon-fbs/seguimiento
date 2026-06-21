import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Seguimiento Leads — 12 Toques",
  description: "Sistema de seguimiento de leads con kanban de 12 columnas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body style={{ margin: 0, padding: 0, background: '#0f0f1a' }}>{children}</body>
    </html>
  );
}
