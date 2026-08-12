/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return Array.from({ length: 12 }, (_, i) => i + 1).map((n) => ({
      source: `/tabla-${n}`,
      destination: `/tabla-del-${n}`,
      permanent: true,
    }));
  },
};
module.exports = nextConfig;
