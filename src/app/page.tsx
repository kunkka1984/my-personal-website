"use client";

import { motion } from "framer-motion";
import IPOReminderWidget from "@/components/IPOReminderWidget";

export default function Home() {
  const apps = [
    {
      name: "胡伯曼随机番茄钟",
      tagline: "反脆弱的专注力",
      description: "基于斯坦福 Huberman 教授的研究，引入随机性的极简番茄钟，让你在不确定的节奏中高度沉浸当下。",
      image: "/images/pomodoro.jpg",
      link: "/pomodoro-app/index.html"
    },
    {
      name: "中国A股打新提醒",
      tagline: "不错过每一次打新机会",
      description: "基于 AKShare 数据接口开发的自动化工具，抓取新股申购信息，为你提供及时的打新提醒与策略辅助。",
      image: "/images/ipo.jpg",
      link: "https://github.com/kunkka1984/A-share-IPO-reminder"
    }
  ];

  return (
    <main className="min-h-screen pt-12">
      {/* Hero Section */}
      <section className="h-[80vh] flex flex-col justify-center items-center text-center px-4 relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="z-10"
        >
          <h1 className="text-5xl md:text-7xl font-semibold tracking-tight text-[#1d1d1f] mb-4">
            kunkka 科技生活
          </h1>
          <p className="text-xl md:text-2xl text-[#86868b] max-w-2xl mx-auto font-medium tracking-tight">
            打造极简、优雅且直觉式的数字体验。
          </p>
        </motion.div>
      </section>

      {/* IPO Reminder Widget */}
      <section className="relative -mt-20 z-20">
        <IPOReminderWidget />
      </section>

      {/* Apps Section */}
      <section id="apps" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-semibold tracking-tight text-[#1d1d1f]">自制应用</h2>
            <p className="mt-4 text-lg text-[#86868b]">探索改变生活方式的灵感之作。</p>
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
                <div className={`w-full md:w-1/2 h-[400px] overflow-hidden ${index % 2 === 1 ? 'md:order-last' : ''}`}>
                  <img src={app.image} alt={app.name} className="w-full h-full object-cover" />
                </div>
                <div className="w-full md:w-1/2 p-8 md:p-12 text-center md:text-left flex flex-col justify-center">
                  <h3 className="text-3xl font-semibold text-[#1d1d1f] mb-2">{app.name}</h3>
                  <h4 className="text-xl font-medium text-[#86868b] mb-6">{app.tagline}</h4>
                  <p className="text-base text-gray-600 mb-8 max-w-md mx-auto md:mx-0">
                    {app.description}
                  </p>
                  <div>
                    <a 
                      href={app.link} 
                      target={app.link.startsWith('http') ? '_blank' : undefined}
                      rel={app.link.startsWith('http') ? 'noopener noreferrer' : undefined}
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
