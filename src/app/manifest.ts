import type { MetadataRoute } from "next";
import { site } from "@/site.config";

// Thông tin để "Thêm vào màn hình chính". Biểu tượng sinh từ src/app/icon.svg (xem chú thích trong file đó).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: "Lược sử VN",
    description: site.description,
    lang: "vi",
    start_url: "/",
    display: "standalone",
    background_color: "#120b08",
    theme_color: "#120b08",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
