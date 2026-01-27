import "./globals.css";

export const metadata = {
  title: "LFM Agro",
  description: "Plataforma de monitoramento agrícola",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head />
      <body
        style={{
          margin: 0,
          padding: 0,
          background: "#0b0f12",
          color: "white",
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        {children}
      </body>
    </html>
  );
}
