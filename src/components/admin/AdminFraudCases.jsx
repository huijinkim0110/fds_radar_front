import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../TopBar.jsx";
import Panel from "../Panel.jsx";
import { getFraudCaseList, updateFraudCaseStatus, finalizeFraudDecision } from "../../api/fraud/fraudCaseAPI";
import {
  getCaseStatusLabel,
  getCasePriorityLabel,
  getTransactionTypeLabel,   // 추가
  formatProbabilityPercent,
  formatDateTime,
} from "../../constants/fraud/fraudCaseLabels";

const RISK = {
  HIGH: { label: "높음", color: "var(--red)", bg: "rgba(220,38,38,0.12)" },
  MEDIUM: { label: "중간", color: "var(--amber)", bg: "rgba(217,119,6,0.12)" },
  LOW: { label: "낮음", color: "var(--green)", bg: "rgba(5,150,105,0.12)" },
};

const STATUS = {
  RECEIVED: { label: "접수", color: "var(--red)", bg: "rgba(220,38,38,0.12)" },
  INVESTIGATING: { label: "조사중", color: "var(--amber)", bg: "rgba(217,119,6,0.12)" },
  CLOSED: { label: "종결", color: "var(--green)", bg: "rgba(5,150,105,0.12)" },
};

export default function AdminFraudCases() {
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("ALL");
  const [busyId, setBusyId] = useState(null);

  async function fetchCases() {
    try {
      setLoading(true);
      const data = await getFraudCaseList();
      setCases(data.content); // Spring Page 응답이라 실제 목록은 content 안에 있음
      setError(null);
    } catch (err) {
      setError("사건 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCases();
  }, []);

  const filtered = filter === "ALL" ? cases : cases.filter((c) => c.caseStatus === filter);

  // 조사 시작: 접수(RECEIVED) -> 조사중(INVESTIGATING)
  async function startInvestigation(fraudCaseId) {
    try {
      setBusyId(fraudCaseId);
      await updateFraudCaseStatus(fraudCaseId, "INVESTIGATING");
      await fetchCases();
    } catch (err) {
      alert("상태 변경에 실패했습니다: " + (err.response?.data?.message ?? err.message));
    } finally {
      setBusyId(null);
    }
  }

  // 최종 판정: 조사중(INVESTIGATING) -> 종결(CLOSED), 정상(NORMAL) 또는 사기(FRAUD)
  async function judge(fraudCaseId, decision) {
    try {
      setBusyId(fraudCaseId);
      await finalizeFraudDecision(fraudCaseId, decision);
      await fetchCases();
    } catch (err) {
      alert("최종 판정에 실패했습니다: " + (err.response?.data?.message ?? err.message));
    } finally {
      setBusyId(null);
    }
  }

  if (loading) return <div>불러오는 중...</div>;
  if (error) return <div>{error}</div>;

  return (
    <>
      <TopBar title="이상거래 사건" crumb="관리자 / 이상거래 관리" search={false} />

      {/* 상태 필터 — 백엔드 CaseStatus(RECEIVED/INVESTIGATING/CLOSED) 기준 */}
      <div className="tabs" style={{ marginBottom: 16 }}>
        {[
          ["ALL", "전체"],
          ["RECEIVED", "접수"],
          ["INVESTIGATING", "조사중"],
          ["CLOSED", "종결"],
        ].map(([key, label]) => (
          <button key={key} className={filter === key ? "on" : ""} onClick={() => setFilter(key)}>
            {label}
          </button>
        ))}
      </div>

      <Panel title="탐지된 이상거래" sub={`총 ${filtered.length}건`}>
        <table>
          <thead>
            <tr>
              <th>사건번호</th><th>거래ID</th><th>거래유형</th><th>우선순위</th>
              <th>AI 이상확률</th><th>접수일시</th><th>담당자</th><th>상태</th><th>처리</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={9} style={{ textAlign: "center", color: "var(--muted)" }}>해당하는 사건이 없습니다.</td></tr>
            )}
            {filtered.map((c) => {
              const r = RISK[c.priority] ?? { label: getCasePriorityLabel(c.priority), color: "var(--muted)", bg: "transparent" };
              const s = STATUS[c.caseStatus] ?? { label: getCaseStatusLabel(c.caseStatus), color: "var(--muted)", bg: "transparent" };
              const isBusy = busyId === c.fraudCaseId;
              return (
                <tr
                  key={c.fraudCaseId}
                  onClick={() => navigate(`/mypage/admin-fraud-cases/${c.fraudCaseId}`)}
                  style={{ cursor: "pointer" }}
                >
                  <td className="tx">#{c.fraudCaseId}</td>
                  <td className="tx">{c.transactionId}</td>
                  <td className="tx">{getTransactionTypeLabel(c.transactionType)}</td>
                  <td><span className="chip" style={{ color: r.color, background: r.bg }}>{r.label}</span></td>
                  <td className="tx">{formatProbabilityPercent(c.fraudProbability)}</td>
                  <td style={{ fontSize: 11.5, color: "var(--muted)" }}>{formatDateTime(c.openedAt)}</td>
                  <td className="tx">{c.assignedAdminId}</td>
                  <td><span className="chip" style={{ color: s.color, background: s.bg }}>{s.label}</span></td>
                  <td onClick={(e) => e.stopPropagation()}>
                    {c.caseStatus === "RECEIVED" && (
                      <button className="minibtn" disabled={isBusy} onClick={() => startInvestigation(c.fraudCaseId)}>
                        조사 시작
                      </button>
                    )}
                    {c.caseStatus === "INVESTIGATING" && (
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="minibtn warn" disabled={isBusy} onClick={() => judge(c.fraudCaseId, "FRAUD")}>사기 처리</button>
                        <button className="minibtn" disabled={isBusy} onClick={() => judge(c.fraudCaseId, "NORMAL")}>정상 처리</button>
                      </div>
                    )}
                    {c.caseStatus === "CLOSED" && (
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
