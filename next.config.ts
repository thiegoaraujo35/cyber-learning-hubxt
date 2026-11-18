import type { NextConfig } from "next";

// Site 100% estático (GitHub Pages): `next build` gera a pasta `out/`.
// No Pages o site fica em /<nome-do-repositório>, por isso o basePath vem do workflow de deploy.
const nextConfig: NextConfig = {
  output: "export",
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
