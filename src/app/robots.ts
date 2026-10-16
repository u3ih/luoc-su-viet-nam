import type { MetadataRoute } from "next";
import { site } from "@/site.config";

// /robots.txt — cho phép mọi công cụ tìm kiếm và trợ lý AI đọc nội dung (giấy phép CC BY-SA).
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
