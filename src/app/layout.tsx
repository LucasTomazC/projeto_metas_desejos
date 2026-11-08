import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ToastContext";

export const metadata: Metadata = {
  title: "Meus Sonhos & Metas | Planejador Financeiro",
  description: "Planeje suas metas, guarde dinheiro com inteligência e conquiste seus itens desejados.",
  manifest: "/manifest.webmanifest",
  applicationName: "Metas Jennyfer",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Metas",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#FAF8F5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="apple-touch-icon" href="/apple-icon" />
      </head>
      <body className="min-h-screen bg-cream-100 text-cream-900 selection:bg-coral-200">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
