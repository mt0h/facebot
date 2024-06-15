/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        mongodb: false,
        crypto: false,
        jsonwebtoken: false,
        bson: false,
        nodemailer: false,
        mailgen: false,
        fs: false,
        sharp: false,
        papr: false,
        "mongodb-memory-server": false,
        "playwright-core": false,
      };
    }
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.imgur.com",
        pathname: "**",
      },
    ],
  },
  rewrites() {
    return {
      beforeFiles: [
        {
          source: "/file/:path*",
          destination: "/api/file-storage/:path*",
        },
      ],
    };
  },
};

module.exports = nextConfig;
