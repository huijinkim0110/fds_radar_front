import { useEffect, useState } from "react";
import TopBar from "../TopBar.jsx";
import Panel from "../Panel.jsx";
import {
  getAllDisputeRequests,
  approveDisputeRequest,
  rejectDisputeRequest,
} from "../../api/dispute/disputeRequestAPI"; // [D파트 수정] mock 제거, 실제 API 연동

const STATUS = {
  RECEIVED: { label: "심사 대기", color: "var(--amber)", bg: "rgba(217,119,6,0.12)" }, // [D파트 수정] PENDING → RECEIVED
  APPROVED: { label: "인정", color: "var(--green)", bg: "rgba(5,150,105,0.12)" },       // [D파트 수정] ACCEPTED → APPROVED
  REJECTED: { label: "기각", color: "var(--red)", bg: "rgba(220,38,38,0.12)" },
};

export default function AdminDisputes() {
  const [disputes, setDisputes] = useState([]); // [D파트 수정] MOCK_DISPUTES 제거
  const [loading, setLoading] = useState(true); // [D파트 추가]
  const [filter, setFilter] = useState("ALL");

  // [D파트 추가]
  function loadDisputes() {
    setLoading(true);
    getAllDisputeRequests()
      .then(setDisputes)
      .catch(() => alert("이의제기 목록을 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadDisputes();
  }, []);

  const filtered = filter === "ALL" ? disputes : disputes.filter((d) => d.status === filter);
  const pendingCount = disputes.filter((d) => d.status === "RECEIVED").length; // [D파트 수정]

  function handleApprove(id) {
    if (!window.confirm("이의제기를 인정하시겠습니까?")) return; // [D파트 추가] 실행 전 확인창
    approveDisputeRequest(id)
      .then(() => { alert("이의제기를 인정했습니다."); loadDisputes(); })
      .catch(() => alert("처리 중 오류가 발생했습니다."));
    }

  function handleReject(id) {
    const reason = window.prompt("반려 사유를 입력하세요:");
    if (reason === null) return;
    rejectDisputeRequest(id, reason)
      .then(() => { alert("이의제기를 기각했습니다."); loadDisputes(); })
      .catch(() => alert("처리 중 오류가 발생했습니다."));
  }

  if (loading) return <div>불러오는 중...</div>; // [D파트 추가]

  return (
    <>
      <TopBar title="이의제기 심사" crumb="관리자 / 요청 처리" search={false} />

      <div className="tabs" style={{ marginBottom: 16 }}>
        {[
          ["ALL", "전체"],
          ["RECEIVED", `대기 ${pendingCount}`],
          ["APPROVED", "인정"],
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
              <th>번호</th><th>회원</th><th>대상거래</th><th>유형</th>
              <th>내용</th><th>금액</th><th>상태</th><th>심사</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((d) => {
              const s = STATUS[d.status] ?? { label: d.status, color: "var(--muted)", bg: "transparent" };
              return (
                <tr key={d.id}>
                  <td className="tx">#{d.id}</td>
                  <td className="tx">{d.userEmail}</td>
                  <td className="tx">거래 #{d.transactionId}</td>
                  <td style={{ fontSize: 12 }}>{d.disputeType}</td>
                  <td style={{ fontSize: 12, color: "var(--muted)", maxWidth: 220 }}>{d.requestReason}</td>
                  <td className="amt">₩ {(d.requestAmount ?? 0).toLocaleString()}</td>
                  <td><span className="chip" style={{ color: s.color, background: s.bg }}>{s.label}</span></td>
                  <td>
                    {d.status === "RECEIVED" ? (
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="minibtn" onClick={() => handleApprove(d.id)}>인정</button>
                        <button className="minibtn warn" onClick={() => handleReject(d.id)}>기각</button>
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