import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "LFM Agro",
  description: "Plataforma agrícola inteligente.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br">
      <body>{children}</body>
    </html>
  );
}
