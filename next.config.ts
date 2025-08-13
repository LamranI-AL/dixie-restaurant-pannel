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
    ],
    // Configuration pour permettre les images base64 en production
    unoptimized: false,
    dangerouslyAllowSVG: true,
    minimumCacheTTL: 60,
  },
};

export default nextConfig;
