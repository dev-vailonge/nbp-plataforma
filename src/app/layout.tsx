import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "No Blank Page",
    template: "%s · NBP",
  },
  description: "Ecossistema de aceleração para empreendedores de serviço.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
        />
      </head>
      <body className="min-h-screen bg-nbp-bg font-sans text-nbp-tx antialiased">
        {children}
      </body>
    </html>
  );
}
