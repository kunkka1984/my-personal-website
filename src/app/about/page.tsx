import type { Metadata } from "next";
import Link from "next/link";
import CopyEmail from "@/components/CopyEmail";

export const metadata: Metadata = {
  title: "关于我 — 18年房地产甲方成本管理",
  description:
    "成本观站长kunkka：浙江温州人，一级造价工程师，18年房地产甲方成本管理经验，从拿地测算到结算清算全链条实战。现做成本内容与AI造价算量探索。",
  alternates: { canonical: "/about" },
};

const services = [
  {
    title: "拿地测算复核 / 全成本管控咨询",
    desc: "投前测算的科目完整性、口径合理性把关，动态成本体系搭建的实操建议。",
  },
  {
    title: "结算对量与成本争议",
    desc: "甲方视角的第三方复核：结算书、签证索赔、模拟清单转固定总价的坑。",
  },
  {
    title: "AI 算量合作与造价数字化",
    desc: "结构图纸自动算量已跑通 demo（构件级明细、可对量），找造价咨询公司/房企成本口聊落地。",
  },
  {
    title: "内容与分享合作",
    desc: "专栏约稿、课程、内部培训分享。",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <header className="mb-14 text-center">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-[#1d1d1f] mb-4">
            关于我
          </h1>
          <p className="text-lg text-[#6e6e73]">
            kunkka · 18年房地产甲方成本管理 · 一级造价工程师
          </p>
        </header>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-[#1d1d1f] mb-4">我是谁</h2>
          <div className="text-[1.0625rem] leading-[1.9] text-[#333336] space-y-4">
            <p>
              浙江温州人，一级造价工程师。在房地产甲方做了
              <strong className="text-[#1d1d1f]">18年成本管理</strong>
              ，从造价员做到资深成本经理，完整经历了中国房地产从黄金时代到深度调整的全周期。
            </p>
            <p>
              拿地测算、目标成本、招采合约、动态成本、签证变更、结算对量、土增税清算配合——
              这条链上的每个环节都亲手干过，不是管理岗远程看报表，是逐个项目从第一笔测算跟到最后一笔结算。
            </p>
            <p>
              现在是自由职业者，做两件事：把18年的实战经验写成公开内容（就是这个网站），
              以及探索 AI 在造价行业的落地。
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-[#1d1d1f] mb-4">
            这个网站写什么
          </h2>
          <div className="text-[1.0625rem] leading-[1.9] text-[#333336] space-y-4">
            <p>
              真实项目的成本台账复盘。项目信息保密，但<strong className="text-[#1d1d1f]">地区公开</strong>
              ——造价这行一地一策，定额、政策性收费、税务口径都跟着地区走，脱离地区谈数字没意义。
            </p>
            <p>
              主打<Link href="/cost" className="text-[#0071e3] hover:underline">「全成本拆解」系列</Link>
              ：一个浙江温州住宅项目的完整成本账，按土地增值税清算口径逐项讲透——每笔钱怎么构成、怎么计取、能不能抵税。
              后续会开拿地测算、AI 算量实战等专栏。
            </p>
            <p>
              写作原则：不写教科书定义，只写真实数字、踩过的坑和甲方视角的判断。
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-[#1d1d1f] mb-4">AI × 造价</h2>
          <div className="text-[1.0625rem] leading-[1.9] text-[#333336] space-y-4">
            <p>
              2026年起，我在用 AI 重做传统算量流程：从结构图纸（DXF）直接算量，
              与人工对量偏差混凝土 <strong className="text-[#1d1d1f]">±1%</strong> 以内、钢筋
              <strong className="text-[#1d1d1f]"> ±5%</strong> 以内
              ，产出构件级明细、带轴线定位、可逐项对量。传统算量要几天的活，现在以小时计。
            </p>
            <p>
              这条线正在找合作方。如果你是造价咨询公司或房企成本口，想聊 AI 算量怎么落地，欢迎联系。
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-[#1d1d1f] mb-6">
            可以找我聊什么
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {services.map((s) => (
              <div
                key={s.title}
                className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]"
              >
                <h3 className="text-base font-semibold text-[#1d1d1f] mb-2">
                  {s.title}
                </h3>
                <p className="text-sm text-[#6e6e73] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="text-center bg-white rounded-3xl p-10 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
          <h2 className="text-2xl font-semibold text-[#1d1d1f] mb-3">联系</h2>
          <p className="text-[#6e6e73] mb-6">
            邮箱是最可靠的方式，点击下方按钮直接复制。
          </p>
          <CopyEmail className="inline-block px-7 py-3 bg-[#0071e3] text-white text-sm font-medium rounded-full hover:bg-[#0077ED] transition-colors cursor-pointer" />
          <p className="mt-4 text-xs text-[#86868b]">78521299@qq.com</p>
        </section>
      </div>
    </main>
  );
}
