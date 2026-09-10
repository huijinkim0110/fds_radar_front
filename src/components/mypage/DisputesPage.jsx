import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import TopBar from "../TopBar";
import Panel from "../Panel";
import { getMyFraudCases } from "../../api/fraud/fraudUserAPI";
import { getMyTransactions } from "../../api/transaction/transactionAPI";
import { useAuth } from "../../context/AuthContext.jsx";



export default function DisputesPage() {

  const { user } = useAuth();
  const userId = user?.userId ?? 1;

  
  const location = useLocation();

  // 탭 상태
  const [activeTab, setActiveTab] = useState("history");

  // 이의 제기 내역
  const [disputes, setDisputes] = useState([]);

  // 이의 제기 작성
  const [selectedTransaction, setSelectedTransaction] = useState("");
  const [reasonCategory, setReasonCategory] = useState("");
  const [detail, setDetail] = useState("");

  // 거래 목록
  const [transactions, setTransactions] = useState([]);


  // =========================================================
// 1. [GET] 대상 거래 목록 조회 (Transactions DB 연동)
// =========================================================
useEffect(() => {
  if (!userId) return;
  getMyTransactions(userId)
    .then((data) => {
      const list = data.content ? data.content : data;

      setTransactions(
        list.map((raw) => ({
          id: raw.transactionId, // PK
          merchant:
            raw.transactionType === "ACCOUNT_TRANSFER"
              ? raw.recipientName ?? "계좌이체"
              : raw.merchantName ?? "카드결제",
          amount: raw.amount,
          occurredAt: raw.occurredAt
            ? raw.occurredAt.replace("T", " ").slice(0, 16)
            : "-",
        }))
      );
    })
    .catch((error) => {
      console.error("대상 거래 내역 조회 실패:", error);
    });
}, [userId]);

  // =========================================================
  // 2. [GET] 이의 제기 내역 조회 (DB 연동)
  // =========================================================
  const fetchDisputes = async () => {
    try {
      const response = await fetch(
        `http://localhost:9090/api/dispute-requests/user/${userId}`
      );

      if (!response.ok) {
        throw new Error("이의 제기 내역 조회 실패");
      }

      const data = await response.json();
      console.log("이의 제기 내역 응답:", data);
      setDisputes(data);
    } catch (error) {
      console.error("이의 제기 내역 조회 실패:", error);
    }
  };

  useEffect(() => {
    if (!userId) return;
    fetchDisputes();
  }, [userId]);

  // =========================================================
  // 3. 외부/타 페이지에서 네비게이션으로 전달받은 경우 자동 선택
  // =========================================================
  useEffect(() => {
    if (location.state?.targetTransaction && transactions.length > 0) {
      const target = location.state.targetTransaction;

      const matchedTransaction = transactions.find(
        (transaction) => transaction.id === target.id
      );

      setActiveTab("new");

      if (matchedTransaction) {
        setSelectedTransaction(matchedTransaction.transactionId.toString());
      } else if (target.transactionId) {
        setSelectedTransaction(target.transactionId.toString());
      }

      setReasonCategory("중복 결제 승인");
      setDetail(
        `[자동 연동] 이의 제기 신청 대상 거래입니다. (위험도: ${target.riskScore}%)`
      );
    }
  }, [location, transactions]);

  // =========================================================
  // 4. [POST] 이의 제기 접수 및 DB 저장
  // =========================================================
  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!selectedTransaction || !reasonCategory) {
    alert("이의 제기할 거래와 사유를 선택해주세요.");
    return;
  }

  const parsedTransactionId = Number(selectedTransaction);

  // NaN 혹은 값이 비어있는지 2차 검증
  if (isNaN(parsedTransactionId) || !parsedTransactionId) {
    alert("올바른 거래를 선택해 주세요.");
    return;
  }

  const payload = {
    transactionId: parsedTransactionId,
    reason: reasonCategory,
    detail: detail,
  };

  // 💡 백엔드로 나가는 실제 데이터를 콘솔로 확인해보세요
  console.log("보내는 Payload 데이터:", payload);
  console.log("전송될 userId:", userId);

  try {
    const response = await fetch(
      `http://localhost:9090/api/dispute-requests/users/${userId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("이의 제기 접수 서버 응답:", response.status, errorText);
      throw new Error(`이의 제기 접수 실패 (${response.status}): ${errorText}`);
    }

    const newDispute = await response.json();
    console.log("이의 제기 접수 완료:", newDispute);

    alert("이의 제기가 성공적으로 접수되었습니다.");
    await fetchDisputes();

    setSelectedTransaction("");
    setReasonCategory("");
    setDetail("");
    setActiveTab("history");
  } catch (error) {
    console.error("이의 제기 접수 실패:", error);
    alert("이의 제기 접수 중 오류가 발생했습니다.");
  }
};

  // =========================================================
  // 5. 상태 표시 유틸리티
  // =========================================================
  const getStatusText = (status) => {
    switch (status) {
      case "RECEIVED":
      case "IN_REVIEW":
      case "심사 중":
        return "심사 중";
      case "APPROVED":
      case "PROCESSED":
      case "승인 완료":
        return "승인 완료";
      case "REJECTED":
      case "반려":
        return "반려";
      default:
        return status || "심사 중";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "APPROVED":
      case "PROCESSED":
      case "승인 완료":
        return "#22c55e";
      case "REJECTED":
      case "반려":
        return "#ef4444";
      case "RECEIVED":
      case "IN_REVIEW":
      default:
        return "#f59e0b";
    }
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

      {/* 탭 1: 이의 제기 신청 내역 목록 (GET) */}
      {activeTab === "history" && (
        <Panel title="이의 제기 현황" sub="접수된 결제 건에 대한 이의 제기 및 환급 심사 내역입니다.">
          {disputes.length === 0 ? (
            <div style={{ padding: "50px 0", textAlign: "center", color: "var(--muted)", fontSize: "13px" }}>
              조회된 이의 제기 내역이 없습니다.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {disputes.map((item) => {
                const transaction = transactions.find(
                  (tx) => tx.transactionId === item.transactionId
                );

                const statusText = getStatusText(item.status);
                const statusColor = getStatusColor(item.status);

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
                        <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--blue)" }}>
                          이의제기 #{item.id}
                        </span>
                      </div>
                      <span style={{ fontSize: "12px", fontWeight: "700", color: statusColor }}>
                        ● {statusText}
                      </span>
                    </div>

                    <div>
                      <div style={{ fontSize: "15px", fontWeight: "700", color: "var(--ink)", marginBottom: "4px" }}>
                        {transaction
                          ? `${transaction.merchant} (₩ ${Number(transaction.amount).toLocaleString()})`
                          : item.target || "거래 정보를 불러올 수 없습니다."}
                      </div>
                      <div style={{ fontSize: "13px", color: "var(--muted)" }}>
                        제기 사유: <strong style={{ color: "var(--ink)" }}>{item.reason}</strong>
                      </div>
                    </div>

                    <div style={{ paddingTop: "12px", borderTop: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px" }}>
                      <div style={{ color: "var(--ink)" }}>
                        <span style={{ color: "var(--muted)", marginRight: "6px" }}>처리 코멘트:</span>
                        {item.adminComment || "접수가 완료되어 담당자가 검토 중입니다."}
                      </div>
                      <div style={{ color: "var(--muted)", whiteSpace: "nowrap" }}>
                        {item.createdAt ? item.createdAt.replace("T", " ").slice(0, 16) : item.requestedAt || "-"} 접수
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Panel>
      )}

      {/* 탭 2: 새로운 이의 제기 작성 폼 (POST) */}
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
                    {tx.occurredAt} / {tx.merchant} / ₩ {Number(tx.amount).toLocaleString()}
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