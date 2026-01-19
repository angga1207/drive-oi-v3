import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Drive Ogan Ilir",
  description: "Drive Ogan Ilir hadir sebagai solusi digital yang memudahkan dalam menyimpan dan berbagi file secara daring. Lebih praktis, aman, dan dapat diakses kapan saja.",
  icons: {
    icon: '/favicon.png',
  },

};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
