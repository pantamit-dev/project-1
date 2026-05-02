import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: "AI Face Scan Check-in System",
  description: "ระบบลงทะเบียนเข้างานด้วยใบหน้า AI — AI Facial Recognition Check-in System",
  keywords: ["face recognition", "check-in", "attendance", "AI", "biometric"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className={`${manrope.className} antialiased`}>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
