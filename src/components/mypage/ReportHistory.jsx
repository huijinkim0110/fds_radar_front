// 신고 및 신청 내역 관리 페이지
import { useState } from "react";
import TopBar from "../TopBar";
import Panel from "../Panel";

export default function ReportHistory() {
  // 탭 상태 ("all" | "transaction" | "card")
  const [activeTab, setActiveTab] = useState("all");

  // 임시 신고/신청 내역 데이터
  const [reports, setReports] = useState([
    {
      id: "R-2026-001",
      category: "거래 신고",
      target: "APPLE.COM/BILL (₩ 129,000)",
      reason: "본인이 하지 않은 거래",
      requestedAt: "2026-08-28 10:15",
      status: "처리 중", // 처리 중, 승인 완료, 반려
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
    {
      id: "R-2026-003",
      category: "거래 신고",
      target: "GOOGLE PAYMENT (₩ 45,000)",
      reason: "중복 결제",
      requestedAt: "2026-08-25 14:10",
      status: "반려",
      adminComment: "가맹점 정상 승인 내역으로 확인되어 반려되었습니다.",
    },
  ]);

  // 취소 가능한 건에 한해 접수 취소 핸들러
  const handleCancelReport = (id, status) => {
    if (status !== "처리 중") {
      alert("이미 처리 완료되었거나 반려된 건은 취소할 수 없습니다.");
      return;
    }

    if (!window.confirm("정말 해당 신고/신청을 취소하시겠습니까?")) return;

    setReports((prev) => prev.filter((item) => item.id !== id));
    alert("신고가 취소되었습니다.");
  };

  // 탭 필터링
  const filteredReports = reports.filter((item) => {
    if (activeTab === "transaction") return item.category === "거래 신고";
    if (activeTab === "card") return item.category.includes("카드");
    return true;
  });

  return (
    <>
      <TopBar
        title="신고 및 신청 내역"
        crumb="홈 / 보안·신고 / 내역 조회"
        search={false}
      />

      {/* 안내 영역 */}
      <div
        style={{
          padding: "18px 20px",
          marginBottom: "20px",
          border: "1px solid var(--line)",
          borderRadius: "12px",
          background: "var(--panel)",
        }}
      >
        <div
          style={{
            fontSize: "14px",
            fontWeight: "700",
            color: "var(--ink)",
            marginBottom: "7px",
          }}
        >
          접수한 거래 신고 및 카드 보안 신청 내역을 확인할 수 있습니다.
        </div>
        <div
          style={{
            fontSize: "12px",
            color: "var(--muted)",
            lineHeight: "1.6",
          }}
        >
          관리자 검토 상태에 따라 '처리 중', '승인 완료', '반려' 상태로 표시됩니다. 처리 중인 건은 직접 취소할 수 있습니다.
        </div>
      </div>

      <Panel
        title="신청/신고 현황"
        sub="총 접수된 내역 목록입니다."
        right={
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              className="minibtn"
              onClick={() => setActiveTab("all")}
              style={{
                background: activeTab === "all" ? "var(--blue)" : "var(--panel2)",
                color: activeTab === "all" ? "#fff" : "var(--ink)",
                borderColor: activeTab === "all" ? "var(--blue)" : "var(--line)",
              }}
            >
              전체
            </button>
            <button
              type="button"
              className="minibtn"
              onClick={() => setActiveTab("transaction")}
              style={{
                background: activeTab === "transaction" ? "var(--blue)" : "var(--panel2)",
                color: activeTab === "transaction" ? "#fff" : "var(--ink)",
                borderColor: activeTab === "transaction" ? "var(--blue)" : "var(--line)",
              }}
            >
              거래 신고
            </button>
            <button
              type="button"
              className="minibtn"
              onClick={() => setActiveTab("card")}
              style={{
                background: activeTab === "card" ? "var(--blue)" : "var(--panel2)",
                color: activeTab === "card" ? "#fff" : "var(--ink)",
                borderColor: activeTab === "card" ? "var(--blue)" : "var(--line)",
              }}
            >
              카드 보안
            </button>
          </div>
        }
      >
        {filteredReports.length === 0 ? (
          <div
            style={{
              padding: "50px 0",
              textAlign: "center",
              color: "var(--muted)",
              fontSize: "13px",
            }}
          >
            조회된 신고 및 신청 내역이 없습니다.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {filteredReports.map((report) => {
              // 상태에 따른 컬러 스타일 정의
              const statusColor =
                report.status === "승인 완료"
                  ? "#22c55e"
                  : report.status === "반려"
                  ? "#ef4444"
                  : "#f59e0b"; // 처리 중

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
                  {/* 상단: 카테고리, 번호, 상태 */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: "700",
                          padding: "3px 8px",
                          borderRadius: "4px",
                          background: "var(--panel)",
                          border: "1px solid var(--line)",
                          color: "var(--ink)",
                        }}
                      >
                        {report.category}
                      </span>
                      <span style={{ fontSize: "12px", color: "var(--muted)" }}>{report.id}</span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: "700",
                          color: statusColor,
                        }}
                      >
                        ● {report.status}
                      </span>

                      {report.status === "처리 중" && (
                        <button
                          type="button"
                          className="minibtn"
                          onClick={() => handleCancelReport(report.id, report.status)}
                          style={{
                            borderColor: "#ef4444",
                            color: "#ef4444",
                            padding: "4px 8px",
                            fontSize: "11px",
                          }}
                        >
                          접수 취소
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 중단: 대상 정보 및 사유 */}
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: "700", color: "var(--ink)", marginBottom: "4px" }}>
                      {report.target}
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--muted)" }}>
                      신고 사유: <strong>{report.reason}</strong>
                    </div>
                  </div>

                  {/* 하단: 관리자 피드백 및 접수 일시 */}
                  <div
                    style={{
                      marginTop: "4px",
                      paddingTop: "10px",
                      borderTop: "1px solid var(--line)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: "12px",
                    }}
                  >
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
    </>
  );
}