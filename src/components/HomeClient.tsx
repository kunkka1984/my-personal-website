"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import IPOReminderWidget from "@/components/IPOReminderWidget";
import type { ArticleMeta } from "@/lib/articles";

const apps = [
  {
    name: "中国A股打新提醒",
    tagline: "不错过每一次打新机会",
    description:
      "基于 AKShare 数据接口开发的自动化工具，抓取新股申购信息，为你提供及时的打新提醒与策略辅助。",
    image: "/images/ipo.jpg",
    link: "https://github.com/kunkka1984/A-share-IPO-reminder",
  },
  {
    name: "胡伯曼随机番茄钟",
    tagline: "反脆弱的专注力",
    description:
      "基于斯坦福 Huberman 教授的研究，引入随机性的极简番茄钟，让你在不确定的节奏中高度沉浸当下。",
    image: "/images/pomodoro.jpg",
    link: "/pomodoro-app/index.html",
  },
];

export default function HomeClient({ articles }: { articles: ArticleMeta[] }) {
  return (
    <main className="min-h-screen pt-12">
      {/* Hero */}
      <section className="min-h-[72vh] flex flex-col justify-center items-center text-center px-4 relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="z-10 max-w-3xl"
        >
          <p className="text-sm md:text-base font-medium text-[#0071e3] tracking-widest mb-5">
            18 年房地产甲方成本管理 · 一级造价工程师
          </p>
          <h1 className="text-5xl md:text-7xl font-semibold tracking-tight text-[#1d1d1f] mb-6">
            成本观
          </h1>
          <p className="text-xl md:text-2xl text-[#6e6e73] font-medium tracking-tight mb-4">
            房地产全成本，一笔一笔看得见。
          </p>
          <p className="text-base text-[#86868b] max-w-xl mx-auto leading-relaxed mb-10">
            用真实项目的成本台账讲透每一笔钱：怎么构成、怎么计取、能不能抵税。
            不写教科书定义，只写实战数字、踩过的坑和甲方视角的判断。
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/cost"
              className="px-7 py-3 bg-[#0071e3] text-white text-sm font-medium rounded-full hover:bg-[#0077ED] transition-colors"
            >
              读「全成本拆解」系列
            </Link>
            <a
              href="#apps"
              className="px-7 py-3 bg-white text-[#0071e3] text-sm font-medium rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)] transition-shadow"
            >
              看看自制小工具
            </a>
          </div>
        </motion.div>
      </section>

      {/* 全成本拆解系列 */}
      <section id="cost" className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <h2 className="text-4xl font-semibold tracking-tight text-[#1d1d1f]">
              全成本拆解
            </h2>
            <p className="mt-4 text-lg text-[#86868b] max-w-2xl mx-auto">
              一个浙江温州真实住宅项目的全成本台账，按土地增值税清算口径逐项拆解。系列共
              9 篇，陆续发布。
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 mb-10">
            {articles.map((a, i) => (
              <motion.div
                key={a.slug}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
              >
                <Link
                  href={`/cost/${a.slug}`}
                  className="block h-full bg-[#fbfbfd] rounded-3xl p-8 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_10px_32px_rgba(0,0,0,0.1)] transition-shadow duration-300"
                >
                  <div className="flex items-baseline gap-3 mb-4">
                    <span className="text-sm font-semibold text-[#0071e3]">
                      第{a.order}篇
                    </span>
                    <span className="text-xs text-[#86868b]">{a.category}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-[#1d1d1f] leading-snug mb-3">
                    {a.title}
                  </h3>
                  <p className="text-sm text-[#6e6e73] leading-relaxed">
                    {a.description}
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/cost"
              className="inline-block text-sm font-medium text-[#0071e3] hover:underline"
            >
              查看系列全部文章 →
            </Link>
          </div>
        </div>
      </section>

      {/* 打新提醒 Widget */}
      <section id="ipo" className="py-16 scroll-mt-16">
        <IPOReminderWidget />
      </section>

      {/* 自制应用 */}
      <section id="apps" className="py-20 bg-white scroll-mt-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-semibold tracking-tight text-[#1d1d1f]">
              自制应用
            </h2>
            <p className="mt-4 text-lg text-[#86868b]">
              用 AI 打造的极简小工具。
            </p>
          </motion.div>

          <div className="space-y-16">
            {apps.map((app, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className="flex flex-col md:flex-row items-center gap-12 bg-[#fbfbfd] rounded-3xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] transition-shadow duration-500"
              >
                <div
                  className={`w-full md:w-1/2 h-[400px] overflow-hidden ${index % 2 === 1 ? "md:order-last" : ""}`}
                >
                  <img
                    src={app.image}
                    alt={app.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="w-full md:w-1/2 p-8 md:p-12 text-center md:text-left flex flex-col justify-center">
                  <h3 className="text-3xl font-semibold text-[#1d1d1f] mb-2">
                    {app.name}
                  </h3>
                  <h4 className="text-xl font-medium text-[#86868b] mb-6">
                    {app.tagline}
                  </h4>
                  <p className="text-base text-gray-600 mb-8 max-w-md mx-auto md:mx-0">
                    {app.description}
                  </p>
                  <div>
                    <a
                      href={app.link}
                      target={app.link.startsWith("http") ? "_blank" : undefined}
                      rel={
                        app.link.startsWith("http")
                          ? "noopener noreferrer"
                          : undefined
                      }
                      className="inline-block px-6 py-2 bg-[#0071e3] text-white text-sm font-medium rounded-full hover:bg-[#0077ED] transition-colors"
                    >
                      了解更多
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
