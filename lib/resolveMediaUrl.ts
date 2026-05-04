const R2_PUBLIC_URL = "https://cdn.collegepaglu.com";

function looksLikeSchemelessHostPath(s: string): boolean {
  const t = s.replace(/^\/+/, '');
  const slash = t.indexOf('/');
  if (slash <= 0) return false;
  const host = t.slice(0, slash);
  return /^[a-z0-9][a-z0-9.-]*\.[a-z]{2,63}$/i.test(host);
}

function remapLegacyMediaHosts(url: string): string {
  try {
    let u = new URL(url);
    if (u.protocol === 'http:') {
      u.protocol = 'https:';
    }

    const embedded = u.pathname.match(/^\/([a-z0-9][a-z0-9.-]+\.[a-z]{2,63})\/(.+)$/i);
    if (embedded && u.hostname === 'r2.sagarteotia.in') {
      u = new URL(`https://${embedded[1]}/${embedded[2]}${u.search}${u.hash}`);
    }

    if (u.hostname === 'sagarteotia.in' || u.hostname === 'www.sagarteotia.in') {
      u.hostname = 'r2.sagarteotia.in';
    }
    return u.toString();
  } catch {
    return url;
  }
}

export function resolvePublicMediaUrl(raw: string | null | undefined): string {
  if (raw == null) return '';
  const s = String(raw).trim();
  if (!s) return '';
  
  if (/^file:\/\//i.test(s) || /^data:/i.test(s) || /^blob:/i.test(s)) return s;
  
  // Local paths or relative
  if (s.startsWith('/_next') || s.startsWith('/api') || s.startsWith('/images/')) return s;

  if (/^https?:\/\//i.test(s)) {
    return remapLegacyMediaHosts(s);
  }

  const withoutLeadingSlash = s.replace(/^\/+/, '');
  if (!withoutLeadingSlash) return '';

  if (looksLikeSchemelessHostPath(withoutLeadingSlash)) {
    return remapLegacyMediaHosts(`https://${withoutLeadingSlash}`);
  }

  const base = R2_PUBLIC_URL.replace(/\/+$/, '');
  return remapLegacyMediaHosts(`${base}/${withoutLeadingSlash}`);
}
