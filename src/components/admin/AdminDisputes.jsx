import { useState } from "react";
import TopBar from "../TopBar.jsx";
import Panel from "../Panel.jsx";

const MOCK_DISPUTES = [
  { id: 301, user: "user***@naver.com", caseNo: "#101", type: "차단 이의", content: "본인이 한 정상 결제인데 차단됐습니다.", amt: 2400000, time: "2026-08-31 11:02", status: "PENDING" },
  { id: 302, user: "kim***@gmail.com", caseNo: "#088", type: "금액 오류", content: "결제 금액이 실제와 다릅니다.", amt: 156000, time: "2026-08-31 08:30", status: "PENDING" },
  { id: 303, user: "lee***@daum.net", caseNo: "#075", type: "이중 청구", content: "같은 결제가 두 번 청구됐어요.", amt: 89000, time: "2026-08-30 20:15", status: "PENDING" },
  { id: 304, user: "park***@naver.com", caseNo: "#062", type: "차단 이의", content: "해외 출장 중 정상 사용입니다.", amt: 540000, time: "2026-08-30 14:22", status: "ACCEPTED" },
  { id: 305, user: "choi***@gmail.com", caseNo: "#051", type: "금액 오류", content: "부분 취소가 반영 안 됐습니다.", amt: 33000, time: "2026-08-29 17:40", status: "REJECTED" },
];

const STATUS = {
  PENDING: { label: "심사 대기", color: "var(--amber)", bg: "rgba(217,119,6,0.12)" },
  ACCEPTED: { label: "인정", color: "var(--green)", bg: "rgba(5,150,105,0.12)" },
  REJECTED: { label: "기각", color: "var(--red)", bg: "rgba(220,38,38,0.12)" },
};

export default function AdminDisputes() {
  const [disputes, setDisputes] = useState(MOCK_DISPUTES);
  const [filter, setFilter] = useState("ALL");

  const filtered = filter === "ALL" ? disputes : disputes.filter((d) => d.status === filter);
  const pendingCount = disputes.filter((d) => d.status === "PENDING").length;

  function handle(id, decision) {
    setDisputes((prev) =>
      prev.map((d) =>
        d.id === id ? { ...d, status: decision === "accept" ? "ACCEPTED" : "REJECTED" } : d
      )
    );
    alert(decision === "accept" ? "이의제기를 인정했습니다." : "이의제기를 기각했습니다.");
  }

  return (
    <>
      <TopBar title="이의제기 심사" crumb="관리자 / 요청 처리" search={false} />

      <div className="tabs" style={{ marginBottom: 16 }}>
        {[
          ["ALL", "전체"],
          ["PENDING", `대기 ${pendingCount}`],
          ["ACCEPTED", "인정"],
          ["REJECTED", "기각"],
        ].map(([key, label]) => (
          <button key={key} className={filter === key ? "on" : ""} onClick={() => setFilter(key)}>
            {label}
          </button>
        ))}
      </div>

      <Panel title="이의제기 목록" sub={`총 ${filtered.length}건`}>
        <table>
          <thead>
            <tr>
              <th>번호</th><th>회원</th><th>관련사건</th><th>유형</th>
              <th>내용</th><th>금액</th><th>상태</th><th>심사</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((d) => {
              const s = STATUS[d.status];
              return (
                <tr key={d.id}>
                  <td className="tx">#{d.id}</td>
                  <td className="tx">{d.user}</td>
                  <td className="tx">{d.caseNo}</td>
                  <td style={{ fontSize: 12 }}>{d.type}</td>
                  <td style={{ fontSize: 12, color: "var(--muted)", maxWidth: 220 }}>{d.content}</td>
                  <td className="amt">₩ {d.amt.toLocaleString()}</td>
                  <td><span className="chip" style={{ color: s.color, background: s.bg }}>{s.label}</span></td>
                  <td>
                    {d.status === "PENDING" ? (
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="minibtn" onClick={() => handle(d.id, "accept")}>인정</button>
                        <button className="minibtn warn" onClick={() => handle(d.id, "reject")}>기각</button>
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