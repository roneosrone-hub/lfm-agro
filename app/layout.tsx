import "./globals.css";

export const metadata = {
  title: "LFM Agro",
  description: "Plataforma LFM Agro",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br">
      <body>
        <div className="lfm-shell">
          <div className="lfm-wrap">{children}</div>
        </div>
      </body>
    </html>
  );
}
