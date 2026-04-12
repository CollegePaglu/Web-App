import React, { useMemo } from 'react';
import { Image, StyleProp, ImageStyle, ImageResizeMode } from 'react-native';
import { resolvePublicMediaUrl } from '@/utils/resolvePublicMediaUrl';

/** Same values as expo-image `contentFit` (call sites unchanged). */
export type AppImageContentFit = 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';

export interface AppImageProps {
  uri: string;
  style?: StyleProp<ImageStyle>;
  contentFit?: AppImageContentFit;
  /** Fires when natural size is known (remote images). */
  onLoadDimensions?: (width: number, height: number) => void;
  /** Fires when the image has finished loading. */
  onLoadEnd?: () => void;
  onError?: () => void;
  accessibilityLabel?: string;
}

function contentFitToResizeMode(fit: AppImageContentFit): ImageResizeMode {
  switch (fit) {
    case 'contain':
    case 'scale-down':
      return 'contain';
    case 'fill':
      return 'stretch';
    case 'none':
      return 'center';
    case 'cover':
    default:
      return 'cover';
  }
}

/** Resolved once: native module missing until dev client is rebuilt with expo-image. */
const ExpoImageNative: React.ComponentType<Record<string, unknown>> | null = (() => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('expo-image').Image;
  } catch {
    return null;
  }
})();

/**
 * Uses `expo-image` when linked; otherwise RN `Image`.
 * All remote URIs go through resolvePublicMediaUrl (CDN / scheme-less host / keys).
 */
export const AppImage: React.FC<AppImageProps> = ({
  uri,
  style,
  contentFit = 'cover',
  onLoadDimensions,
  onLoadEnd,
  onError,
  accessibilityLabel,
}) => {
  const resizeMode = useMemo(() => contentFitToResizeMode(contentFit), [contentFit]);
  const resolvedUri = useMemo(() => resolvePublicMediaUrl(uri), [uri]);

  if (!resolvedUri) {
    return null;
  }

  if (ExpoImageNative) {
    return (
      <ExpoImageNative
        source={{ uri: resolvedUri }}
        style={style}
        contentFit={contentFit}
        cachePolicy="memory-disk"
        recyclingKey={resolvedUri}
        accessibilityLabel={accessibilityLabel}
        onLoad={
          onLoadDimensions
            ? (e: { source: { width: number; height: number } }) => {
                const w = e.source.width;
                const h = e.source.height;
                if (w > 0 && h > 0) onLoadDimensions(w, h);
              }
            : undefined
        }
        onLoadEnd={onLoadEnd}
        onError={onError}
      />
    );
  }

  return (
    <Image
      source={{ uri: resolvedUri }}
      style={style}
      resizeMode={resizeMode}
      accessibilityLabel={accessibilityLabel}
      onError={onError}
      onLoad={
        onLoadDimensions || onLoadEnd
          ? (e) => {
              if (onLoadDimensions) {
                const src = e.nativeEvent.source;
                const w = src?.width;
                const h = src?.height;
                if (w && h && w > 0 && h > 0) onLoadDimensions(w, h);
              }
              onLoadEnd?.();
            }
          : undefined
      }
    />
  );
};
