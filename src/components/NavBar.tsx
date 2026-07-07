"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import CopyEmail from "@/components/CopyEmail";

interface MenuItem {
  label: string;
  href: string;
  note?: string;
  external?: boolean;
}

const menus: { key: string; label: string; items: MenuItem[] }[] = [
  {
    key: "articles",
    label: "专栏文章",
    items: [
      {
        label: "全成本拆解",
        href: "/cost",
        note: "真实项目全成本台账，逐项讲透",
      },
    ],
  },
  {
    key: "tools",
    label: "小工具",
    items: [
      {
        label: "A股打新提醒",
        href: "/#ipo",
        note: "近期新股申购一览",
      },
      {
        label: "随机番茄钟",
        href: "/pomodoro-app/index.html",
        note: "反脆弱的专注力工具",
      },
      {
        label: "全部应用",
        href: "/#apps",
        note: "自制应用总览",
      },
    ],
  },
];

export default function NavBar() {
  const [open, setOpen] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpen(null);
      }
    };
    document.addEventListener("click", onClickOutside);
    return () => document.removeEventListener("click", onClickOutside);
  }, []);

  return (
    <nav className="glass-nav fixed top-0 w-full z-50 transition-all duration-300">
      <div ref={navRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-12 text-xs font-medium tracking-wide text-gray-800">
          <Link
            href="/"
            className="font-semibold hover:text-black transition-colors"
            onClick={() => setOpen(null)}
          >
            成本观
          </Link>
          <div className="flex items-center space-x-5 sm:space-x-8">
            {menus.map((menu) => (
              <div
                key={menu.key}
                className="relative"
                onMouseEnter={() => setOpen(menu.key)}
                onMouseLeave={() => setOpen(null)}
              >
                <button
                  className={`flex items-center gap-1 py-3 transition-colors cursor-pointer ${
                    open === menu.key ? "text-black" : "hover:text-black"
                  }`}
                  onClick={() => setOpen(open === menu.key ? null : menu.key)}
                  aria-expanded={open === menu.key}
                >
                  {menu.label}
                  <svg
                    width="8"
                    height="8"
                    viewBox="0 0 10 10"
                    className={`transition-transform duration-200 ${
                      open === menu.key ? "rotate-180" : ""
                    }`}
                  >
                    <path
                      d="M1 3l4 4 4-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                {open === menu.key && (
                  <div className="absolute right-0 top-full w-60 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.12)] border border-black/5 p-2 overflow-hidden">
                    {menu.items.map((item) =>
                      item.external ? (
                        <a
                          key={item.href}
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block px-4 py-3 rounded-xl hover:bg-black/5 transition-colors"
                          onClick={() => setOpen(null)}
                        >
                          <span className="block text-[13px] font-medium text-[#1d1d1f]">
                            {item.label}
                          </span>
                          {item.note && (
                            <span className="block text-[11px] text-[#86868b] mt-0.5">
                              {item.note}
                            </span>
                          )}
                        </a>
                      ) : (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="block px-4 py-3 rounded-xl hover:bg-black/5 transition-colors"
                          onClick={() => setOpen(null)}
                        >
                          <span className="block text-[13px] font-medium text-[#1d1d1f]">
                            {item.label}
                          </span>
                          {item.note && (
                            <span className="block text-[11px] text-[#86868b] mt-0.5">
                              {item.note}
                            </span>
                          )}
                        </Link>
                      )
                    )}
                  </div>
                )}
              </div>
            ))}
            <Link
              href="/about"
              className="hover:text-black transition-colors"
              onClick={() => setOpen(null)}
            >
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
            <CopyEmail />
          </div>
        </div>
      </div>
    </nav>
  );
}
