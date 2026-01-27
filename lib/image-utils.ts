/**
 * Image optimization utilities for Next.js Image component
 */

export const PLACEHOLDER_IMAGE = '/placeholder.svg'

/**
 * Get optimized image props for Next.js Image component
 */
export function getImageProps(
  src: string | null | undefined, 
  alt: string,
  options?: { priority?: boolean }
) {
  // Normalize the src URL - add leading slash if missing
  let normalizedSrc = src || PLACEHOLDER_IMAGE
  if (normalizedSrc !== PLACEHOLDER_IMAGE && !normalizedSrc.startsWith('/') && !normalizedSrc.startsWith('http')) {
    normalizedSrc = `/${normalizedSrc}`
  }
  
  const baseProps = {
    src: normalizedSrc,
    alt,
  }

  // Don't add loading prop if priority is true
  if (options?.priority) {
    return baseProps
  }

  return {
    ...baseProps,
    loading: 'lazy' as const,
  }
}

/**
 * Image size presets for different use cases
 */
export const IMAGE_SIZES = {
  // Player photos
  playerCard: {
    width: 400,
    height: 400,
  },
  playerModal: {
    width: 600,
    height: 600,
  },
  playerTeaser: {
    width: 200,
    height: 200,
  },
  
  // News images
  newsFeatured: {
    width: 1200,
    height: 600,
  },
  newsCard: {
    width: 600,
    height: 400,
  },
  
  // Match logos
  teamLogo: {
    width: 120,
    height: 120,
  },
  
  // Sponsor logos
  sponsorLogo: {
    width: 200,
    height: 100,
  },
} as const

/**
 * Get responsive sizes attribute for Image component
 */
export function getResponsiveSizes(type: keyof typeof IMAGE_SIZES) {
  const sizeMap = {
    playerCard: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
    playerModal: '(max-width: 768px) 100vw, 600px',
    playerTeaser: '200px',
    newsFeatured: '(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px',
    newsCard: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 600px',
    teamLogo: '120px',
    sponsorLogo: '200px',
  }
  
  return sizeMap[type]
}

/**
 * Check if image URL is external
 */
export function isExternalImage(src: string): boolean {
  return src.startsWith('http://') || src.startsWith('https://')
}

/**
 * Get optimized image URL for external images
 */
export function getOptimizedImageUrl(src: string, width?: number): string {
  if (!src || src === PLACEHOLDER_IMAGE) return PLACEHOLDER_IMAGE
  
  // For local images, let Next.js handle optimization
  if (!isExternalImage(src)) return src
  
  // For external images, you might want to use a CDN or image optimization service
  // For now, return as-is
  return src
}
