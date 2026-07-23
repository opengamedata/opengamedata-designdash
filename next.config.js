/** @type {import('next').NextConfig} */
const deployTarget = process.env.DEPLOY_TARGET || 'static'; // 'static' | 'cloudrun'

const nextConfig = {
  reactStrictMode: true,
  // Pre-existing lint debt is reported in CI_validate; do not fail production builds on it.
  eslint: {
    ignoreDuringBuilds: true,
  },
  ...(deployTarget === 'static'
    ? {
        output: 'export',
        distDir: 'build',
        basePath: '/BASE_PATH',
      }
    : {
        output: 'standalone',
      }),
};

module.exports = nextConfig;
