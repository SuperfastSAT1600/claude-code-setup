import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {},
  webpack: (config) => {
    // Allow importing from blog-agent directory
    config.resolve.alias = {
      ...config.resolve.alias,
      '@blog-agent': path.resolve(__dirname, 'blog-agent/src'),
    };

    // Add .ts extension resolution for blog-agent imports
    config.resolve.extensions = [
      '.ts',
      '.tsx',
      '.js',
      '.jsx',
      '.json',
      ...config.resolve.extensions,
    ];

    // Handle .js imports that should resolve to .ts files
    config.resolve.extensionAlias = {
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.jsx': ['.tsx', '.jsx'],
    };

    return config;
  },
  transpilePackages: ['blog-agent'],
};

export default nextConfig;
