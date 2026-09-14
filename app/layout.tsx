import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NL Sites | Revisão de sites para pequenos negócios",
  description: "Revisão da página inicial do seu negócio, com até três correções confirmadas. Atendimento remoto no Brasil.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  );
}
