// 백엔드 없을 때 쓰는 목데이터. 백엔드 API 응답 형태와 최대한 맞춰둠.
export const MOCK = {
  dashboard: {
    balance: 8420000,
    kpis: [
      { k: "이번 달 지출", v: "₩ 1.8M", d: "▼ 5.2%", dir: "down", pct: 52, color: "var(--blue)" },
      { k: "최근 거래", v: "42건", d: "모두 정상", dir: "down", pct: 100, color: "var(--green)" },
      { k: "차단된 시도", v: "1건", d: "확인 요망", dir: "up", pct: 20, color: "var(--red)" },
      { k: "등록 기기", v: "2대", d: "정상", dir: "down", pct: 40, color: "var(--amber)" },
    ],
    alerts: [
      { color: "var(--red)", t: "차단된 결제 시도", m: "08-05 23:47 · ₩890,000", time: "확인" },
      { color: "var(--amber)", t: "해외 결제 검토 중", m: "본인 결제 맞나요?", time: "응답" },
      { color: "var(--green)", t: "새 기기 등록 완료", m: "iPhone · 서울", time: "2일 전" },
    ],
  },
  transactions: [
    { time: "08-06 14:22", name: "스타벅스 강남점", kind: "결제", amt: "₩ 6,300", status: "정상" },
    { time: "08-06 09:11", name: "온라인 결제 · 해외", kind: "결제", amt: "₩ 540,000", status: "검토중" },
    { time: "08-05 23:47", name: "알 수 없는 가맹점", kind: "결제", amt: "₩ 890,000", status: "차단됨" },
    { time: "08-05 18:30", name: "이체 · 김OO", kind: "이체", amt: "₩ 120,000", status: "정상" },
    { time: "08-05 12:05", name: "배달의민족", kind: "결제", amt: "₩ 23,000", status: "정상" },
    { time: "08-04 20:30", name: "CU 편의점", kind: "결제", amt: "₩ 8,900", status: "정상" },
    { time: "08-04 08:15", name: "지하철 교통카드", kind: "결제", amt: "₩ 1,400", status: "정상" },
  ],
  cards: [
    { title: "주거래 계좌", num: "•••• 8420", value: "₩ 8,420,000", bg: "linear-gradient(135deg,#1E40AF,#3B82F6)" },
    { title: "체크카드", num: "•••• 1207", value: "이번 달 ₩1.8M", small: true, bg: "linear-gradient(135deg,#334155,#0F172A)" },
    { title: "적금", num: "•••• 5531", value: "₩ 3,200,000", bg: "linear-gradient(135deg,#6D28D9,#4C1D95)" },
  ],
  spending: [
    { label: "식비·카페", amt: "₩ 620,000", pct: 82, color: "var(--blue)" },
    { label: "쇼핑", amt: "₩ 410,000", pct: 55, color: "#6366F1" },
    { label: "교통", amt: "₩ 180,000", pct: 24, color: "var(--green)" },
  ],
  reports: [
    { color: "var(--amber)", t: "본인 결제 아님", m: "₩890,000 · 08-05", status: "검토중" },
    { color: "var(--green)", t: "이중 청구", m: "₩12,000 · 07-28", status: "환불완료" },
  ],
  security: {
    toggles: { twofa: true, alert: true, oversea: false },
    devices: [
      { color: "var(--green)", t: "iPhone 15 · 현재 기기", m: "서울 · 방금 활동", trusted: true },
      { color: "var(--amber)", t: "Windows PC", m: "부산 · 3일 전", trusted: false },
    ],
    score: 82,
  },
};
