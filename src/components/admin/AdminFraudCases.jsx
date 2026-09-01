import { useState } from "react";
import TopBar from "../TopBar.jsx";
import Panel from "../Panel.jsx";

// 목데이터 (나중에 백엔드 fraudCaseAPI로 교체)
const MOCK_CASES = [
  { id: 101, user: "user***@naver.com", amt: 2400000, risk: "HIGH", score: 0.94, time: "2026-08-31 10:12", desc: "해외 결제 · 심야 다발", status: "PENDING" },
  { id: 102, user: "kim***@gmail.com", amt: 890000, risk: "HIGH", score: 0.91, time: "2026-08-31 09:40", desc: "알 수 없는 가맹점", status: "PENDING" },
  { id: 103, user: "lee***@daum.net", amt: 540000, risk: "MEDIUM", score: 0.83, time: "2026-08-31 08:55", desc: "짧은 시간 반복 결제", status: "PENDING" },
  { id: 104, user: "park***@naver.com", amt: 1200000, risk: "MEDIUM", score: 0.81, time: "2026-08-30 23:18", desc: "평소와 다른 지역", status: "REVIEWING" },
  { id: 105, user: "choi***@gmail.com", amt: 320000, risk: "LOW", score: 0.73, time: "2026-08-30 21:05", desc: "신규 가맹점 결제", status: "RESOLVED" },
];

const RISK = {
  HIGH: { label: "높음", color: "var(--red)", bg: "rgba(220,38,38,0.12)" },
  MEDIUM: { label: "중간", color: "var(--amber)", bg: "rgba(217,119,6,0.12)" },
  LOW: { label: "낮음", color: "var(--green)", bg: "rgba(5,150,105,0.12)" },
};

const STATUS = {
  PENDING: { label: "미검토", color: "var(--red)", bg: "rgba(220,38,38,0.12)" },
  REVIEWING: { label: "검토중", color: "var(--amber)", bg: "rgba(217,119,6,0.12)" },
  RESOLVED: { label: "처리완료", color: "var(--green)", bg: "rgba(5,150,105,0.12)" },
};

export default function AdminFraudCases() {
  const [cases, setCases] = useState(MOCK_CASES);
  const [filter, setFilter] = useState("ALL");

  const filtered = filter === "ALL" ? cases : cases.filter((c) => c.status === filter);

  // 판정 처리 (목: 화면에서 상태만 변경)
  function judge(id, decision) {
    setCases((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: decision === "block" ? "RESOLVED" : "RESOLVED" } : c
      )
    );
    alert(decision === "block" ? "차단 처리했습니다." : "정상 처리했습니다.");
  }

  return (
    <>
      <TopBar title="이상거래 사건" crumb="관리자 / 이상거래 관리" search={false} />

      {/* 상태 필터 */}
      <div className="tabs" style={{ marginBottom: 16 }}>
        {[
          ["ALL", "전체"],
          ["PENDING", "미검토"],
          ["REVIEWING", "검토중"],
          ["RESOLVED", "처리완료"],
        ].map(([key, label]) => (
          <button key={key} className={filter === key ? "on" : ""} onClick={() => setFilter(key)}>
            {label}
          </button>
        ))}
      </div>

      <Panel title="탐지된 이상거래" sub={`총 ${filtered.length}건`}>
        <table>
          <thead>
            <tr>
              <th>사건번호</th><th>회원</th><th>금액</th><th>내용</th>
              <th>위험도</th><th>AI점수</th><th>탐지시각</th><th>상태</th><th>처리</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => {
              const r = RISK[c.risk];
              const s = STATUS[c.status];
              return (
                <tr key={c.id}>
                  <td className="tx">#{c.id}</td>
                  <td className="tx">{c.user}</td>
                  <td className="amt">₩ {c.amt.toLocaleString()}</td>
                  <td style={{ fontSize: 12, color: "var(--muted)" }}>{c.desc}</td>
                  <td><span className="chip" style={{ color: r.color, background: r.bg }}>{r.label}</span></td>
                  <td className="tx">{c.score}</td>
                  <td style={{ fontSize: 11.5, color: "var(--muted)" }}>{c.time}</td>
                  <td><span className="chip" style={{ color: s.color, background: s.bg }}>{s.label}</span></td>
                  <td>
                    {c.status !== "RESOLVED" ? (
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="minibtn warn" onClick={() => judge(c.id, "block")}>차단</button>
                        <button className="minibtn" onClick={() => judge(c.id, "pass")}>정상</button>
                      </div>
                    ) : (
                      <span style={{ fontSize: 11.5, color: "var(--muted)" }}>완료</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Panel>
    </>
  );
}