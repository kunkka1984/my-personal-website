import type { Metadata } from "next";
import Link from "next/link";
import { getAllArticles, getArticle } from "@/lib/articles";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllArticles().map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { meta } = getArticle(slug);
  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: `/cost/${slug}` },
    openGraph: {
      type: "article",
      title: meta.title,
      description: meta.description,
      url: `https://chengbenguan.com/cost/${slug}`,
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { meta, html } = getArticle(slug);
  const all = getAllArticles();
  const idx = all.findIndex((a) => a.slug === slug);
  const prev = idx > 0 ? all[idx - 1] : null;
  const next = idx < all.length - 1 ? all[idx + 1] : null;

  return (
    <main className="min-h-screen pt-24 pb-20">
      <article className="max-w-3xl mx-auto px-4 sm:px-6">
        <header className="mb-10">
          <nav className="text-sm text-[#86868b] mb-6">
            <Link href="/cost" className="text-[#0071e3] hover:underline">
              全成本拆解系列
            </Link>
            <span className="mx-2">/</span>
            <span>
              {meta.order === 0 ? "总纲" : `第${meta.order}篇`} · {meta.category}
            </span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-[#1d1d1f] leading-snug mb-4">
            {meta.title}
          </h1>
          <time className="text-sm text-[#86868b]">{meta.date}</time>
        </header>

        <div
          className="article-body"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        <nav className="mt-16 pt-8 border-t border-black/10 grid gap-4 sm:grid-cols-2">
          {prev ? (
            <Link
              href={`/cost/${prev.slug}`}
              className="block bg-white rounded-xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.04)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)] transition-shadow"
            >
              <span className="text-xs text-[#86868b] block mb-1">← 上一篇</span>
              <span className="text-sm font-medium text-[#1d1d1f] leading-snug">
                {prev.title}
              </span>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link
              href={`/cost/${next.slug}`}
              className="block bg-white rounded-xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.04)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)] transition-shadow sm:text-right"
            >
              <span className="text-xs text-[#86868b] block mb-1">下一篇 →</span>
              <span className="text-sm font-medium text-[#1d1d1f] leading-snug">
                {next.title}
              </span>
            </Link>
          )}
        </nav>
      </article>
    </main>
  );
}
