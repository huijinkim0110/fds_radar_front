import { useEffect, useState } from "react";
import TopBar from "../TopBar.jsx";
import Panel from "../Panel.jsx";
import {
  getAllFraudReports,
  updateFraudReportStatus,
} from "../../api/fraud/fraudReportAPI";
import { getTransactionTypeLabel, formatDateTime } from "../../constants/fraud/fraudCaseLabels";

const STATUS = {
  RECEIVED: { label: "접수", color: "var(--red)", bg: "rgba(220,38,38,0.12)" },
  UNDER_REVIEW: { label: "처리중", color: "var(--amber)", bg: "rgba(217,119,6,0.12)" },
  PROCESSED: { label: "처리완료", color: "var(--green)", bg: "rgba(5,150,105,0.12)" },
};

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [expandedId, setExpandedId] = useState(null);

  const [toast, setToast] = useState(null);
  function notify(text, type = "success") {
    setToast({ text, type });
    setTimeout(() => setToast(null), 2000);
  }

  const [confirmState, setConfirmState] = useState(null);
  function askConfirm(message, onConfirm) {
    setConfirmState({ message, onConfirm });
  }

  function loadReports() {
    setLoading(true);
    getAllFraudReports()
      .then(setReports)
      .catch(() => notify("신고 목록을 불러오지 못했습니다.", "error"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadReports();
  }, []);

  const filtered = filter === "ALL" ? reports : reports.filter((r) => r.status === filter);
  const pendingCount = reports.filter((r) => r.status === "RECEIVED").length;

  function handle(id, next) {
    const msg = next === "UNDER_REVIEW" ? "처리를 시작하시겠습니까?" : "처리를 완료하시겠습니까?";
    askConfirm(msg, () => {
      updateFraudReportStatus(id, next)
        .then(() => {
          notify(next === "UNDER_REVIEW" ? "처리를 시작했습니다." : "처리를 완료했습니다.");
          loadReports();
        })
        .catch(() => notify("처리 중 오류가 발생했습니다.", "error"));
    });
  }

  if (loading) return <div>불러오는 중...</div>;

  return (
    <>
      {toast && (
        <div style={{
          position: "fixed", top: 24, left: "50%", transform: "translateX(-50%)",
          zIndex: 2000, padding: "12px 22px", borderRadius: 8, fontSize: 14, fontWeight: 500,
          color: "#fff", boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
          background: toast.type === "error" ? "#dc2626" : "#059669",
        }}>
          {toast.text}
        </div>
      )}

      {confirmState && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)",
          zIndex: 3000, display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{
            background: "#fff", borderRadius: 10, padding: "24px 28px",
            minWidth: 300, maxWidth: 380, boxShadow: "0 12px 32px rgba(0,0,0,0.25)",
          }}>
            <div style={{ fontSize: 14, marginBottom: 20, lineHeight: 1.5 }}>{confirmState.message}</div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button className="minibtn" onClick={() => setConfirmState(null)}>취소</button>
              <button className="minibtn warn" onClick={() => {
                const action = confirmState.onConfirm;
                setConfirmState(null);
                action();
              }}>확인</button>
            </div>
          </div>
        </div>
      )}

      <TopBar title="신고 처리" crumb="관리자 / 요청 처리" search={false} />

      <div className="tabs" style={{ marginBottom: 16 }}>
        {[
          ["ALL", "전체"],
          ["RECEIVED", `접수 ${pendingCount}`],
          ["UNDER_REVIEW", "처리중"],
          ["PROCESSED", "완료"],
        ].map(([key, label]) => (
          <button key={key} className={filter === key ? "on" : ""} onClick={() => setFilter(key)}>
            {label}
          </button>
        ))}
      </div>

      <Panel title="거래 신고 목록" sub={`총 ${filtered.length}건`}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.length === 0 && (
            <div style={{ textAlign: "center", color: "var(--muted)", padding: "40px 0", fontSize: 13 }}>
              해당하는 신고가 없습니다.
            </div>
          )}
            {/* 헤더 */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "60px 1fr 1fr 1fr 1fr 80px 32px",
              gap: 12,
              padding: "10px 18px",
              borderBottom: "1px solid var(--line)",
              fontSize: 11,
              fontWeight: 600,
              color: "var(--muted)",
            }}>
              <span>번호</span>
              <span>이름</span>
              <span>신고유형</span>
              <span>신고사유</span>
              <span>대상거래</span>
              <span>상태</span>
              <span></span>
            </div>

          {filtered.map((r) => {
            const s = STATUS[r.status] ?? { label: r.statusLabel ?? r.status, color: "var(--muted)", bg: "transparent" };
            const isExpanded = expandedId === r.id;

            return (
              <div
                key={r.id}
                style={{
                  border: "1px solid var(--line)",
                  borderRadius: 10,
                  background: "var(--panel2)",
                  overflow: "hidden",
                }}
              >
                {/* 기본 정보 행 — 클릭하면 토글 */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : r.id)}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "60px 1fr 1fr 1fr 1fr 80px 32px",
                    alignItems: "center",
                    gap: 12,
                    padding: "14px 18px",
                    cursor: "pointer",
                  }}
                >
                  <span className="tx" style={{ fontSize: 12 }}>#{r.id}</span>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{r.userName ?? r.userEmail}</span>
                  <span style={{ fontSize: 12 }}>{r.reportTypeLabel}</span>
                  <span>
                    <span className="chip" style={{ color: "var(--blue)", background: "rgba(37,99,235,0.12)" }}>
                      {r.reasonCategory || "-"}
                    </span>
                  </span>
                  <span style={{ fontSize: 12, color: "var(--muted)" }}>
                    거래 #{r.transactionId} ({getTransactionTypeLabel(r.transactionType)})
                  </span>
                  <span>
                    <span className="chip" style={{ color: s.color, background: s.bg }}>{s.label}</span>
                  </span>
                  <span style={{ color: "var(--muted)", fontSize: 13 }}>{isExpanded ? "▲" : "▼"}</span>
                </div>

                {/* 펼쳐진 상세 정보 */}
                {isExpanded && (
                  <div style={{
                    padding: "16px 18px",
                    borderTop: "1px solid var(--line)",
                    background: "var(--panel)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                  }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px" }}>
                      <div style={{ fontSize: 13 }}>
                        <span style={{ color: "var(--muted)", marginRight: 8 }}>접수시각</span>
                        <span style={{ fontWeight: 600 }}>{formatDateTime(r.createdAt)}</span>
                      </div>
                      <div style={{ fontSize: 13 }}>
                        <span style={{ color: "var(--muted)", marginRight: 8 }}>이메일</span>
                        <span style={{ fontWeight: 600 }}>{r.userEmail}</span>
                      </div>
                      <div style={{ fontSize: 13, gridColumn: "1 / -1" }}>
                        <span style={{ color: "var(--muted)", marginRight: 8 }}>상세내용</span>
                        <span style={{ fontWeight: 600 }}>{r.reason || "-"}</span>
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 8, borderTop: "1px solid var(--line)" }}>
                      {r.status === "RECEIVED" ? (
                        <button className="minibtn" onClick={(e) => { e.stopPropagation(); handle(r.id, "UNDER_REVIEW"); }}>처리 시작</button>
                      ) : r.status === "UNDER_REVIEW" ? (
                        <button className="minibtn" onClick={(e) => { e.stopPropagation(); handle(r.id, "PROCESSED"); }}>완료</button>
                      ) : (
                        <span style={{ fontSize: 12, color: "var(--muted)" }}>처리 완료</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Panel>
    </>
  );
}