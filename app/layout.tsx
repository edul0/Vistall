import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vistall | Sites, revisões e sistemas web",
  description: "Estúdio independente para revisão de sites, criação de páginas e sistemas web sob medida. Atendimento remoto no Brasil.",
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
      <head>
        <meta name="google-site-verification" content="NzbgppRpooF1QSAHP1jVhn_8Oaoev9mSboFGny4C5Wk" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}


