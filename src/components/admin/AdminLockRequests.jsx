import { useEffect, useState } from "react";
import TopBar from "../TopBar.jsx";
import Panel from "../Panel.jsx";
import { getAdminLockRequests, processLockRequest, releaseLockRequest } from "../../api/dispute/lockRequestAPI";
import { getFraudCaseDetail } from "../../api/fraud/fraudCaseAPI";
import {
  formatDateTime,
  getCaseStatusLabel,
  getCasePriorityLabel,
  formatProbabilityPercent,
  getCaseOriginLabel,        // [D파트 담당자 추가]
  getFraudDecisionLabel,     // [D파트 담당자 추가]
  getUserConfirmationLabel,  // [D파트 담당자 추가]
} from "../../constants/fraud/fraudCaseLabels";

const TARGET_TYPE_LABELS = {
  CARD: "카드",
  ACCOUNT: "계좌",
};

const STATUS = {
  RECEIVED: { label: "대기", color: "var(--red)", bg: "rgba(220,38,38,0.12)" },
  COMPLETED: { label: "승인됨", color: "var(--green)", bg: "rgba(5,150,105,0.12)" },
  REJECTED: { label: "거부됨", color: "var(--muted)", bg: "rgba(107,114,128,0.12)" },
};

const RELEASED_STATUS = { label: "해제됨", color: "var(--muted)", bg: "rgba(107,114,128,0.12)" };

export default function AdminLockRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const [detailRequest, setDetailRequest] = useState(null);

  const [caseExpanded, setCaseExpanded] = useState(false);
  const [caseDetail, setCaseDetail] = useState(null);
  const [caseLoading, setCaseLoading] = useState(false);
  const [caseError, setCaseError] = useState(null);

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

  function openDetail(request) {
    setDetailRequest(request);
    setCaseExpanded(false);
    setCaseDetail(null);
    setCaseError(null);
  }

  async function toggleCaseDetail() {
    if (caseExpanded) {
      setCaseExpanded(false);
      return;
    }
    setCaseExpanded(true);
    if (caseDetail || !detailRequest?.fraudCaseId) return;

    try {
      setCaseLoading(true);
      setCaseError(null);
      const data = await getFraudCaseDetail(detailRequest.fraudCaseId);
      setCaseDetail(data);
    } catch (err) {
      setCaseError("사건 정보를 불러오지 못했습니다.");
    } finally {
      setCaseLoading(false);
    }
  }

  async function handle(lockRequestId, decision) {
      try {
          setBusyId(lockRequestId);
          const requestStatus = decision === "approve" ? "COMPLETED" : "REJECTED";
          await processLockRequest(lockRequestId, requestStatus);
          await fetchRequests();
          notify(decision === "approve" ? "잠금 요청이 승인되었습니다." : "잠금 요청이 거부되었습니다.");
          setDetailRequest(null);
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
              setDetailRequest(null);
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

      {/* [D파트 담당자 추가] 잠금 요청 상세 모달 */}
      {detailRequest && (
        <div style={{
            position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)",
            zIndex: 2500, display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{
              background: "#fff", borderRadius: 12, padding: "28px 32px",
              minWidth: 380, maxWidth: 460, boxShadow: "0 12px 32px rgba(0,0,0,0.25)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <h3 style={{ margin: 0, fontSize: 16 }}>잠금 요청 상세 #{detailRequest.id}</h3>
              <button className="minibtn" onClick={() => setDetailRequest(null)}>닫기</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 13.5 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>잠금 대상</span>
                <span className="chip" style={{
                  color: detailRequest.targetType === "ACCOUNT" ? "var(--blue)" : "#7C3AED",
                  background: detailRequest.targetType === "ACCOUNT" ? "rgba(37,99,235,0.12)" : "rgba(124,58,237,0.12)"
                }}>
                  {TARGET_TYPE_LABELS[detailRequest.targetType] ?? detailRequest.targetType} 잠금
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>회원</span>
                <span style={{ fontWeight: 600 }}>
                  {detailRequest.ownerName ? `${detailRequest.ownerName} 님` : "-"}
                </span>
              </div>

              {detailRequest.targetDisplayNumber && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--muted)" }}>
                    {TARGET_TYPE_LABELS[detailRequest.targetType] ?? detailRequest.targetType}번호
                  </span>
                  <span>{detailRequest.targetDisplayNumber}</span>
                </div>
              )}

              <div>
                <div style={{ color: "var(--muted)", marginBottom: 4 }}>사유</div>
                <div style={{ background: "#f8f9fb", borderRadius: 6, padding: "8px 10px" }}>
                  {detailRequest.requestReason || "-"}
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>요청시각</span>
                <span>{formatDateTime(detailRequest.requestedAt)}</span>
              </div>

              {detailRequest.processedAt && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--muted)" }}>처리시각</span>
                  <span>{formatDateTime(detailRequest.processedAt)}</span>
                </div>
              )}

              {detailRequest.released && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--muted)" }}>해제시각</span>
                  <span>{formatDateTime(detailRequest.releasedAt)}</span>
                </div>
              )}

              {/* [D파트 담당자 수정] 연결 사건 — 화면 이동 대신 펼치기/접기 */}
              {detailRequest.fraudCaseId && (
                <div style={{ borderTop: "1px solid #eee", paddingTop: 10, marginTop: 4 }}>
                  <button
                    className="minibtn"
                    onClick={toggleCaseDetail}
                    style={{ width: "100%", display: "flex", justifyContent: "space-between" }}
                  >
                    <span>연결 사건 #{detailRequest.fraudCaseId}</span>
                    <span>{caseExpanded ? "▲ 접기" : "▼ 펼치기"}</span>
                  </button>

                  {caseExpanded && (
                    <div style={{ marginTop: 10, background: "#f8f9fb", borderRadius: 6, padding: "10px 12px", fontSize: 12.5 }}>
                      {caseLoading && <div style={{ color: "var(--muted)" }}>불러오는 중...</div>}
                      {caseError && <div style={{ color: "var(--red)" }}>{caseError}</div>}
                      {caseDetail && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ color: "var(--muted)" }}>사건 상태</span>
                            <span>{getCaseStatusLabel(caseDetail.caseStatus)}</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ color: "var(--muted)" }}>우선순위</span>
                            <span>{getCasePriorityLabel(caseDetail.priority)}</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ color: "var(--muted)" }}>생성 경로</span>
                            <span>{getCaseOriginLabel(caseDetail.origin)}</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ color: "var(--muted)" }}>최종판정</span>
                            <span style={{
                              fontWeight: 600,
                              color: caseDetail.fraudDecision === "FRAUD" ? "var(--red)"
                                  : caseDetail.fraudDecision === "NORMAL" ? "var(--green)"
                                  : "var(--muted)"
                            }}>
                              {caseDetail.fraudDecision ? getFraudDecisionLabel(caseDetail.fraudDecision) : "미판정"}
                            </span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ color: "var(--muted)" }}>본인확인</span>
                            <span>{getUserConfirmationLabel(caseDetail.confirmation)}</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ color: "var(--muted)" }}>이상확률</span>
                            <span>{formatProbabilityPercent(caseDetail.detection?.fraudProbability)}</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ color: "var(--muted)" }}>거래ID</span>
                            <span>{caseDetail.transactionId}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 모달 안에서도 바로 처리 가능하게 */}
            <div style={{ marginTop: 22, display: "flex", justifyContent: "flex-end", gap: 8 }}>
              {detailRequest.requestStatus === "RECEIVED" && (
                <>
                  <button className="minibtn" disabled={busyId === detailRequest.id} onClick={() => handle(detailRequest.id, "reject")}>거부</button>
                  <button className="minibtn warn" disabled={busyId === detailRequest.id} onClick={() => handle(detailRequest.id, "approve")}>잠금 승인</button>
                </>
              )}
              {detailRequest.requestStatus === "COMPLETED" && !detailRequest.released && (
                <button className="minibtn warn" disabled={busyId === detailRequest.id} onClick={() => handleRelease(detailRequest.id)}>해제</button>
              )}
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
              <th>요청번호</th><th>대상</th><th>회원</th>
              <th>요청시각</th><th>상태</th><th>처리</th><th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: "center", color: "var(--muted)" }}>해당하는 잠금 요청이 없습니다.</td></tr>
            )}
            {filtered.map((r) => {
              const isBusy = busyId === r.id;
              const s = r.requestStatus === "COMPLETED" && r.released
                ? RELEASED_STATUS
                : (STATUS[r.requestStatus] ?? { label: r.requestStatus, color: "var(--muted)", bg: "transparent" });
              return (
                <tr key={r.id}>
                  <td className="tx">#{r.id}</td>
                  <td>
                    <span className="chip" style={{
                      color: r.targetType === "ACCOUNT" ? "var(--blue)" : "#7C3AED",
                      background: r.targetType === "ACCOUNT" ? "rgba(37,99,235,0.12)" : "rgba(124,58,237,0.12)"
                    }}>
                      {TARGET_TYPE_LABELS[r.targetType] ?? r.targetType} 잠금
                    </span>
                  </td>
                  <td style={{ fontSize: 12.5 }}>
                    {r.ownerName ? `${r.ownerName} 님` : "-"}
                  </td>
                  <td style={{ fontSize: 11.5, color: "var(--muted)" }}>{formatDateTime(r.requestedAt)}</td>
                  <td><span className="chip" style={{ color: s.color, background: s.bg }}>{s.label}</span></td>
                  <td>
                    {r.requestStatus === "RECEIVED" ? (
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="minibtn warn" disabled={isBusy} onClick={() => handle(r.id, "approve")}>잠금 승인</button>
                        <button className="minibtn" disabled={isBusy} onClick={() => handle(r.id, "reject")}>거부</button>
                      </div>
                    ) : r.requestStatus === "COMPLETED" && !r.released ? (
                      <button className="minibtn warn" disabled={isBusy} onClick={() => handleRelease(r.id)}>해제</button>
                    ) : (
                      <span style={{ fontSize: 11.5, color: "var(--muted)" }}>완료</span>
                    )}
                  </td>
                  <td>
                    <button className="minibtn" onClick={() => openDetail(r)}>상세</button>
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