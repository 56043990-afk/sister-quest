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
  // 彻底斩断网络旧链接，强制指向你存放在 public/ 文件夹下的本地新 logo.png
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
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