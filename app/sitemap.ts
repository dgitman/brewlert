import type { MetadataRoute } from "next";
import { GUIDES } from "@/lib/guides";
import { absoluteUrl, listIssueDates } from "@/lib/site";

export const revalidate = 86400;

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl("/archive"),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/guides"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/about"),
      changeFrequency: "yearly",
      priority: 0.5,
    },
  ];

  const guides: MetadataRoute.Sitemap = GUIDES.map((guide) => ({
    url: absoluteUrl(`/guides/${guide.slug}`),
    lastModified: "2026-08-16",
    changeFrequency: "yearly",
    priority: 0.7,
  }));

  const issues: MetadataRoute.Sitemap = listIssueDates().map((date) => ({
    url: absoluteUrl(`/weekly/${date}`),
    lastModified: date,
    changeFrequency: "never",
    priority: 0.8,
  }));

  return [...staticPages, ...guides, ...issues];
}
