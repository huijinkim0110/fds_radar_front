import { useEffect, useState } from "react";
import TopBar from "../TopBar.jsx";
import Panel from "../Panel.jsx";
import { getPendingLockRequests, processLockRequest } from "../../api/dispute/lockRequestAPI";
import { formatDateTime } from "../../constants/fraud/fraudCaseLabels";

const TARGET_TYPE_LABELS = {
  CARD: "카드",
  ACCOUNT: "계좌",
};

export default function AdminLockRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);

  async function fetchRequests() {
    try {
      setLoading(true);
      const data = await getPendingLockRequests();
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

  async function handle(lockRequestId, decision) {
    try {
      setBusyId(lockRequestId);
      const requestStatus = decision === "approve" ? "COMPLETED" : "REJECTED";
      await processLockRequest(lockRequestId, requestStatus);
      await fetchRequests();
    } catch (err) {
      alert("처리에 실패했습니다: " + (err.response?.data?.message ?? err.message));
    } finally {
      setBusyId(null);
    }
  }

  if (loading) return <div>불러오는 중...</div>;
  if (error) return <div>{error}</div>;

  return (
    <>
      <TopBar title="잠금 요청 처리" crumb="관리자 / 요청 처리" search={false} />

      <Panel title="계좌·카드 잠금 요청" sub={`대기 ${requests.length}건`}>
        <table>
          <thead>
            <tr>
              <th>요청번호</th><th>대상</th><th>사유</th>
              <th>연결 사건</th><th>요청시각</th><th>처리</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--muted)" }}>대기 중인 잠금 요청이 없습니다.</td></tr>
            )}
            {requests.map((r) => {
              const isBusy = busyId === r.id;
              return (
                <tr key={r.id}>
                  <td className="tx">#{r.id}</td>
                  <td>
                    <span className="chip" style={{
                      color: r.targetType === "ACCOUNT" ? "var(--blue)" : "#7C3AED",
                      background: r.targetType === "ACCOUNT" ? "rgba(37,99,235,0.12)" : "rgba(124,58,237,0.12)"
                    }}>{TARGET_TYPE_LABELS[r.targetType] ?? r.targetType}</span>
                  </td>
                  <td style={{ fontSize: 12.5 }}>{r.requestReason || "-"}</td>
                  <td className="tx">{r.fraudCaseId ? `#${r.fraudCaseId}` : "-"}</td>
                  <td style={{ fontSize: 11.5, color: "var(--muted)" }}>{formatDateTime(r.requestedAt)}</td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="minibtn warn" disabled={isBusy} onClick={() => handle(r.id, "approve")}>잠금 승인</button>
                      <button className="minibtn" disabled={isBusy} onClick={() => handle(r.id, "reject")}>거부</button>
                    </div>
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