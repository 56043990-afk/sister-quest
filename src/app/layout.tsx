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
  description: '我的专属任务网站',
  icons: {
    // 强制把所有图标入口都指向这个新的名字
    icon: '/brand-icon-2026.png',
    shortcut: '/brand-icon-2026.png',
    apple: '/brand-icon-2026.png',
  },
  // 增加这一行，告诉浏览器忽略任何旧的清单文件
  manifest: '/manifest.json', // 如果你没有这个文件，就删掉这行，或者确保没有旧的 manifest 指向旧图标
};// src/app/layout.tsx

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh">
      <head>
        {/* 强制在这里指定图标路径，这是最底层的 HTML 语法 */}
        <link rel="shortcut icon" href="/brand-icon-2026.png" />
        <link rel="apple-touch-icon" href="/brand-icon-2026.png" />
      </head>
      <body>{children}</body>
    </html>
  );
}<link rel="shortcut icon" href="/brand-icon-2026.png" />
<link rel="shortcut icon" href="/brand-icon-2026.png" />