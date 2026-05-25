import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { NavBarWrapper } from "@/components/NavBarWrapper";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
});

export const metadata: Metadata = {
  title: "SisterQuest - Daily Learning Adventure",
  description: "Personalized daily learning for Pink and Rosie",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${nunito.variable} font-sans antialiased`}>
        <div className="min-h-screen flex flex-col">
          <NavBarWrapper />
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
export const metadata = {
  title: 'SisterQuest',
  icons: {
    icon: '/app-icon.png',
    shortcut: '/app-icon.png',
    apple: {
      url: '/app-icon.png',
      sizes: '180x180',
      type: 'image/png',
    },
  },
};