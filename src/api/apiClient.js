import config from '../config/config';

let isRefreshing = false;
let refreshWaiters = [];

function getAccessToken() {
  return localStorage.getItem('accessToken');
}

function getRefreshToken() {
  return localStorage.getItem('refreshToken');
}

function setTokens({ accessToken, refreshToken }) {
  localStorage.setItem('accessToken', accessToken);
  if (refreshToken) {
    localStorage.setItem('refreshToken', refreshToken);
  }
}

function clearTokens() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
}

async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error('refresh token 없음');

  const res = await fetch(`${config.baseURL}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) throw new Error('refresh 실패');

  const data = await res.json();
  setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
  return data.accessToken;
}

function waitForRefresh() {
  return new Promise((resolve, reject) => {
    refreshWaiters.push({ resolve, reject });
  });
}

function notifyWaiters(error, token) {
  refreshWaiters.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  refreshWaiters = [];
}

export async function apiFetch(path, options = {}) {
  const url = path.startsWith('http') ? path : `${config.baseURL}${path}`;

  const doFetch = (token) =>
    fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });

  let res = await doFetch(getAccessToken());

  if (res.status === 401 && getRefreshToken()) {
    let newToken;

    if (isRefreshing) {
      newToken = await waitForRefresh();
    } else {
      isRefreshing = true;
      try {
        newToken = await refreshAccessToken();
        notifyWaiters(null, newToken);
      } catch (err) {
        notifyWaiters(err, null);
        clearTokens();
        window.location.href = '/login';
        throw err;
      } finally {
        isRefreshing = false;
      }
    }

    res = await doFetch(newToken);
  }

  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    throw new Error(errorBody?.message || `요청 실패: ${res.status}`);
  }

  if (res.status === 204) return null;

  const text = await res.text();
  if (!text) return null;

  return JSON.parse(text);
}