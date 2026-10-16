import { llmsIndex } from "@/core/content/llms";

// /llms.txt — dựng sẵn lúc build (không đọc dữ liệu theo yêu cầu), giống một file tĩnh.
export function GET() {
  return new Response(llmsIndex(), { headers: { "content-type": "text/plain; charset=utf-8" } });
}
