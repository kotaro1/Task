import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["node-ical", "temporal-polyfill", "rrule-temporal"],
};

export default nextConfig;
