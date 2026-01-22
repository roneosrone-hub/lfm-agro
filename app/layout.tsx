export const metadata = {
  title: "LFM Agro 🌱🚜",
  description: "Plataforma LFM Agro"
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body style={{
        margin: 0,
        fontFamily: "Arial, sans-serif",
        background: "#0b0f14",
        color: "white"
      }}>
        {children}
      </body>
    </html>
  );
}
