import type { Metadata } from "next";
import { Barlow_Condensed, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { PLATFORM_ADMIN_METADATA } from "@/constants/platformAdmin.constant";
import "./globals.css";

const workbenchBody = IBM_Plex_Sans({
  variable: "--font-workbench-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const workbenchDisplay = Barlow_Condensed({
  variable: "--font-workbench-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const workbenchMono = IBM_Plex_Mono({
  variable: "--font-workbench-mono",
  subsets: ["latin"],
  weight: ["500", "600"],
});

export const metadata: Metadata = {
  title: PLATFORM_ADMIN_METADATA.title,
  description: PLATFORM_ADMIN_METADATA.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${workbenchBody.variable} ${workbenchDisplay.variable} ${workbenchMono.variable} antialiased`}>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
