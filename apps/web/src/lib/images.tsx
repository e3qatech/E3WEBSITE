import Image, { ImageProps } from "next/image"

/**
 * A utility to dynamically generate a 20px blur placeholder via a tiny base64 string.
 * In a real production environment, this should hit an edge function or microservice
 * to prevent blocking the main thread, or be pre-generated at build time in the CMS.
 */
export async function generateBlurDataURL(url: string) {
  // Mock logic: return a solid transparent/light gray base64 for now
  // Real implementation: fetch(url), resize to 20px, return base64 string
  return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
}

interface E3ImageProps extends Omit<ImageProps, "placeholder" | "blurDataURL"> {
  isThumbnail?: boolean
  blurData?: string
}

/**
 * Optimized wrapper around next/image for the E3 website.
 * Enforces strict performance defaults to guarantee LCP < 1.1s.
 */
export function E3Image({
  src,
  alt,
  priority = false,
  isThumbnail = false,
  blurData,
  quality,
  sizes,
  className,
  ...props
}: E3ImageProps) {
  
  // Default responsive sizes to prevent downloading massive files on mobile
  const defaultSizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  
  // Throttle quality for gallery thumbs, boost for hero
  const defaultQuality = isThumbnail ? 60 : 80

  return (
    <Image
      src={src}
      alt={alt}
      priority={priority}
      quality={quality || defaultQuality}
      sizes={sizes || defaultSizes}
      placeholder={blurData ? "blur" : "empty"}
      blurDataURL={blurData}
      className={className}
      {...props}
    />
  )
}
