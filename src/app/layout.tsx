import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast"; // 1. 导入Toaster组件

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "鹿鹿通",
  description: "一个属于我们自己的社区",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster /> {/* 2. 在这里把它放进页面 */}
      </body>
    </html>
  );
}