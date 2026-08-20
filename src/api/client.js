// ── API 클라이언트 ───────────────────────────────────────────────
// 백엔드(fds_radar_back, http://localhost:8080)로 요청을 보냄.
// vite.config.js의 proxy 덕분에 "/api/..." 로만 호출하면 8080으로 전달됨.
//
// USE_MOCK=true 면 백엔드 없이도 목데이터로 화면이 돌아감.
// 백엔드가 준비되면 false 로 바꾸거나, 환경변수로 빼면 됨.

import { MOCK } from "../data/mock.js";

export const USE_MOCK = true; // 백엔드 붙이면 false

// 로그인 시 저장해둔 JWT 토큰을 헤더에 실어줌 (너 A파트: 인증)
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
    // 토큰 만료/무효 → 로그인으로 (실제 프로젝트에선 라우터로 이동)
    throw new Error("인증이 필요합니다 (401)");
  }
  if (!res.ok) {
    throw new Error(`요청 실패: ${res.status}`);
  }
  return res.json();
}

// ── 각 API. USE_MOCK 이면 실제 호출 대신 목데이터를 잠깐 뒤 반환 ──
const delay = (data) => new Promise((r) => setTimeout(() => r(data), 300));

export const api = {
  // ── 인증 ──
  // 로그인: 성공 시 백엔드가 { accessToken } 반환 → localStorage 저장
  login: async ({ email, password }) => {
    if (USE_MOCK) {
      // 목: 아무 값이나 넣으면 통과, 이메일에 "admin" 들어가면 ADMIN
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

  signup: ({ name, email, password }) =>
    USE_MOCK
      ? delay({ ok: true })
      : request("/auth/signup", { method: "POST", body: JSON.stringify({ name, email, password }) }),

  logout: () => localStorage.removeItem("accessToken"),

  // 로그인 유저 정보. 이름/role은 코드에 박지 않고 JWT 토큰에서 꺼냄.
  getMe: () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return Promise.reject(new Error("로그인 안 됨"));
    if (USE_MOCK) {
      const payload = JSON.parse(atob(token.split(".")[1])); // JWT payload 디코드
      return delay({ name: payload.name, role: payload.role });
    }
    return request("/me"); // 실서버: 백엔드가 토큰 보고 내 정보 반환
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
