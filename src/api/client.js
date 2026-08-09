import CONFIG from '../config';

/**
 * API Client — Centralised GAS API layer
 * [LAW] text/plain Content-Type to bypass CORS preflight (§4.3)
 * [LAW] Retry with exponential backoff: 3 retries, 1s→2s→4s (§10.3)
 * [LAW] Never raw fetch() everywhere — one centralised API layer (§18)
 * [LAW] HTML error page detection for GAS redirects
 */

const CACHE = new Map();
const INFLIGHT = new Map();

function stableStringify(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(',')}}`;
}

function getAuthCacheScope(skipAuth) {
  if (skipAuth) return 'public';
  try {
    return localStorage.getItem('momo_token') || 'anonymous';
  } catch {
    return 'anonymous';
  }
}

function isAuthFailure(error) {
  const code = String(error?.code || '').toUpperCase();
  return code === '401' || code === '403' || code.includes('UNAUTHORIZED') || code.includes('FORBIDDEN')
    || /unauthorized|forbidden|invalid or expired session/i.test(error?.message || '');
}

/**
 * Call a GAS backend action
 * @param {string} action - Action name from PUBLIC/PROTECTED maps
 * @param {Object} data - Request payload
 * @param {Object} options - { cache, cacheTTL, skipAuth }
 * @returns {Promise<Object>} Response data
 */
export async function apiCall(action, data = {}, options = {}) {
  const {
    cache = false,
    cacheTTL = CONFIG.DATA.CACHE_TTL_MS,
    skipAuth = false,
  } = options;

  // Build cache key
  const cacheKey = cache
    ? `momo_c:${getAuthCacheScope(skipAuth)}:${action}:${stableStringify(data)}`
    : null;

  // Check cache (SWR pattern)
  if (cacheKey && CACHE.has(cacheKey)) {
    const cached = CACHE.get(cacheKey);
    if (Date.now() - cached.time < cacheTTL) {
      // Return cached, background revalidate if > 50% stale
      if (Date.now() - cached.time > cacheTTL / 2) {
        revalidateInBackground(action, data, cacheKey, options);
      }
      return cached.data;
    }
    CACHE.delete(cacheKey);
  }

  // Request deduplication for concurrent identical GETs
  if (cacheKey && INFLIGHT.has(cacheKey)) {
    return INFLIGHT.get(cacheKey);
  }

  const promise = executeRequest(action, data, skipAuth);

  if (cacheKey) {
    INFLIGHT.set(cacheKey, promise);
  }

  try {
    const result = await promise;
    if (cacheKey) {
      CACHE.set(cacheKey, { data: result, time: Date.now() });
      INFLIGHT.delete(cacheKey);
    }
    return result;
  } catch (err) {
    if (cacheKey) INFLIGHT.delete(cacheKey);
    throw err;
  }
}

/**
 * Execute the actual fetch with retry
 */
async function executeRequest(action, data, skipAuth) {
  const url = CONFIG.GAS_DEPLOY_URL;
  if (!url) {
    throw new Error('GAS backend not configured. Set CONFIG.GAS_DEPLOY_URL.');
  }

  // Attach auth token if available
  let token = null;
  if (!skipAuth) {
    try {
      token = localStorage.getItem('momo_token');
    } catch { /* safe */ }
  }

  const payload = JSON.stringify({
    action,
    token,
    ...data,
  });

  const { MAX_RETRIES, BACKOFF_BASE_MS, TIMEOUT_MS, CONTENT_TYPE } = CONFIG.API;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': CONTENT_TYPE },
        body: payload,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const text = await response.text();

      // [LAW] Detect HTML error pages from Google's auth proxy
      if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
        throw new Error('Received HTML response — GAS deployment may need reauthorization');
      }

      let result;
      try {
        result = JSON.parse(text);
      } catch {
        throw new Error(`Invalid JSON response: ${text.slice(0, 200)}`);
      }

      if (!result.success) {
        const err = new Error(result.error || 'Unknown error');
        err.code = result.code;
        throw err;
      }

      return result.data;
    } catch (err) {
      if (attempt === MAX_RETRIES) throw err;

      // Don't retry client errors (4xx equivalent)
      if (err.code && err.code >= 400 && err.code < 500) throw err;

      // Exponential backoff
      await new Promise((r) =>
        setTimeout(r, BACKOFF_BASE_MS * Math.pow(2, attempt)),
      );
    }
  }
}

/**
 * Background revalidation for SWR
 */
function revalidateInBackground(action, data, cacheKey, options) {
  executeRequest(action, data, options.skipAuth)
    .then((result) => {
      CACHE.set(cacheKey, { data: result, time: Date.now() });
    })
    .catch((error) => {
      // A session failure must never leave an authenticated stale snapshot available.
      if (isAuthFailure(error)) CACHE.delete(cacheKey);
    });
}

/**
 * Invalidate cache entries matching a prefix
 */
export function invalidateCache(actionPrefix) {
  for (const key of CACHE.keys()) {
    if (key.includes(actionPrefix)) {
      CACHE.delete(key);
    }
  }
}

/**
 * Clear entire cache
 */
export function clearCache() {
  CACHE.clear();
}

/* ─── Typed action helpers ─── */

export const api = {
  // Public
  register: (data) => apiCall('register', data, { skipAuth: true }),
  login: (data) => apiCall('login', data, { skipAuth: true }),
  loginOtp: (data) => apiCall('loginOtp', data, { skipAuth: true }),
  verifyOtp: (data) => apiCall('verifyOtp', data, { skipAuth: true }),
  loginPin: (data) => apiCall('loginPin', data, { skipAuth: true }),
  getPublicConfig: () => apiCall('getPublicConfig', {}, { skipAuth: true, cache: true }),
  submitFeedback: (data) => apiCall('submitFeedback', data, { skipAuth: true }),

  // Protected
  getMe: () => apiCall('getMe', {}, { cache: true, cacheTTL: 60000 }),
  updateProfile: (data) => apiCall('updateProfile', data),
  changePassword: (data) => apiCall('changePassword', data),
  setPin: (data) => apiCall('setPin', data),
  logout: () => apiCall('logout'),

  // Admin
  getUsers: () => apiCall('getUsers', {}, { cache: true }),
  updateUser: (data) => apiCall('updateUser', data),
  disableUser: (data) => apiCall('disableUser', data),
  getAnalytics: (params) => apiCall('getAnalytics', params, { cache: true }),
  getActivityLog: (params) => apiCall('getActivityLog', params),

  // GodMode
  getSystemConfig: () => apiCall('getSystemConfig'),
  updateSystemConfig: (data) => apiCall('updateSystemConfig', data),
  impersonateUser: (data) => apiCall('impersonateUser', data),
  getSiteUsage: (params) => apiCall('getSiteUsage', params),
};

export default api;
