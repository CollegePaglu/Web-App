/**
 * Feed layout constants for list scroll stability.
 *
 * FlashList v2 measures real row heights; wildly changing heights after image decode
 * cause relayout and scroll jitter. Keep the media region a fixed height so rows
 * stay stable from the first layout pass.
 */
export function getFeedMediaSlotHeight(screenWidth: number): number {
  return Math.min(Math.round(screenWidth * 1.2), 600);
}
