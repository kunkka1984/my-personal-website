import type { Metadata } from "next";
import Link from "next/link";
import { Inter } from "next/font/google";
import NavBar from "@/components/NavBar";
import CopyEmail from "@/components/CopyEmail";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://chengbenguan.com"),
  title: {
    default: "成本观 — 房地产全成本拆解与造价实战",
    template: "%s | 成本观",
  },
  description:
    "成本观：18年房地产甲方成本管理经验，用真实项目台账拆解全成本——地价构成、征地拆迁、建安工程、土地增值税清算，每笔钱怎么计取、能不能抵税。附自制小工具：A股打新提醒、随机番茄钟。",
  keywords: [
    "房地产成本",
    "全成本拆解",
    "土地增值税清算",
    "拿地测算",
    "工程造价",
    "成本管理",
    "土地征用及拆迁补偿费",
    "A股打新提醒",
    "kunkka",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "https://chengbenguan.com",
    siteName: "成本观",
    title: "成本观 — 房地产全成本拆解与造价实战",
    description:
      "18年房地产甲方成本管理经验，用真实项目台账拆解全成本：每笔钱怎么构成、怎么计取、能不能抵税。",
    locale: "zh_CN",
    images: [{ url: "/images/ipo.jpg", width: 1200, height: 800, alt: "成本观" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "成本观 — 房地产全成本拆解与造价实战",
    description:
      "18年房地产甲方成本管理经验，用真实项目台账拆解全成本。",
    images: ["/images/ipo.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    other: {
      "baidu-site-verification": "codeva-J5Bo1SfpZ2",
    },
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
        <NavBar />
        {children}
        <footer className="bg-[#f5f5f7] py-8 text-center text-xs text-gray-500 mt-20">
          <div className="max-w-4xl mx-auto flex flex-col items-center gap-4 px-4">
            <div className="flex space-x-6 text-sm">
              <Link href="/cost" className="hover:text-black transition-colors">
                全成本拆解
              </Link>
              <Link href="/about" className="hover:text-black transition-colors">
                关于我
              </Link>
              <a
                href="https://github.com/kunkka1984"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-black transition-colors"
              >
                GitHub
              </a>
              <CopyEmail className="hover:text-black transition-colors cursor-pointer" />
            </div>
            <p className="max-w-2xl leading-relaxed">
              本站文章为个人从业经验复盘，项目信息已脱敏，不构成投资或税务建议。
            </p>
            <p>Copyright © {new Date().getFullYear()} 成本观 chengbenguan.com. 保留所有权利。</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
