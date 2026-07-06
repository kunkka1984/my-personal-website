import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";

const contentDir = path.join(process.cwd(), "content", "cost");

export interface ArticleMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  order: number;
  category: string;
}

function toMeta(slug: string, data: Record<string, unknown>): ArticleMeta {
  const date =
    data.date instanceof Date
      ? data.date.toISOString().slice(0, 10)
      : String(data.date ?? "");
  return {
    slug,
    title: String(data.title ?? ""),
    description: String(data.description ?? ""),
    date,
    order: Number(data.order ?? 0),
    category: String(data.category ?? ""),
  };
}

export function getAllArticles(): ArticleMeta[] {
  return fs
    .readdirSync(contentDir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const raw = fs.readFileSync(path.join(contentDir, f), "utf8");
      const { data } = matter(raw);
      return toMeta(f.replace(/\.md$/, ""), data);
    })
    .sort((a, b) => a.order - b.order);
}

export function getArticle(slug: string): { meta: ArticleMeta; html: string } {
  const raw = fs.readFileSync(path.join(contentDir, `${slug}.md`), "utf8");
  const { data, content } = matter(raw);
  const html = marked.parse(content) as string;
  return { meta: toMeta(slug, data), html };
}
