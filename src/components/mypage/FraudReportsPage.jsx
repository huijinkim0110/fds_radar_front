import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import TopBar from "../TopBar";
import Panel from "../Panel";
import { getMyFraudCases } from "../../api/fraud/fraudUserAPI";
import { useAuth } from "../../context/AuthContext.jsx";

export default function FraudReportsPage() {

  const { user } = useAuth();
  const userId = user?.userId ?? 1;

  const location = useLocation();

  // 탭 상태
  const [activeTab, setActiveTab] = useState("history");

  // 신고 내역
  const [reports, setReports] = useState([]);

  // 신고 작성
  const [selectedTransaction, setSelectedTransaction] = useState("");
  const [reason, setReason] = useState("");
  const [detail, setDetail] = useState("");

  // 거래 목록
  const [transactions, setTransactions] = useState([]);


  // =========================================================
  // 이상거래 목록 조회
  // =========================================================
  useEffect(() => {
    getMyFraudCases(userId)
      .then((data) => {
        setTransactions(
          data.map((raw) => ({
            // 이상거래 확인 페이지에서 사용하는 ID
            id: raw.fraudCaseId,

            // 신고 API에서 실제로 필요한 거래 ID
            transactionId: raw.transactionId,

            merchant: raw.merchantName,
            amount: raw.amount,
            occurredAt: raw.transactionOccurredAt,
            riskScore: Math.round(
              (raw.fraudProbability ?? 0) * 100
            ),
          }))
        );
      })
      .catch((error) => {
        console.error("이상거래 내역 조회 실패:", error);
      });
  }, []);

  // =========================================================
  // 신고 내역 조회
  // =========================================================
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch(
          `http://localhost:9090/api/fraud-reports/user/${userId}`
        );

        if (!response.ok) {
          throw new Error("신고 내역 조회 실패");
        }

        const data = await response.json();

        console.log("신고 내역 응답:", data);

        setReports(data);
      } catch (error) {
        console.error("신고 내역 조회 실패:", error);
      }
    };

    fetchReports();
  }, []);

  // =========================================================
  // 이상거래 확인 페이지에서 "모르는 거래"를 눌러 넘어온 경우
  // =========================================================
  useEffect(() => {
    if (
      location.state?.targetTransaction &&
      transactions.length > 0
    ) {
      const target = location.state.targetTransaction;

      // target.id = fraudCaseId
      const matchedTransaction = transactions.find(
        (transaction) => transaction.id === target.id
      );

      setActiveTab("new");

      if (matchedTransaction) {
        setSelectedTransaction(
          matchedTransaction.transactionId.toString()
        );
      } else if (target.transactionId) {
        setSelectedTransaction(
          target.transactionId.toString()
        );
      }

      setReason("본인이 하지 않은 거래");

      setDetail(
        `[자동 연동] 이상거래 탐지 시스템에서 모르는 거래로 신고 접수된 항목입니다. (위험도: ${target.riskScore}%)`
      );
    }
  }, [location, transactions]);

  // =========================================================
  // 신고 접수
  // =========================================================
  const handleSubmitReport = async (e) => {
    e.preventDefault();

    if (!selectedTransaction || !reason) {
      alert("신고할 거래와 신고 사유를 선택해주세요.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:9090/api/fraud-reports/users/${userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            transactionId: Number(selectedTransaction),
            reason: reason,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();

        console.error(
          "신고 접수 서버 응답:",
          response.status,
          errorText
        );

        throw new Error(
          `신고 접수 실패 (${response.status}): ${errorText}`
        );
      }

      const newReport = await response.json();

      console.log("신고 접수 완료:", newReport);

      // 새 신고를 목록 맨 위에 추가
      setReports((prev) => [newReport, ...prev]);

      alert("거래 신고가 성공적으로 접수되었습니다.");

      // 초기화
      setSelectedTransaction("");
      setReason("");
      setDetail("");

      // 신고 내역 탭으로 이동
      setActiveTab("history");
    } catch (error) {
      console.error("신고 접수 실패:", error);
      alert("신고 접수 중 오류가 발생했습니다.");
    }
  };

  // =========================================================
  // 신고 취소
  // =========================================================
  // 현재 백엔드 FraudReportController에는 DELETE API가 없으므로
  // 실제 취소 기능은 일단 제거하지 않고 버튼만 표시하지 않음.
  // 나중에 DELETE API를 백엔드에 추가하면 다시 연결하면 됨.

  // =========================================================
  // 신고 상태 한글 변환
  // =========================================================
  const getStatusText = (status) => {
    switch (status) {
      case "RECEIVED":
        return "처리 중";

      case "PROCESSED":
        return "처리 완료";

      case "REJECTED":
        return "반려";

      default:
        return status;
    }
  };

  // =========================================================
  // 신고 상태 색상
  // =========================================================
  const getStatusColor = (status) => {
    switch (status) {
      case "PROCESSED":
        return "#22c55e";

      case "REJECTED":
        return "#ef4444";

      case "RECEIVED":
      default:
        return "#f59e0b";
    }
  };

  return (
    <>
      <TopBar
        title="거래 신고 및 관리"
        crumb="홈 / 보안·신고 / 거래 신고 및 관리"
        search={false}
      />

      {/* =====================================================
          상단 탭
      ====================================================== */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "20px",
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab("history")}
          style={{
            padding: "10px 20px",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: "700",
            cursor: "pointer",
            background:
              activeTab === "history"
                ? "var(--blue)"
                : "var(--panel)",
            color:
              activeTab === "history"
                ? "#fff"
                : "var(--ink)",
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
            background:
              activeTab === "new"
                ? "var(--blue)"
                : "var(--panel)",
            color:
              activeTab === "new"
                ? "#fff"
                : "var(--ink)",
            border: "1px solid var(--line)",
          }}
        >
          ✍️ 새로운 거래 신고하기
        </button>
      </div>

      {/* =====================================================
          탭 1 : 신고 내역
      ====================================================== */}
      {activeTab === "history" && (
        <Panel
          title="신청/신고 현황"
          sub="접수된 거래 신고 및 보안 신청 내역 목록입니다."
        >
          {reports.length === 0 ? (
            <div
              style={{
                padding: "50px 0",
                textAlign: "center",
                color: "var(--muted)",
                fontSize: "13px",
              }}
            >
              조회된 내역이 없습니다.
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              {reports.map((report) => {
                // -------------------------------------------------
                // 백엔드 report.transactionId와
                // fraudCases의 transactionId를 연결
                // -------------------------------------------------
                const transaction = transactions.find(
                  (item) =>
                    item.transactionId ===
                    report.transactionId
                );

                const statusText = getStatusText(
                  report.status
                );

                const statusColor = getStatusColor(
                  report.status
                );

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
                    {/* ---------------------------------------------
                        상단
                    ---------------------------------------------- */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          alignItems: "center",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: "700",
                            padding: "3px 8px",
                            borderRadius: "4px",
                            background: "var(--panel)",
                            border:
                              "1px solid var(--line)",
                            color: "var(--ink)",
                          }}
                        >
                          거래 신고
                        </span>

                        <span
                          style={{
                            fontSize: "12px",
                            color: "var(--muted)",
                          }}
                        >
                          신고 #{report.id}
                        </span>
                      </div>

                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: "700",
                          color: statusColor,
                        }}
                      >
                        ● {statusText}
                      </span>
                    </div>

                    {/* ---------------------------------------------
                        신고한 거래 정보
                    ---------------------------------------------- */}
                    <div>
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: "700",
                          color: "var(--ink)",
                          marginBottom: "6px",
                        }}
                      >
                        {transaction &&
                        `${transaction.merchant} / ₩${Number(
                          transaction.amount
                        ).toLocaleString()}`}
                      </div>

                      <div
                        style={{
                          fontSize: "12px",
                          color: "var(--muted)",
                          marginBottom: "4px",
                        }}
                      >
                        거래일시:{" "}
                        {transaction
                          ? transaction.occurredAt
                          : "거래 정보를 불러올 수 없습니다."}
                      </div>

                      <div
                        style={{
                          fontSize: "12px",
                          color: "var(--muted)",
                        }}
                      >
                        신고 사유:{" "}
                        <strong>
                          {report.reason}
                        </strong>
                      </div>
                    </div>

                    {/* ---------------------------------------------
                        하단
                    ---------------------------------------------- */}
                    <div
                      style={{
                        marginTop: "4px",
                        paddingTop: "10px",
                        borderTop:
                          "1px solid var(--line)",
                        display: "flex",
                        justifyContent:
                          "space-between",
                        alignItems: "center",
                        fontSize: "12px",
                      }}
                    >
                      <div
                        style={{
                          color: "var(--muted)",
                        }}
                      >
                        신고 접수일
                      </div>

                      <div
                        style={{
                          color: "var(--ink)",
                          fontWeight: "600",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {report.createdAt
                          ? report.createdAt
                              .replace("T", " ")
                              .slice(0, 16)
                          : "-"}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Panel>
      )}

      {/* =====================================================
          탭 2 : 새로운 거래 신고
      ====================================================== */}
      {activeTab === "new" && (
        <Panel
          title="거래 신고 접수"
          sub="본인이 이용하지 않은 의심 거래와 사유를 입력해주세요."
        >
          <form onSubmit={handleSubmitReport}>
            {/* ---------------------------------------------
                신고할 거래
            ---------------------------------------------- */}
            <div style={{ marginBottom: "22px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: "700",
                  color: "var(--ink)",
                  marginBottom: "8px",
                }}
              >
                신고할 거래
              </label>

              <select
                value={selectedTransaction}
                onChange={(e) =>
                  setSelectedTransaction(e.target.value)
                }
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border:
                    "1px solid var(--line)",
                  background: "var(--panel2)",
                  color: "var(--ink)",
                  fontSize: "13px",
                  outline: "none",
                }}
              >
                <option value="">
                  거래를 선택해주세요
                </option>

                {transactions.map((transaction) => (
                  <option
                    key={transaction.id}
                    value={transaction.transactionId}
                  >
                    {transaction.occurredAt} /{" "}
                    {transaction.merchant} / ₩{" "}
                    {Number(
                      transaction.amount
                    ).toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            {/* ---------------------------------------------
                신고 사유
            ---------------------------------------------- */}
            <div style={{ marginBottom: "22px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: "700",
                  color: "var(--ink)",
                  marginBottom: "8px",
                }}
              >
                신고 사유
              </label>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(2, 1fr)",
                  gap: "10px",
                }}
              >
                {[
                  "본인이 하지 않은 거래",
                  "결제 금액이 다름",
                  "중복 결제",
                  "알 수 없는 가맹점",
                ].map((item) => (
                  <button
                    key={item}
                    type="button"
                    className="minibtn"
                    onClick={() =>
                      setReason(item)
                    }
                    style={{
                      padding: "12px",
                      background:
                        reason === item
                          ? "var(--blue)"
                          : "var(--panel2)",
                      color:
                        reason === item
                          ? "#fff"
                          : "var(--ink)",
                      borderColor:
                        reason === item
                          ? "var(--blue)"
                          : "var(--line)",
                    }}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* ---------------------------------------------
                상세 내용
            ---------------------------------------------- */}
            <div style={{ marginBottom: "22px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: "700",
                  color: "var(--ink)",
                  marginBottom: "8px",
                }}
              >
                상세 내용
              </label>

              <textarea
                value={detail}
                onChange={(e) =>
                  setDetail(e.target.value)
                }
                placeholder="거래와 관련된 내용을 입력해주세요."
                rows={6}
                style={{
                  width: "100%",
                  resize: "vertical",
                  padding: "12px",
                  boxSizing: "border-box",
                  border:
                    "1px solid var(--line)",
                  borderRadius: "8px",
                  background: "var(--panel2)",
                  color: "var(--ink)",
                  fontSize: "13px",
                  fontFamily: "inherit",
                  outline: "none",
                }}
              />
            </div>

            {/* ---------------------------------------------
                버튼
            ---------------------------------------------- */}
            <div
              style={{
                display: "flex",
                justifyContent:
                  "flex-end",
                gap: "8px",
              }}
            >
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
                style={{
                  background: "var(--blue)",
                  color: "#fff",
                  borderColor:
                    "var(--blue)",
                }}
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