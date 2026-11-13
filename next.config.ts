import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  // Mọi trang đều dựng sẵn lúc build; audio.ts chỉ kiểm file mp3 có tồn tại. Không loại ra thì trace của
  // mỗi route kéo theo cả public/audio (hàng trăm MB), vượt giới hạn kích thước hàm serverless của Vercel.
  outputFileTracingExcludes: {
    "/**": ["public/audio/**/*.mp3", "public/models/**", "public/geo/**"],
  },
};

export default nextConfig;
