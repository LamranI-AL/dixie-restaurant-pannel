"use client";

import Image from "next/image";
import { useState } from "react";

interface CustomImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  priority?: boolean;
}

export default function CustomImage({ 
  src, 
  alt, 
  width = 500, 
  height = 500, 
  fill = false, 
  className = "", 
  priority = false 
}: CustomImageProps) {
  const [imgError, setImgError] = useState(false);

  // Si c'est une image base64, utiliser un img normal
  if (src?.startsWith('data:image/')) {
    return (
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        style={fill ? { width: '100%', height: '100%', objectFit: 'cover' } : {}}
        onError={() => setImgError(true)}
      />
    );
  }

  // Sinon utiliser Next.js Image
  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className={className}
        priority={priority}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      onError={() => setImgError(true)}
    />
  );
}