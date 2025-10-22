/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removido 'output: export' para permitir API routes
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
  // Desabilitar strict mode que pode causar double render
  reactStrictMode: false,
}

module.exports = nextConfig

