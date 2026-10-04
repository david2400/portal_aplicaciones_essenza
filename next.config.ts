import path from 'node:path';
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./shared/i18n/request.ts');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // swcMinify: true,
  // Standalone output creates symlinks, which requires admin/Developer Mode on
  // Windows. Enable it explicitly for deploys: BUILD_STANDALONE=true pnpm build
  output: process.env.BUILD_STANDALONE === 'true' ? 'standalone' : undefined,
  outputFileTracingRoot: path.join(__dirname, '../../'),
};

export default withNextIntl(nextConfig);
