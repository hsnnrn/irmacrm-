/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  distDir: 'dist',
  experimental: {
    esmExternals: 'loose'
  },
  async redirects() {
    return [
      {
        source: '/auth/login/auth/reset-password',
        destination: '/auth/reset-password',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
