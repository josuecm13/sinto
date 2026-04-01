import Cookies from 'js-cookie';

const BASE_URL = import.meta.env.VITE_API_URL as string;

// ─── Cookie helpers ───────────────────────────────────────────────────────────

function isSecure(): boolean {
  return window.location.protocol === 'https:';
}

export function setTokens(accessToken: string, refreshToken: string): void {
  const secure = isSecure();
  Cookies.set('accessToken', accessToken, {
    expires: 1 / 96, // 15 minutes
    sameSite: 'strict',
    secure,
  });
  Cookies.set('refreshToken', refreshToken, {
    expires: 7, // 7 days
    sameSite: 'strict',
    secure,
  });
}

export function clearTokens(): void {
  Cookies.remove('accessToken');
  Cookies.remove('refreshToken');
}

// ─── 401 refresh state ────────────────────────────────────────────────────────

let refreshPromise: Promise<void> | null = null;

async function doRefresh(): Promise<void> {
  const refreshToken = Cookies.get('refreshToken');
  if (!refreshToken) {
    clearTokens();
    throw new Error('No refresh token available');
  }

  const response = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    clearTokens();
    throw new Error('Token refresh failed');
  }

  const data = (await response.json()) as { accessToken: string; refreshToken: string };
  setTokens(data.accessToken, data.refreshToken);
}

// ─── Core fetch ───────────────────────────────────────────────────────────────

async function internalFetch(path: string, options: RequestInit): Promise<Response> {
  const token = Cookies.get('accessToken');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers ?? {}),
  };
  return fetch(`${BASE_URL}${path}`, { ...options, headers });
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await internalFetch(path, options);

  if (response.status === 204) {
    return undefined as T;
  }

  if (response.status === 401) {
    // Queue all concurrent 401s behind a single refresh attempt
    if (!refreshPromise) {
      refreshPromise = doRefresh().finally(() => {
        refreshPromise = null;
      });
    }

    try {
      await refreshPromise;
    } catch (err) {
      throw err;
    }

    // Retry the original request once — use internalFetch to skip another 401-intercept
    const retryResponse = await internalFetch(path, options);

    if (retryResponse.status === 204) {
      return undefined as T;
    }

    const retryData = await retryResponse.json();

    if (!retryResponse.ok) {
      throw new Error(retryData?.message ?? `Request failed: ${retryResponse.status}`);
    }

    return retryData as T;
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message ?? `Request failed: ${response.status}`);
  }

  return data as T;
}
