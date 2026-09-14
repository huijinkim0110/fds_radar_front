import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { getMyCases } from "../../api/fraud/fraudCaseAPI.js";
import { getAdminDashboard } from "../../api/admin/adminDashboardAPI.js";
import { getPendingLockRequests } from "../../api/dispute/lockRequestAPI.js";
import { getAllFraudReports } from "../../api/fraud/fraudReportAPI.js";
import {
  getCaseStatusLabel,
  getCasePriorityLabel,
  formatProbabilityPercent,
  formatDateTime,
} from "../../constants/fraud/fraudCaseLabels";
import TopBar from "../TopBar.jsx";
import Panel from "../Panel.jsx";
import KpiCard from "../KpiCard.jsx";

// TODO: fraudReportAPI.js에 이미 관리자 전체조회 함수(예: getAdminReports)가 있다면
// 아래 BASE_URL/직접 axios 호출 대신 그 함수를 import해서 쓰는 게 맞음.
const REPORT_BASE_URL = "http://localhost:9090";

export default function AdminMyPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDark, toggleDarkMode } = useTheme();
  const adminId = user?.userId;

  const [dashboard, setDashboard] = useState(null);
  const [dashboardError, setDashboardError] = useState(null);
  const [myCases, setMyCases] = useState([]);
  const [casesError, setCasesError] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isCasesOpen, setIsCasesOpen] = useState(true);
  const [priorityFilter, setPriorityFilter] = useState("ALL");

  // 처리 필요 업무: 잠금 요청 대기 / 신고 처리 대기 건수
  const [pendingLockCount, setPendingLockCount] = useState(null);
  const [pendingReportCount, setPendingReportCount] = useState(null);

  useEffect(() => {
    if (!adminId) {
      setLoading(false);
      return;
    }
    setLoading(true);

      Promise.all([
      getAdminDashboard(adminId).then(setDashboard).catch(() => setDashboardError("대시보드를 불러오지 못했습니다.")),
      getMyCases(adminId).then(setMyCases).catch(() => setCasesError("담당 사건 목록을 불러오지 못했습니다.")),
      getPendingLockRequests()
        .then((list) => setPendingLockCount(Array.isArray(list) ? list.length : 0))
        .catch(() => setPendingLockCount(null)),
      getAllFraudReports()
        .then((list) => {
          const reports = Array.isArray(list) ? list : [];
          // PROCESSED(처리 완료)가 아닌 신고(RECEIVED/UNDER_REVIEW)를 "처리 필요"로 집계
          const pending = reports.filter((r) => r.status !== "PROCESSED").length;
          setPendingReportCount(pending);
        })
        .catch(() => setPendingReportCount(null)),
    ]).finally(() => setLoading(false));
  }, [adminId]);
  
  const filteredCases = useMemo(() => {
    if (priorityFilter === "ALL") return myCases;
    return myCases.filter((c) => {
      const label = getCasePriorityLabel(c.priority);
      return c.priority === priorityFilter || label === priorityFilter;
    });
  }, [myCases, priorityFilter]);

  // 내 담당 사건을 위험도(HIGH/MEDIUM/LOW)별로 집계 — 상태(접수/조사중/종결)와 무관하게 전체 기준
  const priorityBreakdown = useMemo(() => {
    const counts = { HIGH: 0, MEDIUM: 0, LOW: 0 };
    myCases.forEach((c) => {
      if (counts[c.priority] !== undefined) counts[c.priority] += 1;
    });
    return counts;
  }, [myCases]);

  if (!adminId) {
    return (
      <>
        <TopBar title="관리자 대시보드" crumb="관리자 / 내 업무" search={false} />
        <Panel>
          <div className="prod-empty">
            관리자 정보를 불러올 수 없습니다. 다시 로그인해 주세요.
          </div>
        </Panel>
      </>
    );
  }

  // 전체 사건 합계 계산 (접수 + 조사중 + 종결)
  const totalCasesCount = dashboard
    ? ((dashboard.fraud?.receivedCaseCount || 0) + (dashboard.fraud?.investigatingCaseCount || 0) + (dashboard.fraud?.closedCaseCount || 0))
    : 0;

  const kpis = dashboard
    ? [

        { k: "배정된 사건", v: `${totalCasesCount}건`, d: "전체 사건", dir: "up", pct: 100, color: "var(--blue)" },
        { k: "접수", v: `${dashboard.fraud.receivedCaseCount || 0}건`, d: "신규 접수", dir: "up", pct: 45, color: "var(--red)" },
        { k: "조사중", v: `${dashboard.fraud.investigatingCaseCount || 0}건`, d: "처리 중", dir: "up", pct: 50, color: "var(--amber)" },
        { k: "종결", v: `${dashboard.fraud.closedCaseCount || 0}건`, d: "완료", dir: "down", pct: 80, color: "var(--green)" },

      ]
    : [];

  // 처리 필요 업무 3항목 (건수, 색상, 이동 경로)
  const actionItems = [
    {
      key: "unhandled-cases",
      label: "미처리 사건",
      desc: "접수 후 조사 미시작",
      count: dashboard ? (dashboard.fraud?.receivedCaseCount ?? 0) : null,
      color: "var(--red)",
      onClick: () => navigate("/mypage/admin-fraud-cases"),
    },
    {
      key: "lock-requests",
      label: "잠금 요청",
      desc: "승인/반려 대기 중",
      count: pendingLockCount,
      color: "var(--amber)",
      onClick: () => navigate("/mypage/admin-lock-requests"),
    },
    {
      key: "reports",
      label: "신고 처리",
      desc: "접수/검토중 신고",
      count: pendingReportCount,
      color: "var(--blue)",
      onClick: () => navigate("/mypage/admin-reports"),
    },
  ];

  return (
    <>
      <TopBar title="관리자 대시보드" crumb={`관리자 / ${user?.name || "관리자"}님`} search={false} />

      {/* 상단 레이아웃: alignItems: "stretch" 적용으로 양쪽 높이 동일하게 고정 */}
      <div className="cols" style={{ display: "flex", gap: "16px", alignItems: "stretch" }}>
        
        {/* 좌측: KPI 카드 4개 */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {loading ? (
            <div className="loading" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>불러오는 중…</div>
          ) : dashboardError ? (
            <Panel style={{ height: "100%" }}><div className="prod-empty">{dashboardError}</div></Panel>
          ) : (
            <div className="kpis" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", height: "100%" }}>
              {kpis.map((k, i) => <KpiCard key={i} {...k} />)}
            </div>
          )}
        </div>

        {/* 우측: 처리 현황 Panel — 위험도별 */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <Panel title="처리 현황" sub="내 담당 기준 · 위험도별" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
            {dashboard ? (
              <div className="admin-stat" style={{ padding: "8px 0", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-around" }}>
                <div className="admin-stat-row"><span>총 배정 사건</span><b style={{ color: "var(--blue)" }}>{totalCasesCount}건</b></div>
                <div className="admin-stat-row"><span>높음</span><b style={{ color: "var(--red)" }}>{priorityBreakdown.HIGH}건</b></div>
                <div className="admin-stat-row"><span>보통</span><b style={{ color: "var(--amber)" }}>{priorityBreakdown.MEDIUM}건</b></div>
                <div className="admin-stat-row"><span>낮음</span><b style={{ color: "var(--green)" }}>{priorityBreakdown.LOW}건</b></div>
              </div>
            ) : (
              <div className="prod-empty">데이터 없음</div>
            )}
          </Panel>
        </div>

        <div style={{ flex: 1 }}>
          <Panel title="상담 현황" sub="내 담당 기준">
            {dashboard ? (
              <div className="admin-stat" style={{ padding: "8px 0" }}>
                <div className="admin-stat-row"><span>전체 대기</span><b style={{ color: "var(--amber)" }}>{dashboard.chat.totalWaitingChatCount}건</b></div>
                <div className="admin-stat-row"><span>내 대기</span><b style={{ color: "var(--amber)" }}>{dashboard.chat.myWaitingChatCount}건</b></div>
                <div className="admin-stat-row"><span>내 진행중</span><b style={{ color: "var(--green)" }}>{dashboard.chat.myInProgressChatCount}건</b></div>
              </div>
            ) : (
              <div className="prod-empty" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>데이터 없음</div>
            )}
          </Panel>
        </div>

      </div>

      {/* 처리 필요 업무: 미처리 사건 / 잠금 요청 / 신고 처리 */}
      <div style={{ marginTop: 16 }}>
        <Panel title="처리 필요 업무" sub="즉시 확인이 필요한 항목">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
            {actionItems.map((item) => (
              <div
                key={item.key}
                onClick={item.onClick}
                style={{
                  cursor: "pointer",
                  border: "1px solid var(--border-color)",
                  borderRadius: 8,
                  padding: "12px 14px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{item.label}</div>
                  <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 2 }}>{item.desc}</div>
                </div>
                <b style={{ fontSize: 18, color: item.count ? item.color : "var(--muted)", flexShrink: 0, marginLeft: 8 }}>
                  {item.count === null ? "-" : `${item.count}건`}
                </b>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* 내 담당 사건 (전체 폭) */}
      <div style={{ marginTop: 16 }}>
        <Panel>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: isCasesOpen ? 12 : 0 }}>
            <div>
              <span style={{ fontSize: 16, fontWeight: "bold" }}>내 담당 사건</span>
              <span style={{ fontSize: 12, color: "var(--muted)", marginLeft: 8 }}>총 {filteredCases.length}건</span>
            </div>

            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {isCasesOpen && (
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  style={{ padding: "3px 6px", fontSize: 12, borderRadius: 4, borderColor: "var(--border-color)", cursor: "pointer" }}
                >
                  <option value="ALL">우선순위 전체</option>
                  <option value="낮음">낮음</option>
                  <option value="보통">보통</option>
                  <option value="높음">높음</option>
                </select>
              )}

              <button
                type="button"
                className="minibtn"
                onClick={() => setIsCasesOpen((prev) => !prev)}
              >
                {isCasesOpen ? "접기 ▲" : "펼치기 ▼"}
              </button>
            </div>
          </div>

          {isCasesOpen && (
            casesError ? (
              <div className="prod-empty">{casesError}</div>
            ) : filteredCases.length === 0 ? (
              <div className="prod-empty">담당 중인 사건이 없습니다.</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", tableLayout: "auto" }}>
                  <thead>
                    <tr>
                      <th style={{ whiteSpace: "nowrap" }}>사건ID</th>
                      <th style={{ whiteSpace: "nowrap" }}>거래ID</th>
                      <th style={{ whiteSpace: "nowrap" }}>이상확률</th>
                      <th style={{ whiteSpace: "nowrap" }}>우선순위</th>
                      <th style={{ whiteSpace: "nowrap" }}>상태</th>
                      <th style={{ whiteSpace: "nowrap" }}>접수일시</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCases.map((c) => (
                      <tr key={c.fraudCaseId}>
                        <td className="tx" style={{ whiteSpace: "nowrap" }}>#{c.fraudCaseId}</td>
                        <td className="tx" style={{ whiteSpace: "nowrap" }}>{c.transactionId}</td>
                        <td className="amt" style={{ whiteSpace: "nowrap" }}>{formatProbabilityPercent(c.fraudProbability)}</td>
                        <td style={{ whiteSpace: "nowrap" }}>{getCasePriorityLabel(c.priority)}</td>
                        <td style={{ whiteSpace: "nowrap" }}>{getCaseStatusLabel(c.caseStatus)}</td>
                        <td style={{ fontSize: 11.5, color: "var(--muted)", whiteSpace: "nowrap" }}>{formatDateTime(c.openedAt)}</td>
                        <td style={{ whiteSpace: "nowrap" }}>
                          <button className="minibtn" onClick={() => navigate(`/mypage/admin-fraud-cases/${c.fraudCaseId}`)}>
                            상세
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </Panel>
      </div>

      {/* 하단 테마 바 */}
      <div className="panel" style={{ marginTop: 20 }}>
        <div className="setrow" style={{ padding: "4px 0", borderBottom: "none" }}>
          <div>
            <div className="st">화면 테마 설정</div>
            <div className="sm">다크모드로 눈의 피로를 줄여보세요.</div>
          </div>
          <button
            type="button"
            className={`toggle ${isDark ? "on" : ""}`}
            onClick={toggleDarkMode}
            aria-label="다크모드 토글"
          />
        </div>
      </div>
    </>
  );
}