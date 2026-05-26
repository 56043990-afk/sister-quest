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
  // 在这里定义图标，Next.js 会自动把它注入到 <head> 中
  icons: {
    icon: "https://i.imgur.com/vHqJv7P.png",
    apple: "https://i.imgur.com/vHqJv7P.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* 这里不需要手动写 <link>，Metadata 会自动生成它 */}
      </head>
      <body className={`${nunito.variable} font-sans antialiased`}>
        <div className="min-h-screen flex flex-col">
          <NavBarWrapper />
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}