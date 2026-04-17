import type { Metadata, Viewport } from "next";
import { Cinzel, Noto_Sans_SC, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const notoSans = Noto_Sans_SC({
  variable: "--font-noto",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Bôn Làng",
  description: "Bàn chiến thuật bang hội - Nghịch Thuỷ Hàn",
  icons: {
    icon: "/bonlang.png",
    apple: "/icons/icon-192.png",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Bôn Làng",
  },
  openGraph: {
    title: "Bôn Làng - Chiến Thuật Bang",
    description: "cũng hơi hơi chuyên nghiệp",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#080810",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${cinzel.variable} ${notoSans.variable} ${jetbrainsMono.variable}`}>
      <body className="h-screen overflow-hidden">
        {children}
      </body>
    </html>
  );
}
