/**
 * Bento Grid Layout Helper Utility
 * Dynamically computes responsive 6-column grid column spans for odd and even item counts 
 * so that no row is left with awkward unaligned gaps.
 */

export interface BentoSpanConfig {
  containerClass: string;
  cardClasses: string[];
}

/**
 * Returns Tailwind grid column span classes for a 6-column base bento grid layout.
 * @param index - Zero-based index of the card in the list
 * @param totalCount - Total number of active cards being rendered
 */
export function getBentoCardSpan(index: number, totalCount: number): {
  spanClass: string;
  isFeatured: boolean;
} {
  if (totalCount <= 0) {
    return { spanClass: 'lg:col-span-2 md:col-span-1 col-span-1', isFeatured: false };
  }

  // 1 Item: Full width hero bento (6 cols = 100%)
  if (totalCount === 1) {
    return { spanClass: 'lg:col-span-6 md:col-span-2 col-span-1', isFeatured: true };
  }

  // 2 Items: Split 50/50 (3 cols + 3 cols = 6 cols)
  if (totalCount === 2) {
    if (index === 0) return { spanClass: 'lg:col-span-3 md:col-span-1 col-span-1', isFeatured: true };
    return { spanClass: 'lg:col-span-3 md:col-span-1 col-span-1', isFeatured: false };
  }

  // 3 Items: 
  // Row 1: Card 0 (4 cols - Hero) + Card 1 (2 cols) = 6 cols
  // Row 2: Card 2 (6 cols - Full Banner) = 6 cols
  if (totalCount === 3) {
    if (index === 0) return { spanClass: 'lg:col-span-4 md:col-span-2 col-span-1', isFeatured: true };
    if (index === 1) return { spanClass: 'lg:col-span-2 md:col-span-1 col-span-1', isFeatured: false };
    if (index === 2) return { spanClass: 'lg:col-span-6 md:col-span-2 col-span-1', isFeatured: true };
  }

  // 4 Items:
  // Row 1: Card 0 (4 cols) + Card 1 (2 cols) = 6 cols
  // Row 2: Card 2 (2 cols) + Card 3 (4 cols) = 6 cols
  if (totalCount === 4) {
    if (index === 0) return { spanClass: 'lg:col-span-4 md:col-span-1 col-span-1', isFeatured: true };
    if (index === 1) return { spanClass: 'lg:col-span-2 md:col-span-1 col-span-1', isFeatured: false };
    if (index === 2) return { spanClass: 'lg:col-span-2 md:col-span-1 col-span-1', isFeatured: false };
    if (index === 3) return { spanClass: 'lg:col-span-4 md:col-span-1 col-span-1', isFeatured: true };
  }

  // 5 Items (The key user scenario: 3 cards on top, 2 cards at bottom):
  // Row 1 (3 cards): Card 0 (2 cols), Card 1 (2 cols), Card 2 (2 cols) = 6 cols
  // Row 2 (2 cards): Card 3 (3 cols), Card 4 (3 cols) = 6 cols (50% / 50% split - NO BLANK GAPS!)
  if (totalCount === 5) {
    if (index === 0) return { spanClass: 'lg:col-span-2 md:col-span-1 col-span-1', isFeatured: true };
    if (index === 1) return { spanClass: 'lg:col-span-2 md:col-span-1 col-span-1', isFeatured: false };
    if (index === 2) return { spanClass: 'lg:col-span-2 md:col-span-2 col-span-1', isFeatured: false };
    if (index === 3) return { spanClass: 'lg:col-span-3 md:col-span-1 col-span-1', isFeatured: true };
    if (index === 4) return { spanClass: 'lg:col-span-3 md:col-span-1 col-span-1', isFeatured: false };
  }

  // 6 Items:
  // Row 1 (3 cards): 2 + 2 + 2 = 6 cols
  // Row 2 (3 cards): 2 + 2 + 2 = 6 cols
  if (totalCount === 6) {
    if (index === 0) return { spanClass: 'lg:col-span-2 md:col-span-1 col-span-1', isFeatured: true };
    return { spanClass: 'lg:col-span-2 md:col-span-1 col-span-1', isFeatured: false };
  }

  // 7 Items (Odd count):
  // Row 1 (2 cards): Card 0 (4 cols), Card 1 (2 cols) = 6 cols
  // Row 2 (3 cards): Card 2 (2 cols), Card 3 (2 cols), Card 4 (2 cols) = 6 cols
  // Row 3 (2 cards): Card 5 (3 cols), Card 6 (3 cols) = 6 cols
  if (totalCount === 7) {
    if (index === 0) return { spanClass: 'lg:col-span-4 md:col-span-1 col-span-1', isFeatured: true };
    if (index === 1) return { spanClass: 'lg:col-span-2 md:col-span-1 col-span-1', isFeatured: false };
    if (index === 2 || index === 3 || index === 4) return { spanClass: 'lg:col-span-2 md:col-span-1 col-span-1', isFeatured: false };
    return { spanClass: 'lg:col-span-3 md:col-span-1 col-span-1', isFeatured: index === 5 };
  }

  // General Adaptive Logic for N > 7:
  const remainder = totalCount % 3;

  // If remainder === 2 (e.g. 8, 11, 14):
  // The last 2 items span 3 cols each (3 + 3 = 6 cols).
  if (remainder === 2 && index >= totalCount - 2) {
    return { spanClass: 'lg:col-span-3 md:col-span-1 col-span-1', isFeatured: index === totalCount - 2 };
  }

  // If remainder === 1 (e.g. 10, 13, 16):
  // Row 1 has 2 items (4 + 2 = 6 cols), and last row has 2 items (3 + 3 = 6 cols).
  if (remainder === 1) {
    if (index === 0) return { spanClass: 'lg:col-span-4 md:col-span-1 col-span-1', isFeatured: true };
    if (index === 1) return { spanClass: 'lg:col-span-2 md:col-span-1 col-span-1', isFeatured: false };
    if (index >= totalCount - 2) {
      return { spanClass: 'lg:col-span-3 md:col-span-1 col-span-1', isFeatured: index === totalCount - 2 };
    }
  }

  // Default: Standard 3-per-row card (2 cols out of 6 cols)
  return { 
    spanClass: 'lg:col-span-2 md:col-span-1 col-span-1', 
    isFeatured: index === 0 
  };
}

