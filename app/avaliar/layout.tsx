import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Autoavaliação gratuita da página inicial | Vistal",
  description: "Cinco perguntas para conferir a clareza, a leitura no celular e o caminho até o contato no site do seu negócio.",
};

export default function AssessmentLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}


