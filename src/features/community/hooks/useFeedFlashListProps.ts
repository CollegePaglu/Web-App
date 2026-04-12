import { useMemo } from 'react';
import { Platform, useWindowDimensions } from 'react-native';

/**
 * Tuned FlashList scroll props for post feeds (nested media, variable row height).
 * drawDistance scales with window height so tall phones prefetch more off-screen rows.
 *
 * FlashList v2 (@shopify/flash-list 2.x) has no `estimatedItemSize` prop; it estimates
 * from running averages (starting ~200px) until cells measure. Pair this with a fixed
 * media slot height in PostCardMedia so row heights stay stable when images load.
 */
export function useFeedFlashListProps() {
    const { height } = useWindowDimensions();
    return useMemo(
        () => ({
            drawDistance: Math.max(960, Math.round(height * 1.75)),
            overrideProps: { initialDrawBatchSize: 8 },
            /** Nested horizontal galleries + ads: clipping often causes jank on fast scroll */
            removeClippedSubviews: false,
            nestedScrollEnabled: true as const,
            scrollEventThrottle: 16,
            keyboardShouldPersistTaps: 'handled' as const,
            ...(Platform.OS === 'android' ? ({ overScrollMode: 'never' as const }) : {}),
        }),
        [height]
    );
}
