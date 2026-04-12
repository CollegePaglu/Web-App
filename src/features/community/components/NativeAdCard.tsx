/**
 * NativeAdCard — Google AdMob Native Advanced, stable list height + warm pool.
 */
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import {
  NativeAd,
  NativeAdView,
  NativeAsset,
  NativeAssetType,
  NativeMediaView,
  TestIds,
} from 'react-native-google-mobile-ads';
import { useThemeColors } from '@/context/ThemeContext';
import { acquirePooledNativeAd } from '../nativeAdPool';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_PADDING = 16;
const AVATAR_SIZE = 40;

const AD_UNIT_ID = __DEV__
  ? TestIds.NATIVE
  : TestIds.NATIVE; // Replace with real ad unit ID in production';

/** Reserved height so feed rows don’t jump (header + media + body + CTA). */
export function getNativeAdCardMinHeight(width: number): number {
  return 64 + width * 0.6 + 132;
}

const MIN_H = getNativeAdCardMinHeight(SCREEN_WIDTH);

export const NativeAdCard: React.FC = () => {
  const uiColors = useThemeColors();
  const [nativeAd, setNativeAd] = useState<NativeAd | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const adRef = useRef<NativeAd | null>(null);

  useEffect(() => {
    let mounted = true;

    const pooled = acquirePooledNativeAd();
    if (pooled) {
      adRef.current = pooled;
      setNativeAd(pooled);
      setLoading(false);
    } else {
      NativeAd.createForAdRequest(AD_UNIT_ID)
        .then((ad) => {
          if (!mounted) {
            ad.destroy();
            return;
          }
          adRef.current = ad;
          setNativeAd(ad);
          setLoading(false);
        })
        .catch((e) => {
          console.warn('[NativeAdCard] Failed to load ad:', e);
          if (mounted) {
            setError(true);
            setLoading(false);
          }
        });
    }

    return () => {
      mounted = false;
      adRef.current?.destroy();
      adRef.current = null;
    };
  }, []);

  const shellStyle = [
    styles.shell,
    { backgroundColor: uiColors.surface, borderBottomColor: uiColors.border, minHeight: MIN_H },
  ];

  if (error || (!loading && !nativeAd)) {
    return <View style={shellStyle} />;
  }

  if (loading || !nativeAd) {
    return (
      <View style={shellStyle}>
        <ActivityIndicator size="small" color={uiColors.primary} style={styles.loader} />
      </View>
    );
  }

  return (
    <NativeAdView nativeAd={nativeAd} style={[styles.container, { backgroundColor: uiColors.surface, borderBottomColor: uiColors.border, minHeight: MIN_H }]}>
      <View style={styles.header}>
        {nativeAd.icon?.url ? (
          <NativeAsset assetType={NativeAssetType.ICON}>
            <Image source={{ uri: nativeAd.icon.url }} style={styles.avatar} />
          </NativeAsset>
        ) : (
          <View style={[styles.avatarPlaceholder, { backgroundColor: uiColors.surfaceHighlight }]}>
            <Text style={[styles.avatarText, { color: uiColors.primary }]}>Ad</Text>
          </View>
        )}

        <View style={styles.nameContainer}>
          <NativeAsset assetType={NativeAssetType.HEADLINE}>
            <Text style={[styles.userName, { color: uiColors.text }]} numberOfLines={1}>
              {nativeAd.headline}
            </Text>
          </NativeAsset>
          {nativeAd.advertiser ? (
            <NativeAsset assetType={NativeAssetType.ADVERTISER}>
              <Text style={[styles.advertiser, { color: uiColors.textTertiary }]} numberOfLines={1}>
                {nativeAd.advertiser}
              </Text>
            </NativeAsset>
          ) : null}
        </View>

        <View style={[styles.sponsoredBadge, { borderColor: uiColors.border }]}>
          <Text style={[styles.sponsoredText, { color: uiColors.textSecondary }]}>Sponsored</Text>
        </View>
      </View>

      <NativeMediaView style={styles.media} resizeMode="cover" />

      {nativeAd.body ? (
        <NativeAsset assetType={NativeAssetType.BODY}>
          <Text style={[styles.body, { color: uiColors.text }]} numberOfLines={2}>
            {nativeAd.body}
          </Text>
        </NativeAsset>
      ) : null}

      <View style={styles.actionsRow}>
        <NativeAsset assetType={NativeAssetType.CALL_TO_ACTION}>
          <TouchableOpacity style={[styles.ctaButton, { backgroundColor: uiColors.primary }]} activeOpacity={0.85}>
            <Text style={styles.ctaText}>{nativeAd.callToAction}</Text>
          </TouchableOpacity>
        </NativeAsset>
      </View>
    </NativeAdView>
  );
};

const styles = StyleSheet.create({
  shell: {
    borderBottomWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loader: {
    marginTop: 24,
  },
  container: {
    borderBottomWidth: 1,
    paddingBottom: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: CARD_PADDING,
    paddingVertical: 12,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    backgroundColor: '#E0E0E0',
  },
  avatarPlaceholder: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
  },
  nameContainer: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  advertiser: {
    fontSize: 11,
  },
  sponsoredBadge: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  sponsoredText: {
    fontSize: 10,
    fontWeight: '500',
  },
  media: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.6,
    backgroundColor: '#F0F0F0',
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: CARD_PADDING,
    paddingTop: 10,
  },
  actionsRow: {
    paddingHorizontal: CARD_PADDING,
    paddingTop: 12,
    paddingBottom: 16,
  },
  ctaButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
