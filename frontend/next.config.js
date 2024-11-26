// @ts-check
 
/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  images: {
    domains: ["arweave.net"],
    unoptimized: true
  },
  reactStrictMode: true,
  output: "export",
  trailingSlash: true,
};

module.exports = nextConfig;

