"use client";

import { useState } from "react";

const EMAIL = "78521299@qq.com";

export default function CopyEmail({ className }: { className?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = EMAIL;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={copy}
      className={className ?? "hover:text-black transition-colors cursor-pointer"}
      title={`点击复制邮箱 ${EMAIL}`}
    >
      {copied ? "已复制 ✓" : "Email"}
    </button>
  );
}
