/** @format */

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      bodySizeLimit: "1mb",
      allowedOrigins: ["*"],
    },
  },
  images: {
    domains: [
      "via.placeholder.com",
      "utfs.io", 
      "images.pexels.com",
      "cdn.pixabay.com",
      "images.unsplash.com",
      "res.cloudinary.com",
      "www.gravatar.com",
      "img.icons8.com",
      "o6lr91qesq.ufs.sh",
      "f3e8wywyb5.ufs.sh",
      "o6lr91qesq.ufs.rocks",
      "firebasestorage.googleapis.com",
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.firebasestorage.app',
        pathname: '/**',
      },
    ],
    // Permettre les images base64
    unoptimized: false,
    dangerouslyAllowSVG: true,
  },
};

export default nextConfig;
