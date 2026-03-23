import type { Metadata, Viewport } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { MainShiftProvider } from "@/context/MainShiftContext";

const notoThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  variable: "--font-noto-thai",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "LINE Calendar Mini App",
  description: "Manage your schedule directly within LINE",
};

export const viewport: Viewport = {
  themeColor: "#f8fafc",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={notoThai.variable} suppressHydrationWarning>
      <body className="antialiased bg-[#f8fafc] dark:bg-[#0f172a] text-[#1A1A1A] dark:text-white transition-colors duration-300">
        <ThemeProvider>
          <MainShiftProvider>
            {children}
          </MainShiftProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
