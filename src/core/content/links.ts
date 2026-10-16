import { site } from "@/site.config";

/** Link bản chữ (story.md) trên GitHub và link sửa trực tiếp. */
export function githubLinks(dir: string) {
  const path = `content/${dir}/story.md`;
  return {
    textUrl: `${site.repo}/blob/${site.branch}/${path}`,
    editUrl: `${site.repo}/edit/${site.branch}/${path}`,
  };
}
