import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import TopBar from "../TopBar";
import Panel from "../Panel";

export default function FraudReportsPage() {
  const location = useLocation();
  // 탭 상태: "history" (신고 내역 목록) 또는 "new" (새 신고 작성)
  const [activeTab, setActiveTab] = useState("history");

  // --- 1. 신고 내역 목록용 상태 ---
  const [reports, setReports] = useState([
    {
      id: "R-2026-001",
      category: "거래 신고",
      target: "APPLE.COM/BILL (₩ 129,000)",
      reason: "본인이 하지 않은 거래",
      requestedAt: "2026-08-28 10:15",
      status: "처리 중",
      adminComment: "담당 부서에서 부정 결제 여부를 조사 중입니다.",
    },
    {
      id: "R-2026-002",
      category: "카드 일시 잠금",
      target: "KB국민 로맨틱카드 (•••• 4821)",
      reason: "분실 우려 및 보안 잠금 요청",
      requestedAt: "2026-08-27 16:40",
      status: "승인 완료",
      adminComment: "관리자에 의해 카드 일시 잠금이 정상 처리되었습니다.",
    },
  ]);

  // --- 2. 새 신고 작성용 상태 ---
  const [selectedTransaction, setSelectedTransaction] = useState("");
  const [reason, setReason] = useState("");
  const [detail, setDetail] = useState("");

  const transactions = [
    { id: 1, merchant: "APPLE.COM/BILL", amount: 129000, occurredAt: "2026-08-28 09:42" },
    { id: 2, merchant: "쿠팡", amount: 78000, occurredAt: "2026-08-27 21:15" },
    { id: 3, merchant: "GOOGLE PAYMENT", amount: 45000, occurredAt: "2026-08-26 18:10" },
  ];

  // 이상거래 확인 페이지에서 "모르는 거래"를 눌러 넘어온 경우 자동으로 'new' 탭으로 열고 데이터 세팅
  useEffect(() => {
    if (location.state?.targetTransaction) {
      const target = location.state.targetTransaction;
      setActiveTab("new");
      setSelectedTransaction(target.id.toString());
      setReason("본인이 하지 않은 거래");
      setDetail(`[자동 연동] 이상거래 탐지 시스템에서 모르는 거래로 신고 접수된 항목입니다. (위험도: ${target.riskScore}%)`);
    }
  }, [location]);

  // 신고 접수 제출 핸들러
  const handleSubmitReport = (e) => {
    e.preventDefault();
    if (!selectedTransaction || !reason) {
      alert("신고할 거래와 신고 사유를 선택해주세요.");
      return;
    }

    const targetTx = transactions.find((t) => t.id.toString() === selectedTransaction);
    
    // 새 신고 항목을 목록에 추가
    const newReportItem = {
      id: `R-2026-00${reports.length + 1}`,
      category: "거래 신고",
      target: `${targetTx ? targetTx.merchant : "선택된 가맹점"} (₩ ${targetTx ? targetTx.amount.toLocaleString() : 0})`,
      reason: reason,
      requestedAt: "2026-08-28 12:00", // 현재 시간 가정
      status: "처리 중",
      adminComment: "관리자 검토 대기 중입니다.",
    };

    setReports([newReportItem, ...reports]);
    alert("거래 신고가 성공적으로 접수되었습니다.");

    // 초기화 후 내역 탭으로 이동
    setSelectedTransaction("");
    setReason("");
    setDetail("");
    setActiveTab("history");
  };

  // 신고 취소 핸들러
  const handleCancelReport = (id, status) => {
    if (status !== "처리 중") {
      alert("이미 처리 완료되었거나 반려된 건은 취소할 수 없습니다.");
      return;
    }
    if (!window.confirm("정말 해당 신고를 취소하시겠습니까?")) return;
    setReports((prev) => prev.filter((item) => item.id !== id));
    alert("신고가 취소되었습니다.");
  };

  return (
    <>
      <TopBar
        title="거래 신고 및 관리"
        crumb="홈 / 보안·신고 / 거래 신고 및 관리"
        search={false}
      />

      {/* 상단 탭 전환 버튼 영역 */}
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
          📋 신고 및 신청 내역
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
          ✍️ 새로운 거래 신고하기
        </button>
      </div>

      {/* 탭 1: 신고 및 신청 내역 목록 */}
      {activeTab === "history" && (
        <Panel title="신청/신고 현황" sub="접수된 거래 신고 및 보안 신청 내역 목록입니다.">
          {reports.length === 0 ? (
            <div style={{ padding: "50px 0", textAlign: "center", color: "var(--muted)", fontSize: "13px" }}>
              조회된 내역이 없습니다.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {reports.map((report) => {
                const statusColor = report.status === "승인 완료" ? "#22c55e" : report.status === "반려" ? "#ef4444" : "#f59e0b";
                return (
                  <div
                    key={report.id}
                    style={{
                      padding: "16px 20px",
                      borderRadius: "10px",
                      border: "1px solid var(--line)",
                      background: "var(--panel2)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <span style={{ fontSize: "11px", fontWeight: "700", padding: "3px 8px", borderRadius: "4px", background: "var(--panel)", border: "1px solid var(--line)", color: "var(--ink)" }}>
                          {report.category}
                        </span>
                        <span style={{ fontSize: "12px", color: "var(--muted)" }}>{report.id}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span style={{ fontSize: "12px", fontWeight: "700", color: statusColor }}>● {report.status}</span>
                        {report.status === "처리 중" && (
                          <button
                            type="button"
                            className="minibtn"
                            onClick={() => handleCancelReport(report.id, report.status)}
                            style={{ borderColor: "#ef4444", color: "#ef4444", padding: "4px 8px", fontSize: "11px" }}
                          >
                            접수 취소
                          </button>
                        )}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: "700", color: "var(--ink)", marginBottom: "4px" }}>
                        {report.target}
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--muted)" }}>
                        신고 사유: <strong>{report.reason}</strong>
                      </div>
                    </div>
                    <div style={{ marginTop: "4px", paddingTop: "10px", borderTop: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px" }}>
                      <div style={{ color: "var(--ink)" }}>
                        <span style={{ color: "var(--muted)", marginRight: "6px" }}>관리자 코멘트:</span>
                        {report.adminComment}
                      </div>
                      <div style={{ color: "var(--muted)", whiteSpace: "nowrap" }}>{report.requestedAt} 접수</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Panel>
      )}

      {/* 탭 2: 새로운 거래 신고 작성 폼 */}
      {activeTab === "new" && (
        <Panel title="거래 신고 접수" sub="본인이 이용하지 않은 의심 거래와 사유를 입력해주세요.">
          <form onSubmit={handleSubmitReport}>
            <div style={{ marginBottom: "22px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "var(--ink)", marginBottom: "8px" }}>
                신고할 거래
              </label>
              <select
                value={selectedTransaction}
                onChange={(e) => setSelectedTransaction(e.target.value)}
                style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid var(--line)", background: "var(--panel2)", color: "var(--ink)", fontSize: "13px", outline: "none" }}
              >
                <option value="">거래를 선택해주세요</option>
                {transactions.map((transaction) => (
                  <option key={transaction.id} value={transaction.id}>
                    {transaction.occurredAt} / {transaction.merchant} / ₩ {transaction.amount.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: "22px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "var(--ink)", marginBottom: "8px" }}>
                신고 사유
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
                {["본인이 하지 않은 거래", "결제 금액이 다름", "중복 결제", "알 수 없는 가맹점"].map((item) => (
                  <button
                    key={item}
                    type="button"
                    className="minibtn"
                    onClick={() => setReason(item)}
                    style={{
                      padding: "12px",
                      background: reason === item ? "var(--blue)" : "var(--panel2)",
                      color: reason === item ? "#fff" : "var(--ink)",
                      borderColor: reason === item ? "var(--blue)" : "var(--line)",
                    }}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: "22px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "var(--ink)", marginBottom: "8px" }}>
                상세 내용
              </label>
              <textarea
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                placeholder="거래와 관련된 내용을 입력해주세요."
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
                  setReason("");
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
                거래 신고하기
              </button>
            </div>
          </form>
        </Panel>
      )}
    </>
  );
}