import type { NextConfig } from "next";
import { isDemoMode } from "./src/shared/config/constants/env";

if (!isDemoMode()) {
  throw new Error(
    `NEXT_PUBLIC_APP_MODEの値 "${process.env.NEXT_PUBLIC_APP_MODE}" は未対応です`,
  );
}

const isDev = process.env.NODE_ENV !== "production";
const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "4566",
        pathname: "/isc-fes-local/**",
      },
      {
        protocol: "https",
        hostname: "img.fes.iwasaki.ac.jp",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
    // 開発環境ではLocalの画像ストレージを使うため内部IPへの接続を許可してる
    dangerouslyAllowLocalIP: isDev,
  },
};

export default nextConfig;
