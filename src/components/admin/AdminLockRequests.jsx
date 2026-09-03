import { useEffect, useState } from "react";
import TopBar from "../TopBar.jsx";
import Panel from "../Panel.jsx";
// [D파트 담당자 수정] 대기 목록만 조회하던 것을 전체/상태별 조회로 변경
import { getAdminLockRequests, processLockRequest } from "../../api/dispute/lockRequestAPI";
import { formatDateTime } from "../../constants/fraud/fraudCaseLabels";

const TARGET_TYPE_LABELS = {
  CARD: "카드",
  ACCOUNT: "계좌",
};

// [D파트 담당자 추가] 상태별 필터 및 상태 뱃지 표시용 라벨/색상 정의
const STATUS = {
  RECEIVED: { label: "대기", color: "var(--red)", bg: "rgba(220,38,38,0.12)" },
  COMPLETED: { label: "승인됨", color: "var(--green)", bg: "rgba(5,150,105,0.12)" },
  REJECTED: { label: "거부됨", color: "var(--muted)", bg: "rgba(107,114,128,0.12)" },
};

export default function AdminLockRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  // [D파트 담당자 추가] 상태별 필터를 위한 state
  const [filter, setFilter] = useState("ALL");
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);

  async function fetchRequests() {
    try {
      setLoading(true);
      // [D파트 담당자 수정] 대기 목록 전용 API → 전체/상태별 조회 API로 교체
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

  // [D파트 담당자 추가] 상태별 필터링 로직
  const filtered = filter === "ALL" ? requests : requests.filter((r) => r.requestStatus === filter);
  const pendingCount = requests.filter((r) => r.requestStatus === "RECEIVED").length;
  
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

      {/* [D파트 담당자 추가] 상태별 필터 탭 */}
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

      {/* [D파트 담당자 수정] 대기 건수 → 필터링된 건수 표시로 변경 */}
      <Panel title="계좌·카드 잠금 요청" sub={`총 ${filtered.length}건`}>
        
        <table>
          <thead>
            <tr>
              <th>요청번호</th><th>대상</th><th>사유</th>
              {/* [D파트 담당자 추가] 상태 컬럼 */}
              <th>연결 사건</th><th>요청시각</th><th>상태</th><th>처리</th>
            </tr>
          </thead>
          <tbody>
            {/* [D파트 담당자 수정] requests → filtered로 변경 */}
            {filtered.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: "center", color: "var(--muted)" }}>해당하는 잠금 요청이 없습니다.</td></tr>
            )}
            {filtered.map((r) => {
              const isBusy = busyId === r.id;
              // [D파트 담당자 추가] 상태 뱃지 표시용
              const s = STATUS[r.requestStatus] ?? { label: r.requestStatus, color: "var(--muted)", bg: "transparent" };
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
                  {/* [D파트 담당자 추가] 상태 뱃지 컬럼 */}
                  <td><span className="chip" style={{ color: s.color, background: s.bg }}>{s.label}</span></td>
                  <td>
                    {/* [D파트 담당자 수정] 대기 상태일 때만 승인/거부 버튼, 그 외엔 완료 표시 */}
                    {r.requestStatus === "RECEIVED" ? (
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="minibtn warn" disabled={isBusy} onClick={() => handle(r.id, "approve")}>잠금 승인</button>
                        <button className="minibtn" disabled={isBusy} onClick={() => handle(r.id, "reject")}>거부</button>
                      </div>
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