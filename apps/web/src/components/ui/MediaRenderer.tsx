import React from "react"
import Image from "next/image"

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

  if (type === "VIDEO") {
    return (
      <video
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

  if (type === "IFRAME") {
    return (
      <iframe
        src={url}
        title={alt}
        allow="autoplay; fullscreen"
        className={className}
        style={fill ? { width: "100%", height: "100%", border: "none", position: "absolute", inset: 0 } : { border: "none" }}
      />
    )
  }

  // Default to IMAGE
  if (fill) {
    return <Image src={url} alt={alt} fill className={className} />
  }
  
  return <img src={url} alt={alt} className={className} />
}
