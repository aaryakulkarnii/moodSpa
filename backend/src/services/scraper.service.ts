import axios from "axios";
import * as cheerio from "cheerio";

export interface ScrapedArticle {
  title: string;
  link: string;
  snippet: string;
}

// Static fallback used when live scraping fails
const FALLBACK_ARTICLES: ScrapedArticle[] = [
  {
    title: "5 Breathing Techniques to Reduce Anxiety",
    link: "https://www.medicalnewstoday.com",
    snippet:
      "Deep breathing activates the parasympathetic nervous system, reducing stress hormones and promoting calm within minutes.",
  },
  {
    title: "How Journaling Helps Process Difficult Emotions",
    link: "https://www.medicalnewstoday.com",
    snippet:
      "Research shows expressive writing can lower cortisol levels and improve emotional regulation in adults.",
  },
  {
    title: "The Science of Mindfulness and Mental Health",
    link: "https://www.medicalnewstoday.com",
    snippet:
      "Regular mindfulness practice reduces symptoms of depression and anxiety according to multiple peer-reviewed studies.",
  },
  {
    title: "Sleep and Mental Health: The Critical Connection",
    link: "https://www.medicalnewstoday.com",
    snippet:
      "Poor sleep quality is strongly linked to anxiety and depression. Adults need 7-9 hours of quality sleep per night.",
  },
];

/**
 * Scrapes mental health articles from Medical News Today.
 * Gracefully falls back to curated static content on any error.
 */
export async function scrapeMentalHealthNews(): Promise<ScrapedArticle[]> {
  try {
    const { data } = await axios.get(
      "https://www.medicalnewstoday.com/mental-health",
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
        },
        timeout: 8000,
      }
    );

    const $ = cheerio.load(data);
    const articles: ScrapedArticle[] = [];

    $("article").each((_, el) => {
      const title = $(el).find("h2, h3").first().text().trim();
      const link = $(el).find("a").first().attr("href") || "";
      const snippet = $(el).find("p").first().text().trim();

      if (title && snippet) {
        articles.push({
          title,
          link: link.startsWith("http")
            ? link
            : `https://www.medicalnewstoday.com${link}`,
          snippet: snippet.slice(0, 220),
        });
      }
    });

    return articles.length > 0 ? articles.slice(0, 5) : FALLBACK_ARTICLES;
  } catch {
    return FALLBACK_ARTICLES;
  }
}
