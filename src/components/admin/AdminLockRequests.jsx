import { useEffect, useState } from "react";
import TopBar from "../TopBar.jsx";
import Panel from "../Panel.jsx";
// [D파트 담당자 수정] release API 추가로 import
import { getAdminLockRequests, processLockRequest, releaseLockRequest } from "../../api/dispute/lockRequestAPI";
import { formatDateTime } from "../../constants/fraud/fraudCaseLabels";

const TARGET_TYPE_LABELS = {
  CARD: "카드",
  ACCOUNT: "계좌",
};

const STATUS = {
  RECEIVED: { label: "대기", color: "var(--red)", bg: "rgba(220,38,38,0.12)" },
  COMPLETED: { label: "승인됨", color: "var(--green)", bg: "rgba(5,150,105,0.12)" },
  REJECTED: { label: "거부됨", color: "var(--muted)", bg: "rgba(107,114,128,0.12)" },
};

// [D파트 담당자 추가] 해제된 완료건 표시용
const RELEASED_STATUS = { label: "해제됨", color: "var(--muted)", bg: "rgba(107,114,128,0.12)" };

export default function AdminLockRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const [confirmState, setConfirmState] = useState(null);
  function askConfirm(message, onConfirm) {
      setConfirmState({ message, onConfirm });
  }

  const [toast, setToast] = useState(null);
  function notify(text, type = "success") {
      setToast({ text, type });
      setTimeout(() => setToast(null), 2000);
  }

  async function fetchRequests() {
    try {
      setLoading(true);
      const data = await getAdminLockRequests();
      setRequests(data);
      setError(null);
    } catch (err) {
      setError("잠금 요청 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRequests();
  }, []);

  const filtered = filter === "ALL" ? requests : requests.filter((r) => r.requestStatus === filter);
  const pendingCount = requests.filter((r) => r.requestStatus === "RECEIVED").length;

  async function handle(lockRequestId, decision) {
      try {
          setBusyId(lockRequestId);
          const requestStatus = decision === "approve" ? "COMPLETED" : "REJECTED";
          await processLockRequest(lockRequestId, requestStatus);
          await fetchRequests();
          notify(decision === "approve" ? "잠금 요청이 승인되었습니다." : "잠금 요청이 거부되었습니다.");
      } catch (err) {
          notify("처리에 실패했습니다: " + (err.response?.data?.message ?? err.message), "error");
      } finally {
          setBusyId(null);
      }
  }

  async function handleRelease(lockRequestId) {
      askConfirm("잠금을 해제하시겠습니까?", async () => {
          try {
              setBusyId(lockRequestId);
              await releaseLockRequest(lockRequestId);
              await fetchRequests();
              notify("잠금이 해제되었습니다.");
          } catch (err) {
              notify("해제에 실패했습니다: " + (err.response?.data?.message ?? err.message), "error");
          } finally {
              setBusyId(null);
          }
      });
  }

  if (loading) return <div>불러오는 중...</div>;
  if (error) return <div>{error}</div>;

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

      <TopBar title="잠금 요청 처리" crumb="관리자 / 요청 처리" search={false} />

      <div className="tabs" style={{ marginBottom: 16 }}>
        {[
          ["ALL", "전체"],
          ["RECEIVED", `대기 ${pendingCount}`],
          ["COMPLETED", "승인됨"],
          ["REJECTED", "거부됨"],
        ].map(([key, label]) => (
          <button key={key} className={filter === key ? "on" : ""} onClick={() => setFilter(key)}>
            {label}
          </button>
        ))}
      </div>

      <Panel title="계좌·카드 잠금 요청" sub={`총 ${filtered.length}건`}>
        <table>
          <thead>
            <tr>
              <th>요청번호</th><th>대상</th><th>사유</th>
              <th>연결 사건</th><th>요청시각</th><th>상태</th><th>처리</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: "center", color: "var(--muted)" }}>해당하는 잠금 요청이 없습니다.</td></tr>
            )}
            {filtered.map((r) => {
              const isBusy = busyId === r.id;
              // [D파트 담당자 수정] 해제된 완료건은 별도 상태 뱃지로 표시
              const s = r.requestStatus === "COMPLETED" && r.released
                ? RELEASED_STATUS
                : (STATUS[r.requestStatus] ?? { label: r.requestStatus, color: "var(--muted)", bg: "transparent" });
              return (
                <tr key={r.id}>
                  <td className="tx">#{r.id}</td>
                  <td>
                    {/* [D파트 담당자 수정] 실제 잠긴 카드/계좌 ID를 같이 표시 */}
                    <span className="chip" style={{
                      color: r.targetType === "ACCOUNT" ? "var(--blue)" : "#7C3AED",
                      background: r.targetType === "ACCOUNT" ? "rgba(37,99,235,0.12)" : "rgba(124,58,237,0.12)"
                    }}>
                      {TARGET_TYPE_LABELS[r.targetType] ?? r.targetType}
                      {r.targetRefId ? ` #${r.targetRefId}` : ""}
                    </span>
                  </td>
                  <td style={{ fontSize: 12.5 }}>{r.requestReason || "-"}</td>
                  <td className="tx">{r.fraudCaseId ? `#${r.fraudCaseId}` : "-"}</td>
                  <td style={{ fontSize: 11.5, color: "var(--muted)" }}>{formatDateTime(r.requestedAt)}</td>
                  <td><span className="chip" style={{ color: s.color, background: s.bg }}>{s.label}</span></td>
                  <td>
                    {r.requestStatus === "RECEIVED" ? (
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="minibtn warn" disabled={isBusy} onClick={() => handle(r.id, "approve")}>잠금 승인</button>
                        <button className="minibtn" disabled={isBusy} onClick={() => handle(r.id, "reject")}>거부</button>
                      </div>
                    ) : r.requestStatus === "COMPLETED" && !r.released ? (
                      // [D파트 담당자 추가] 해제 버튼
                      <button className="minibtn warn" disabled={isBusy} onClick={() => handleRelease(r.id)}>해제</button>
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