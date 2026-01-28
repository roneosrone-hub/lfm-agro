import "./globals.css";

export const metadata = {
  title: "LFM Agro",
  description: "Plataforma agro com mapa e grides",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
