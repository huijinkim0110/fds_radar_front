import { useState } from "react";
import TopBar from "../TopBar.jsx";
import Panel from "../Panel.jsx";

const MOCK_REPORTS = [
  { id: 401, user: "user***@naver.com", type: "본인 결제 아님", target: "알 수 없는 가맹점", amt: 890000, time: "2026-08-31 10:45", status: "PENDING" },
  { id: 402, user: "kim***@gmail.com", type: "이중 청구됨", target: "온라인 결제 · 해외", amt: 540000, time: "2026-08-31 09:20", status: "PENDING" },
  { id: 403, user: "lee***@daum.net", type: "금액이 다름", target: "편의점 결제", amt: 12000, time: "2026-08-30 22:10", status: "PROCESSING" },
  { id: 404, user: "park***@naver.com", type: "본인 결제 아님", target: "게임 아이템 결제", amt: 330000, time: "2026-08-30 16:55", status: "DONE" },
];

const STATUS = {
  PENDING: { label: "접수", color: "var(--red)", bg: "rgba(220,38,38,0.12)" },
  PROCESSING: { label: "처리중", color: "var(--amber)", bg: "rgba(217,119,6,0.12)" },
  DONE: { label: "처리완료", color: "var(--green)", bg: "rgba(5,150,105,0.12)" },
};

export default function AdminReports() {
  const [reports, setReports] = useState(MOCK_REPORTS);
  const [filter, setFilter] = useState("ALL");

  const filtered = filter === "ALL" ? reports : reports.filter((r) => r.status === filter);
  const pendingCount = reports.filter((r) => r.status === "PENDING").length;

  function handle(id, next) {
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: next } : r))
    );
    alert(next === "PROCESSING" ? "처리를 시작했습니다." : "처리를 완료했습니다.");
  }

  return (
    <>
      <TopBar title="신고 처리" crumb="관리자 / 요청 처리" search={false} />

      <div className="tabs" style={{ marginBottom: 16 }}>
        {[
          ["ALL", "전체"],
          ["PENDING", `접수 ${pendingCount}`],
          ["PROCESSING", "처리중"],
          ["DONE", "완료"],
        ].map(([key, label]) => (
          <button key={key} className={filter === key ? "on" : ""} onClick={() => setFilter(key)}>
            {label}
          </button>
        ))}
      </div>

      <Panel title="거래 신고 목록" sub={`총 ${filtered.length}건`}>
        <table>
          <thead>
            <tr>
              <th>번호</th><th>회원</th><th>신고유형</th><th>대상거래</th>
              <th>금액</th><th>접수시각</th><th>상태</th><th>처리</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => {
              const s = STATUS[r.status];
              return (
                <tr key={r.id}>
                  <td className="tx">#{r.id}</td>
                  <td className="tx">{r.user}</td>
                  <td style={{ fontSize: 12 }}>{r.type}</td>
                  <td style={{ fontSize: 12, color: "var(--muted)" }}>{r.target}</td>
                  <td className="amt">₩ {r.amt.toLocaleString()}</td>
                  <td style={{ fontSize: 11.5, color: "var(--muted)" }}>{r.time}</td>
                  <td><span className="chip" style={{ color: s.color, background: s.bg }}>{s.label}</span></td>
                  <td>
                    {r.status === "PENDING" ? (
                      <button className="minibtn" onClick={() => handle(r.id, "PROCESSING")}>처리 시작</button>
                    ) : r.status === "PROCESSING" ? (
                      <button className="minibtn" onClick={() => handle(r.id, "DONE")}>완료</button>
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