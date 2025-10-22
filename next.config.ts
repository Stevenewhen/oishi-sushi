import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // create a fully static site in /out
  output: 'export',
  // avoids next/image processing during static export
  images: { unoptimized: true },
  // optional: if you rely on absolute links ending with /
  // trailingSlash: true,
};

export default nextConfig;
