import type { Metadata } from "next";
import Link from "next/link";
import { getAllArticles } from "@/lib/articles";

export const metadata: Metadata = {
  title: "全成本拆解系列 — 房地产项目成本逐项讲透",
  description:
    "一个浙江温州真实住宅项目的全成本台账，按土地增值税清算扣除项目口径逐项拆解：地价、征拆、前期、建安、基础设施、公共配套、开发间接费、期间费用、税务清算。18年甲方成本经验实战复盘。",
  alternates: { canonical: "/cost" },
};

export default function CostSeriesPage() {
  const articles = getAllArticles();

  return (
    <main className="min-h-screen pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <header className="mb-14">
          <p className="text-sm font-medium text-[#0071e3] mb-3 tracking-wide">
            系列专栏
          </p>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-[#1d1d1f] mb-5">
            全成本拆解
          </h1>
          <p className="text-lg text-[#6e6e73] leading-relaxed">
            一个浙江温州真实住宅项目的全成本台账，按土地增值税清算的扣除项目口径，
            一项一项讲清楚每笔钱是什么、怎么计取、能不能抵税。不写教科书定义，
            只写真实数字、踩过的坑和甲方视角的判断。系列共9篇，陆续发布。
          </p>
        </header>

        <div className="space-y-4">
          {articles.map((a) => (
            <Link
              key={a.slug}
              href={`/cost/${a.slug}`}
              className="block bg-white rounded-2xl p-6 md:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_28px_rgba(0,0,0,0.09)] transition-shadow duration-300"
            >
              <div className="flex items-baseline gap-3 mb-3">
                <span className="text-sm font-semibold text-[#0071e3] shrink-0">
                  {a.order === 0 ? "总纲" : `第${a.order}篇`}
                </span>
                <span className="text-xs text-[#86868b]">{a.category}</span>
              </div>
              <h2 className="text-xl md:text-2xl font-semibold text-[#1d1d1f] leading-snug mb-3">
                {a.title}
              </h2>
              <p className="text-sm text-[#6e6e73] leading-relaxed mb-4">
                {a.description}
              </p>
              <div className="flex items-center justify-between">
                <time className="text-xs text-[#86868b]">{a.date}</time>
                <span className="text-sm font-medium text-[#0071e3]">
                  阅读全文 →
                </span>
              </div>
            </Link>
          ))}
        </div>

        <p className="mt-12 text-sm text-[#86868b] text-center">
          后续篇章：前期工程费 · 建安工程费 · 基础设施费 · 公共配套设施费 ·
          开发间接费 · 期间费用 · 税务清算与利润总结
        </p>
      </div>
    </main>
  );
}
