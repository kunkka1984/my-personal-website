import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "kunkka 科技生活",
  description: "个人主页与自制应用展示",
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
