import { useState } from "react";
import TopBar from "../TopBar.jsx";
import Panel from "../Panel.jsx";

// 목데이터 (나중에 백엔드 API로 교체)
const MOCK_REQUESTS = [
  { id: 201, user: "user***@naver.com", target: "계좌", targetNo: "110-***-4521", reason: "분실 의심", time: "2026-08-31 10:20", status: "PENDING" },
  { id: 202, user: "kim***@gmail.com", target: "카드", targetNo: "4521-****-1234", reason: "도용 의심", time: "2026-08-31 09:15", status: "PENDING" },
  { id: 203, user: "lee***@daum.net", target: "계좌", targetNo: "302-***-7788", reason: "본인 요청", time: "2026-08-30 22:40", status: "PENDING" },
  { id: 204, user: "park***@naver.com", target: "카드", targetNo: "5310-****-9900", reason: "이상거래 발견", time: "2026-08-30 18:12", status: "APPROVED" },
];

const STATUS = {
  PENDING: { label: "대기", color: "var(--amber)", bg: "rgba(217,119,6,0.12)" },
  APPROVED: { label: "승인됨", color: "var(--green)", bg: "rgba(5,150,105,0.12)" },
  REJECTED: { label: "거부됨", color: "var(--red)", bg: "rgba(220,38,38,0.12)" },
};

export default function AdminLockRequests() {
  const [requests, setRequests] = useState(MOCK_REQUESTS);
  const [filter, setFilter] = useState("ALL");

  const filtered = filter === "ALL" ? requests : requests.filter((r) => r.status === filter);
  const pendingCount = requests.filter((r) => r.status === "PENDING").length;

  function handle(id, decision) {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: decision === "approve" ? "APPROVED" : "REJECTED" } : r
      )
    );
    alert(decision === "approve" ? "잠금을 승인했습니다." : "요청을 거부했습니다.");
  }

  return (
    <>
      <TopBar title="잠금 요청 처리" crumb="관리자 / 요청 처리" search={false} />

      <div className="tabs" style={{ marginBottom: 16 }}>
        {[
          ["ALL", "전체"],
          ["PENDING", `대기 ${pendingCount}`],
          ["APPROVED", "승인됨"],
          ["REJECTED", "거부됨"],
        ].map(([key, label]) => (
          <button key={key} className={filter === key ? "on" : ""} onClick={() => setFilter(key)}>
            {label}
          </button>
        ))}
      </div>

      <Panel title="계좌·카드 잠금 요청" sub={`총 ${filtered.length}건`}>
        <table>
          <thead>
            <tr>
              <th>요청번호</th><th>회원</th><th>대상</th><th>번호</th>
              <th>사유</th><th>요청시각</th><th>상태</th><th>처리</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => {
              const s = STATUS[r.status];
              return (
                <tr key={r.id}>
                  <td className="tx">#{r.id}</td>
                  <td className="tx">{r.user}</td>
                  <td>
                    <span className="chip" style={{
                      color: r.target === "계좌" ? "var(--blue)" : "#7C3AED",
                      background: r.target === "계좌" ? "rgba(37,99,235,0.12)" : "rgba(124,58,237,0.12)"
                    }}>{r.target}</span>
                  </td>
                  <td className="tx">{r.targetNo}</td>
                  <td style={{ fontSize: 12.5 }}>{r.reason}</td>
                  <td style={{ fontSize: 11.5, color: "var(--muted)" }}>{r.time}</td>
                  <td><span className="chip" style={{ color: s.color, background: s.bg }}>{s.label}</span></td>
                  <td>
                    {r.status === "PENDING" ? (
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="minibtn warn" onClick={() => handle(r.id, "approve")}>잠금 승인</button>
                        <button className="minibtn" onClick={() => handle(r.id, "reject")}>거부</button>
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