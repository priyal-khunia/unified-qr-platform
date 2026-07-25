import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "QRcraft — Generate & Track QR Codes",
  description: "Create, customize, and track QR codes for URLs, WhatsApp, UPI, business cards, and more. Built for creators and businesses.",
  keywords: "QR code generator, QR analytics, dynamic QR codes, custom QR",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <head>
        <link
          href="https://db.onlinewebfonts.com/c/04e6981992c0e2e7642af2074ebe3901?family=Helvetica+Now+Display+Bold"
          rel="stylesheet"
        />
      </head>
      <body
        style={{
          fontFamily: "var(--font-body)",
          color: "var(--color-text)",
          background: "var(--color-login-bg)",
          minHeight: "100vh",
        }}
      >
        {children}
      </body>
    </html>
  );
}
