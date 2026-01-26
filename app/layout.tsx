export const metadata = {
  title: "LFM Agro",
  description: "Plataforma digital para produtor rural",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br">
      <body>{children}</body>
    </html>
  );
}
