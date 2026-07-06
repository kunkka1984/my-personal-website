import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://198475.xyz"),
  title: {
    default: "kunkka 科技生活 — 极简实用的自制工具",
    template: "%s | kunkka 科技生活",
  },
  description:
    "kunkka 的个人主页：分享自制的实用小工具——A股打新提醒、胡伯曼随机番茄钟等，用 AI 打造极简、优雅且直觉式的数字体验。",
  keywords: ["A股打新提醒", "新股申购日历", "番茄钟", "专注力工具", "AI 自制应用", "kunkka"],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "https://198475.xyz",
    siteName: "kunkka 科技生活",
    title: "kunkka 科技生活 — 极简实用的自制工具",
    description:
      "自制实用小工具：A股打新提醒、胡伯曼随机番茄钟等，用 AI 打造极简、优雅且直觉式的数字体验。",
    locale: "zh_CN",
    images: [{ url: "/images/ipo.jpg", width: 1200, height: 800, alt: "kunkka 科技生活" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "kunkka 科技生活 — 极简实用的自制工具",
    description: "自制实用小工具：A股打新提醒、胡伯曼随机番茄钟等。",
    images: ["/images/ipo.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh">
      <body className={`${inter.variable} font-sans antialiased`}>
        <nav className="glass-nav fixed top-0 w-full z-50 transition-all duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-12 text-xs font-medium tracking-wide text-gray-800">
              <a href="#" className="hover:text-black transition-colors">Home</a>
              <div className="flex space-x-8">
                <a href="#apps" className="hover:text-black transition-colors">Apps</a>
                <a href="https://github.com/kunkka1984" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors">GitHub</a>
                <a href="mailto:78521299@qq.com" className="hover:text-black transition-colors">Email</a>
              </div>
            </div>
          </div>
        </nav>
        {children}
        <footer className="bg-[#f5f5f7] py-8 text-center text-xs text-gray-500 mt-20">
          <div className="max-w-4xl mx-auto flex flex-col items-center gap-4">
            <div className="flex space-x-6 text-sm">
              <a href="https://github.com/kunkka1984" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors">GitHub</a>
              <a href="mailto:78521299@qq.com" className="hover:text-black transition-colors">Contact Email</a>
            </div>
            <p>Copyright © {new Date().getFullYear()} kunkka 科技生活. 保留所有权利。</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
