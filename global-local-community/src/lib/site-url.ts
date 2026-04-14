const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1']);

function normalizeUrl(value: string) {
  return value.endsWith('/') ? value.slice(0, -1) : value;
}

function isLocalhostUrl(value: string) {
  try {
    const url = new URL(value);
    return LOCAL_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
}

export function getPreferredSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (configured) {
    if (typeof window !== 'undefined' && isLocalhostUrl(configured)) {
      return normalizeUrl(window.location.origin);
    }

    return normalizeUrl(configured);
  }

  if (typeof window !== 'undefined') {
    return normalizeUrl(window.location.origin);
  }

  return 'https://living-korea.com';
}

export function buildSiteUrl(path: string) {
  const base = getPreferredSiteUrl();
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}
