// ── API 클라이언트 ───────────────────────────────────────────────
import { MOCK } from "../data/mock.js";

export const USE_MOCK = false; 

function authHeader() {
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
  const res = await fetch(`/api${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeader(),
      ...(options.headers || {}),
    },
    ...options,
  });

  if (res.status === 401) {
    throw new Error("인증이 필요합니다 (401)");
  }
  if (!res.ok) {
    throw new Error(`요청 실패: ${res.status}`);
  }
  return res.json();
}

const delay = (data) => new Promise((r) => setTimeout(() => r(data), 300));

export const api = {
  // ── 인증 ──
  login: async ({ email, password }) => {
    if (USE_MOCK) {
      const role = email.includes("admin") ? "ADMIN" : "USER";
      const name = email.split("@")[0] || "사용자";
      const token = "eyJhbGciOiJub25lIn0." + btoa(JSON.stringify({ name, role })) + ".";
      localStorage.setItem("accessToken", token);
      return delay({ accessToken: token });
    }
    const data = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem("accessToken", data.accessToken);
    return data;
  },

  signup: ({ name, email, password, birthDate, phoneNumber }) =>
  USE_MOCK
    ? delay({ ok: true })
    : request("/auth/signup", {
        method: "POST",
        body: JSON.stringify({ name, email, password, birthDate, phoneNumber }),
      }),
      
  logout: () => localStorage.removeItem("accessToken"),

  getMe: () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return Promise.reject(new Error("로그인 안 됨"));
    if (USE_MOCK) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return delay({ name: payload.name, role: payload.role });
    }
    return request("/me");
  },

  // ── 송금 — USE_MOCK 무관하게 실제 백엔드로 (테스트용, JWT 붙으면 수정)
  transfer: async ({ amount }) => {
    const res = await fetch("http://localhost:9090/api/transactions/transfer?userId=1", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fromAccountId: 1,
        recipientId: 1,
        amount,
        channel: "APP",
        idempotencyKey: crypto.randomUUID(),
      }),
    });
    if (!res.ok) throw new Error("송금 실패");
    return res.json();
  },

  getTransactions: () =>
    USE_MOCK ? delay(MOCK.transactions) : request("/me/transactions"),

  getDashboard: () =>
    USE_MOCK ? delay(MOCK.dashboard) : request("/me/dashboard"),

  getCards: () =>
    USE_MOCK ? delay(MOCK.cards) : request("/me/cards"),

  getReports: () =>
    USE_MOCK ? delay(MOCK.reports) : request("/me/reports"),

  submitReport: (payload) =>
    USE_MOCK
      ? delay({ ok: true })
      : request("/me/reports", { method: "POST", body: JSON.stringify(payload) }),

  getSecurity: () =>
    USE_MOCK ? delay(MOCK.security) : request("/me/security"),

  updateSecurity: (payload) =>
    USE_MOCK
      ? delay({ ok: true })
      : request("/me/security", { method: "PATCH", body: JSON.stringify(payload) }),
};

