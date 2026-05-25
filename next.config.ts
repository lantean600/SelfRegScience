import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {};

export default nextConfig;

// 仅 Cloudflare 本地预览需要；普通 `npm run dev` 不要开启，避免 Workers 头约束导致 localhost 异常
if (process.env.OPEN_NEXT_CLOUDFLARE_DEV === "1") {
  initOpenNextCloudflareForDev();
}
