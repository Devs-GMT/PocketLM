/** @type {import('next').NextConfig} */
import path from "node:path";

const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: path.resolve("."),
  webpack: (config) => {
    // pdfjs-dist optionally requires node-canvas; the browser build does not need it.
    config.resolve.alias.canvas = false;
    return config;
  },
};
export default nextConfig;
