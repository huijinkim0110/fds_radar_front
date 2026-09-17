import { useState, useEffect } from "react";
import { apiFetch } from "../../api/apiClient.js";
import { useLocation } from "react-router-dom";
import TopBar from "../TopBar";
import Panel from "../Panel";
import { getMyFraudCases } from "../../api/fraud/fraudUserAPI";
import { useAuth } from "../../context/AuthContext.jsx";

export default function FraudReportsPage() {

  const { user } = useAuth();
  const userId = user?.userId ?? 1;

  const location = useLocation();

  const [activeTab, setActiveTab] = useState("history");
  const [reports, setReports] = useState([]);

  const [selectedTransaction, setSelectedTransaction] = useState("");
  const [reason, setReason] = useState("");
  const [detail, setDetail] = useState("");

  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    getMyFraudCases()
      .then((data) => {
        setTransactions(
          data.map((raw) => ({
            id: raw.fraudCaseId,
            transactionId: raw.transactionId,
            userName: raw.userName,
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

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const data = await apiFetch(`/api/fraud-reports/user/${userId}`);
        console.log("신고 내역 응답:", data);
        setReports(data);
      } catch (error) {
        console.error("신고 내역 조회 실패:", error);
      }
    };

    fetchReports();
  }, []);

  useEffect(() => {
    if (
      location.state?.targetTransaction &&
      transactions.length > 0
    ) {
      const target = location.state.targetTransaction;

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

  const handleSubmitReport = async (e) => {
    e.preventDefault();

    if (!selectedTransaction || !reason) {
      alert("신고할 거래와 신고 사유를 선택해주세요.");
      return;
    }

    try {
      const newReport = await apiFetch(
        `/api/fraud-reports/users/${userId}`,
        {
          method: "POST",
          body: JSON.stringify({
            transactionId: Number(selectedTransaction),
            reasonCategory: reason,
            reason: detail,
          }),
        }
      );

      console.log("신고 접수 완료:", newReport);

      setReports((prev) => [newReport, ...prev]);

      alert("거래 신고가 성공적으로 접수되었습니다.");

      setSelectedTransaction("");
      setReason("");
      setDetail("");

      setActiveTab("history");
    } catch (error) {
      console.error("신고 접수 실패:", error);
      alert("신고 접수 중 오류가 발생했습니다.");
    }
  };

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
                          {report.reasonCategory || "-"}
                        </strong>
                      </div>
                        {report.reason && (
                          <div
                            style={{
                              fontSize: "12px",
                              color: "var(--muted)",
                            }}
                          >
                            상세 내용:{" "}
                            <span style={{ color: "var(--ink)" }}>
                              {report.reason}
                            </span>
                          </div>
                        )}
                      </div>

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

      {activeTab === "new" && (
        <Panel
          title="거래 신고 접수"
          sub="본인이 이용하지 않은 의심 거래와 사유를 입력해주세요."
        >
          <form onSubmit={handleSubmitReport}>
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
                  "알 수 없는 가맹점",
                  "중복 결제",
                  "서비스 미제공/미이용",
                  "취소 후 미환급",
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