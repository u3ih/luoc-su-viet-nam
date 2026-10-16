import { llmsFull } from "@/core/content/llms";

// /llms-full.txt — toàn văn các chương, dựng sẵn lúc build.
export async function GET() {
  return new Response(await llmsFull(), { headers: { "content-type": "text/plain; charset=utf-8" } });
}
