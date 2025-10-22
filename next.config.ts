// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',          // writes static site to ./out
  images: { unoptimized: true },
  trailingSlash: true,       // creates folder/index.html (safer on old hosts)
};

module.exports = nextConfig;
