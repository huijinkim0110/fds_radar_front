import { useNavigate } from "react-router-dom";
import TopBar from "../TopBar.jsx";
import Panel from "../Panel.jsx";
import KpiCard from "../KpiCard.jsx";

// ── 목데이터 (나중에 백엔드 통계 API로 교체) ──
const MOCK = {
  kpis: [
    { k: "오늘 탐지된 이상거래", v: "12건", d: "어제 대비 +3", dir: "up", pct: 70, color: "var(--red)" },
    { k: "처리 대기 사건", v: "8건", d: "미검토", dir: "up", pct: 55, color: "var(--amber)" },
    { k: "대기 중 잠금 요청", v: "5건", d: "승인 대기", dir: "up", pct: 40, color: "var(--blue)" },
    { k: "미처리 이의제기", v: "3건", d: "심사 대기", dir: "up", pct: 25, color: "var(--amber)" },
  ],
  cases: [
    { id: 1, user: "user***@naver.com", amt: "₩ 2,400,000", risk: "HIGH", time: "10분 전", desc: "해외 결제 · 심야 다발" },
    { id: 2, user: "kim***@gmail.com", amt: "₩ 890,000", risk: "HIGH", time: "32분 전", desc: "알 수 없는 가맹점" },
    { id: 3, user: "lee***@daum.net", amt: "₩ 540,000", risk: "MEDIUM", time: "1시간 전", desc: "짧은 시간 반복 결제" },
    { id: 4, user: "park***@naver.com", amt: "₩ 1,200,000", risk: "MEDIUM", time: "2시간 전", desc: "평소와 다른 지역" },
  ],
  requests: [
    { type: "잠금 요청", who: "user***@naver.com", time: "15분 전", color: "var(--blue)" },
    { type: "이의제기", who: "choi***@gmail.com", time: "40분 전", color: "var(--amber)" },
    { type: "거래 신고", who: "jung***@daum.net", time: "1시간 전", color: "var(--red)" },
    { type: "잠금 요청", who: "han***@naver.com", time: "3시간 전", color: "var(--blue)" },
  ],
  system: {
    totalUsers: "1,284",
    todaySignup: "17",
    detectionRate: "97.8%",
    waitingChats: "4",
  },
};

const RISK_STYLE = {
  HIGH: { label: "높음", color: "var(--red)", bg: "rgba(220,38,38,0.12)" },
  MEDIUM: { label: "중간", color: "var(--amber)", bg: "rgba(217,119,6,0.12)" },
  LOW: { label: "낮음", color: "var(--green)", bg: "rgba(5,150,105,0.12)" },
};

export default function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <>
      <TopBar title="관리자 대시보드" crumb="관리자 / 전체 현황" search={false} />

      {/* 상단 KPI */}
      <div className="kpis">
        {MOCK.kpis.map((k, i) => <KpiCard key={i} {...k} />)}
      </div>

      <div className="cols">
        {/* 처리 대기 이상거래 사건 */}
        <Panel
          title="처리 대기 이상거래 사건"
          sub="위험도 높은 순"
          right={<div className="filterpill" style={{ cursor: "pointer" }} onClick={() => navigate("/mypage/admin-fraud-cases")}>전체 보기</div>}
        >
          <table>
            <thead>
              <tr>
                <th>회원</th><th>금액</th><th>내용</th><th>위험도</th><th>시간</th>
              </tr>
            </thead>
            <tbody>
              {MOCK.cases.map((c) => {
                const r = RISK_STYLE[c.risk];
                return (
                  <tr key={c.id} style={{ cursor: "pointer" }} onClick={() => navigate("/mypage/admin-fraud-cases")}>
                    <td className="tx">{c.user}</td>
                    <td className="amt">{c.amt}</td>
                    <td style={{ color: "var(--muted)", fontSize: 12 }}>{c.desc}</td>
                    <td>
                      <span className="chip" style={{ color: r.color, background: r.bg }}>{r.label}</span>
                    </td>
                    <td style={{ color: "var(--muted)", fontSize: 11.5 }}>{c.time}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Panel>

        {/* 시스템 현황 */}
        <Panel title="시스템 현황" sub="실시간">
          <div className="admin-stat">
            <div className="admin-stat-row">
              <span>전체 회원</span><b>{MOCK.system.totalUsers}명</b>
            </div>
            <div className="admin-stat-row">
              <span>오늘 가입</span><b>+{MOCK.system.todaySignup}명</b>
            </div>
            <div className="admin-stat-row">
              <span>이상거래 탐지율</span><b style={{ color: "var(--green)" }}>{MOCK.system.detectionRate}</b>
            </div>
            <div className="admin-stat-row">
              <span>상담 대기</span><b style={{ color: "var(--amber)" }}>{MOCK.system.waitingChats}건</b>
            </div>
          </div>
        </Panel>
      </div>

      {/* 새로 들어온 요청 */}
      <Panel title="새로 들어온 요청" sub="잠금·이의제기·신고" style={{ marginTop: 16 }}>
        <div className="feed">
          {MOCK.requests.map((r, i) => (
            <div className="fitem" key={i}>
              <span className="fdot" style={{ background: r.color }} />
              <div>
                <div className="ft">{r.type}</div>
                <div className="fm">{r.who}</div>
              </div>
              <div className="ftime">{r.time}</div>
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}