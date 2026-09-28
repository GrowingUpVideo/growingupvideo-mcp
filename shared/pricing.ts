// The photo-size buckets a video can be bought at (ceilings, ascending).
export const SIZE_CAPS = [8, 12, 16, 20, 24] as const
export type Size = 8 | 12 | 16 | 20 | 24

// Redo allowance per size bucket.
export const REDOS_BY_SIZE: Record<Size, number> = { 8: 5, 12: 7, 16: 8, 20: 9, 24: 10 }

// Prices in USD, shared with the website. standard/premium are keyed by size bucket;
// *Original holds the struck list price.
export const PRICING = {
  trial: 4.9, // 5-photo taste tier (Standard model), once per user
  standard: { 8: 9.9, 12: 13.9, 16: 17.9, 20: 21.9, 24: 25.9 } as Record<Size, number>,
  standardOriginal: { 8: 12.9, 12: 17.9, 16: 22.9, 20: 27.9, 24: 32.9 } as Record<Size, number>,
  standardFeatured: 4.9,
  premium: { 8: 19.9, 12: 28.9, 16: 37.9, 20: 46.9, 24: 55.9 } as Record<Size, number>,
  premiumOriginal: { 8: 24.9, 12: 35.9, 16: 46.9, 20: 57.9, 24: 68.9 } as Record<Size, number>,
  premiumFeatured: 12.9,
} as const
