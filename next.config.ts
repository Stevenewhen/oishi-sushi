/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',              // generate static HTML into /out
  images: { unoptimized: true }, // avoids next/image processing on export
};
export default nextConfig;
