import { useState } from "react";
import TopBar from "../TopBar";
import Panel from "../Panel";

export default function DisputesPage() {
  const [activeTab, setActiveTab] = useState("history");

  // --- 1. 이의 제기 신청 내역 상태 ---
  const [disputes, setDisputes] = useState([
    {
      id: "DISP-2026-001",
      target: "스타벅스 강남점 (₩ 6,500)",
      reason: "중복 결제 승인",
      requestedAt: "2026-08-27 14:10",
      status: "심사 중",
      adminComment: "가맹점 매출 전표 확인을 요청하였습니다.",
    },
    {
      id: "DISP-2026-002",
      target: "해외 가맹점 승인 (₩ 45,000)",
      reason: "미승인 거래 (본인 미사용)",
      requestedAt: "2026-08-20 09:30",
      status: "승인 완료",
      adminComment: "오인 승인 확인되어 청구 취소(환급) 처리되었습니다.",
    },
  ]);

  // --- 2. 새로운 이의 제기 작성 폼 상태 ---
  const [selectedTransaction, setSelectedTransaction] = useState("");
  const [reasonCategory, setReasonCategory] = useState("");
  const [detail, setDetail] = useState("");

  // 이의 제기 대상이 될 수 있는 최근 거래 목록 예시
  const transactions = [
    { id: 1, merchant: "APPLE.COM/BILL", amount: 129000, occurredAt: "2026-08-28 09:42" },
    { id: 2, merchant: "쿠팡", amount: 78000, occurredAt: "2026-08-27 21:15" },
    { id: 3, merchant: "스타벅스 강남점", amount: 6500, occurredAt: "2026-08-26 14:20" },
  ];

  // 이의 제기 접수 핸들러
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedTransaction || !reasonCategory) {
      alert("이의 제기할 거래와 사유를 선택해주세요.");
      return;
    }

    const targetTx = transactions.find((t) => t.id.toString() === selectedTransaction);

    const newDispute = {
      id: `DISP-2026-00${disputes.length + 1}`,
      target: `${targetTx ? targetTx.merchant : "가맹점"} (₩ ${targetTx ? targetTx.amount.toLocaleString() : 0})`,
      reason: reasonCategory,
      requestedAt: "2026-08-28 17:00", // 현재 시간 가정
      status: "심사 중",
      adminComment: "접수가 완료되어 담당자가 검토 중입니다.",
    };

    setDisputes([newDispute, ...disputes]);
    alert("이의 제기가 성공적으로 접수되었습니다.");

    // 폼 초기화 및 내역 탭으로 이동
    setSelectedTransaction("");
    setReasonCategory("");
    setDetail("");
    setActiveTab("history");
  };

  // 접수 취소 핸들러
  const handleCancel = (id, status) => {
    if (status !== "심사 중") {
      alert("이미 심사가 완료되었거나 처리된 건은 취소할 수 없습니다.");
      return;
    }
    if (!window.confirm("정말 이의 제기를 취소하시겠습니까?")) return;
    setDisputes((prev) => prev.filter((item) => item.id !== id));
    alert("이의 제기가 취소되었습니다.");
  };

  return (
    <>
      <TopBar
        title="이의 제기 관리"
        crumb="홈 / 보안·신고 / 이의 제기"
        search={false}
      />

      {/* 상단 탭 전환 버튼 */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
        <button
          type="button"
          onClick={() => setActiveTab("history")}
          style={{
            padding: "10px 20px",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: "700",
            cursor: "pointer",
            background: activeTab === "history" ? "var(--blue)" : "var(--panel)",
            color: activeTab === "history" ? "#fff" : "var(--ink)",
            border: "1px solid var(--line)",
          }}
        >
          📋 이의 제기 내역
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("new")}
          style={{
            padding: "10px 20px",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: "700",
            cursor: "pointer",
            background: activeTab === "new" ? "var(--blue)" : "var(--panel)",
            color: activeTab === "new" ? "#fff" : "var(--ink)",
            border: "1px solid var(--line)",
          }}
        >
          ✍️ 새로운 이의 제기 신청
        </button>
      </div>

      {/* 탭 1: 이의 제기 신청 내역 목록 */}
      {activeTab === "history" && (
        <Panel title="이의 제기 현황" sub="접수된 결제 건에 대한 이의 제기 및 환급 심사 내역입니다.">
          {disputes.length === 0 ? (
            <div style={{ padding: "50px 0", textAlign: "center", color: "var(--muted)", fontSize: "13px" }}>
              조회된 이의 제기 내역이 없습니다.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {disputes.map((item) => {
                const statusColor = item.status === "승인 완료" ? "#22c55e" : item.status === "반려" ? "#ef4444" : "#f59e0b";
                return (
                  <div
                    key={item.id}
                    style={{
                      padding: "20px",
                      borderRadius: "12px",
                      border: "1px solid var(--line)",
                      background: "var(--panel2)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--blue)" }}>{item.id}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span style={{ fontSize: "12px", fontWeight: "700", color: statusColor }}>● {item.status}</span>
                        {item.status === "심사 중" && (
                          <button
                            type="button"
                            className="minibtn"
                            onClick={() => handleCancel(item.id, item.status)}
                            style={{ borderColor: "#ef4444", color: "#ef4444", padding: "4px 8px", fontSize: "11px" }}
                          >
                            접수 취소
                          </button>
                        )}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: "15px", fontWeight: "700", color: "var(--ink)", marginBottom: "4px" }}>
                        {item.target}
                      </div>
                      <div style={{ fontSize: "13px", color: "var(--muted)" }}>
                        제기 사유: <strong style={{ color: "var(--ink)" }}>{item.reason}</strong>
                      </div>
                    </div>

                    <div style={{ paddingTop: "12px", borderTop: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px" }}>
                      <div style={{ color: "var(--ink)" }}>
                        <span style={{ color: "var(--muted)", marginRight: "6px" }}>처리 코멘트:</span>
                        {item.adminComment}
                      </div>
                      <div style={{ color: "var(--muted)", whiteSpace: "nowrap" }}>{item.requestedAt} 접수</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Panel>
      )}

      {/* 탭 2: 새로운 이의 제기 작성 폼 */}
      {activeTab === "new" && (
        <Panel title="이의 제기 신청" sub="부당한 청구, 중복 결제 등 결제 건에 대해 이의를 제기할 수 있습니다.">
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "22px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "var(--ink)", marginBottom: "8px" }}>
                대상 거래 선택
              </label>
              <select
                value={selectedTransaction}
                onChange={(e) => setSelectedTransaction(e.target.value)}
                style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid var(--line)", background: "var(--panel2)", color: "var(--ink)", fontSize: "13px", outline: "none" }}
              >
                <option value="">이의 제기할 거래를 선택해주세요</option>
                {transactions.map((tx) => (
                  <option key={tx.id} value={tx.id}>
                    {tx.occurredAt} / {tx.merchant} / ₩ {tx.amount.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: "22px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "var(--ink)", marginBottom: "8px" }}>
                이의 제기 사유
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
                {["중복 결제 승인", "서비스 미제공/미이용", "결제 금액 상이", "취소 후 미환급"].map((item) => (
                  <button
                    key={item}
                    type="button"
                    className="minibtn"
                    onClick={() => setReasonCategory(item)}
                    style={{
                      padding: "12px",
                      background: reasonCategory === item ? "var(--blue)" : "var(--panel2)",
                      color: reasonCategory === item ? "#fff" : "var(--ink)",
                      borderColor: reasonCategory === item ? "var(--blue)" : "var(--line)",
                    }}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: "22px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "var(--ink)", marginBottom: "8px" }}>
                상세 사유 및 증빙 내용
              </label>
              <textarea
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                placeholder="상세한 사유를 입력해주시면 신속한 심사에 도움이 됩니다."
                rows={6}
                style={{ width: "100%", resize: "vertical", padding: "12px", boxSizing: "border-box", borderRadius: "8px", border: "1px solid var(--line)", background: "var(--panel2)", color: "var(--ink)", fontSize: "13px", fontFamily: "inherit", outline: "none" }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <button
                type="button"
                className="minibtn"
                onClick={() => {
                  setSelectedTransaction("");
                  setReasonCategory("");
                  setDetail("");
                }}
              >
                초기화
              </button>
              <button
                type="submit"
                className="minibtn"
                style={{ background: "var(--blue)", color: "#fff", borderColor: "var(--blue)" }}
              >
                이의 제기 접수하기
              </button>
            </div>
          </form>
        </Panel>
      )}
    </>
  );
}