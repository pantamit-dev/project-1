import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "react-hot-toast";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: "AI Face Scan Check-in System | ระบบลงเวลาด้วยใบหน้า",
  description:
    "ระบบลงเวลาเข้า-ออกงานด้วยเทคโนโลยี AI จดจำใบหน้า พร้อมแดชบอร์ดสำหรับผู้ดูแลระบบ",
  keywords: ["face recognition", "check-in", "attendance", "AI", "biometric"],
  authors: [{ name: "pantamit-dev" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className={`${manrope.variable} font-manrope antialiased`}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            className: "toast-custom",
            duration: 4000,
            style: {
              background: "var(--surface-container-lowest)",
              color: "var(--on-surface)",
              border: "1px solid var(--outline-variant)",
            },
            success: {
              iconTheme: {
                primary: "var(--success-green)",
                secondary: "#ffffff",
              },
            },
            error: {
              iconTheme: {
                primary: "var(--error-red)",
                secondary: "#ffffff",
              },
            },
          }}
        />
        <SpeedInsights />
      </body>
    </html>
  );
}
