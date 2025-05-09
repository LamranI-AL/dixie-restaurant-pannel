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
      "o6lr91qesq.ufs.rocks",
    ],
  },
};

export default nextConfig;
