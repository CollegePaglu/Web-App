import { NativeAd, TestIds } from 'react-native-google-mobile-ads';

const AD_UNIT_ID = __DEV__
  ? TestIds.NATIVE
  : 'ca-app-pub-7084905674222579/2917773223';

const TARGET_POOL = 2;

let pool: NativeAd[] = [];
let inflightFills = 0;

async function loadOne(): Promise<NativeAd | null> {
  try {
    return await NativeAd.createForAdRequest(AD_UNIT_ID);
  } catch {
    return null;
  }
}

/** Fire-and-forget: keep a small pool so feed rows can show ads without cold latency. */
export function warmNativeAdPool(): void {
  const need = TARGET_POOL - pool.length - inflightFills;
  if (need <= 0) return;
  inflightFills += need;
  void (async () => {
    for (let i = 0; i < need; i++) {
      const ad = await loadOne();
      if (ad) pool.push(ad);
    }
    inflightFills -= need;
  })();
}

/** Returns a ready ad from the pool, or null (caller should load directly). */
export function acquirePooledNativeAd(): NativeAd | null {
  const ad = pool.shift() ?? null;
  warmNativeAdPool();
  return ad;
}
