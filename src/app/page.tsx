import HomeClient from "@/components/HomeClient";
import { getAllArticles } from "@/lib/articles";

export default function Home() {
  const articles = getAllArticles();
  return <HomeClient articles={articles} />;
}
