import type { MetadataRoute } from "next";
import { getAllArticles } from "@/lib/articles";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const articles: MetadataRoute.Sitemap = getAllArticles().map((a) => ({
    url: `https://chengbenguan.com/cost/${a.slug}`,
    lastModified: new Date(a.date),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [
    {
      url: "https://chengbenguan.com",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: "https://chengbenguan.com/cost",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...articles,
    {
      url: "https://chengbenguan.com/pomodoro-app/index.html",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];
}
