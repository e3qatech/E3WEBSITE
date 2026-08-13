import React from "react"
import Image from "next/image"
import { resolveMediaType } from "@/lib/media-resolver"
import { parseVideoEmbedUrl } from "@/components/shared/UniversalMediaRenderer"

interface MediaRendererProps {
  url: string | null | undefined
  type: string | null | undefined
  alt: string
  className?: string
  fill?: boolean
}

export function MediaRenderer({ url, type, alt, className, fill }: MediaRendererProps) {
  if (!url) {
    if (fill) {
      return <Image src="/placeholder.jpg" alt={alt} fill className={className} />
    }
    return <img src="/placeholder.jpg" alt={alt} className={className} />
  }

  const embedUrl = parseVideoEmbedUrl(url);
  const resolvedType = resolveMediaType({ url: embedUrl || url, explicitType: type || undefined });

  if (resolvedType === "VIDEO" && !embedUrl.includes('youtube.com') && !embedUrl.includes('vimeo.com')) {
    return (
      <video
        key={url}
        src={url}
        autoPlay
        muted
        loop
        playsInline
        className={className}
        style={fill ? { width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 } : undefined}
      />
    )
  }

  if (resolvedType === "IFRAME" || resolvedType === "MODEL_3D" || embedUrl.includes('youtube.com') || embedUrl.includes('vimeo.com')) {
    return (
      <iframe
        key={embedUrl}
        src={embedUrl}
        title={alt}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        className={className}
        style={fill ? { width: "100%", height: "100%", border: "none", position: "absolute", inset: 0 } : { border: "none" }}
      />
    )
  }

  // Default to IMAGE
  if (fill) {
    return <Image key={url} src={url} alt={alt} fill className={className} />
  }
  
  return <img key={url} src={url} alt={alt} className={className} />
}
