import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { getAdminDashboard, getMyCases } from "../../api/fraud/fraudCaseAPI";
import { getPendingLockRequests } from "../../api/dispute/lockRequestAPI";
import { getAllFraudReports } from "../../api/fraud/fraudReportAPI";
import {
  getCaseStatusLabel,
  getCasePriorityLabel,
  formatProbabilityPercent,
  formatDateTime,
} from "../../constants/fraud/fraudCaseLabels";
import TopBar from "../TopBar.jsx";
import Panel from "../Panel.jsx";
import KpiCard from "../KpiCard.jsx";

export default function AdminMyPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDark, toggleDarkMode } = useTheme();
  const adminId = user?.userId;

  const [dashboard, setDashboard] = useState(null);
  const [dashboardError, setDashboardError] = useState(null);
  const [myCases, setMyCases] = useState([]);
  const [casesError, setCasesError] = useState(null);
  const [pendingLockCount, setPendingLockCount] = useState(0);
  const [pendingReportCount, setPendingReportCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!adminId) {
      setLoading(false);
      return;
    }
    setLoading(true);

    Promise.all([
      getAdminDashboard(adminId).then(setDashboard).catch(() => setDashboardError("대시보드를 불러오지 못했습니다.")),
      getMyCases(adminId).then(setMyCases).catch(() => setCasesError("담당 사건 목록을 불러오지 못했습니다.")),
      getPendingLockRequests().then((data) => setPendingLockCount(data.length)).catch(() => {}),
      getAllFraudReports().then((data) => setPendingReportCount(data.filter((r) => r.status !== "PROCESSED").length)).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, [adminId]);

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

  // KPI 카드 (대시보드 데이터 기반)
  const receivedCount = dashboard?.receivedCaseCount ?? 0;
  const investigatingCount = dashboard?.investigatingCaseCount ?? 0;
  const closedCount = dashboard?.closedCaseCount ?? 0;
  const total = receivedCount + investigatingCount + closedCount;
  const pctOf = (n) => (total > 0 ? Math.min(100, Math.round((n / total) * 100)) : 0);

  const kpis = dashboard
    ? [
        { k: "배정된 사건", v: `${total}건`, d: "전체", dir: "up", pct: total > 0 ? 100 : 0, color: "var(--blue)" },
        { k: "접수", v: `${receivedCount}건`, d: `오늘 ${dashboard.todayReceivedCaseCount}건`, dir: "up", pct: pctOf(receivedCount), color: "var(--muted)" },
        { k: "조사중", v: `${investigatingCount}건`, d: "처리 중", dir: "up", pct: pctOf(investigatingCount), color: "var(--amber)" },
        { k: "종결", v: `${closedCount}건`, d: "완료", dir: "down", pct: pctOf(closedCount), color: "var(--green)" },
      ]
    : [];

  // 위험도별 사건: 내 담당 사건(myCases)의 priority를 프론트에서 집계
  const highPriorityCount = myCases.filter((c) => c.priority === "HIGH").length;
  const mediumPriorityCount = myCases.filter((c) => c.priority === "MEDIUM").length;
  const lowPriorityCount = myCases.filter((c) => c.priority === "LOW").length;

  // 미처리 사건: 종결(CLOSED)이 아닌 사건 = 접수 + 조사중
  const unresolvedCases = myCases.filter((c) => c.caseStatus !== "CLOSED");

  return (
    <>
      <TopBar title="관리자 대시보드" crumb={`관리자 / ${user?.name || "관리자"}님`} search={false} />

      {/* KPI */}
      {loading ? (
        <div className="loading">불러오는 중…</div>
      ) : dashboardError ? (
        <Panel><div className="prod-empty">{dashboardError}</div></Panel>
      ) : (
        <div className="kpis">
          {kpis.map((k, i) => <KpiCard key={i} {...k} />)}
        </div>
      )}

      {/* 위험도별 사건 + 바로가기 */}
      <div className="cols" style={{ marginTop: 16 }}>
        <Panel title="위험도별 사건" sub="내 담당 기준">
          {dashboard ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 52, marginTop: 16 }}>  {/* marginTop 추가 */}
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 52, fontSize: 13, fontWeight: 600 }}>{getCasePriorityLabel("HIGH")}</div>
                  <div style={{ flex: 1, height: 10, borderRadius: 999, background: "#eef1f5", overflow: "hidden" }}>
                    <div style={{ width: `${myCases.length > 0 ? Math.round((highPriorityCount / myCases.length) * 100) : 0}%`, height: "100%", background: "var(--red)" }} />
                  </div>
                  <div style={{ width: 30, textAlign: "right", fontWeight: 700 }}>{highPriorityCount}건</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 52, fontSize: 13, fontWeight: 600 }}>{getCasePriorityLabel("MEDIUM")}</div>
                  <div style={{ flex: 1, height: 10, borderRadius: 999, background: "#eef1f5", overflow: "hidden" }}>
                    <div style={{ width: `${myCases.length > 0 ? Math.round((mediumPriorityCount / myCases.length) * 100) : 0}%`, height: "100%", background: "var(--amber)" }} />
                  </div>
                  <div style={{ width: 30, textAlign: "right", fontWeight: 700 }}>{mediumPriorityCount}건</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 52, fontSize: 13, fontWeight: 600 }}>{getCasePriorityLabel("LOW")}</div>
                  <div style={{ flex: 1, height: 10, borderRadius: 999, background: "#eef1f5", overflow: "hidden" }}>
                    <div style={{ width: `${myCases.length > 0 ? Math.round((lowPriorityCount / myCases.length) * 100) : 0}%`, height: "100%", background: "var(--green)" }} />
                  </div>
                  <div style={{ width: 30, textAlign: "right", fontWeight: 700 }}>{lowPriorityCount}건</div>
                </div>
              </div>
            ) : (
              <div className="prod-empty">데이터 없음</div>
            )}
          </Panel>

        <Panel title="바로가기" sub="관리 업무">
          <div className="feed">
            <div className="fitem" style={{ cursor: "pointer" }} onClick={() => navigate("/mypage/admin-fraud-analysis")}>
              <span className="fdot" style={{ background: "var(--blue)" }} />
              <div><div className="ft">오탐·미탐 분석</div><div className="fm">이상거래 분석 보기</div></div>
            </div>
            <div className="fitem" style={{ cursor: "pointer" }} onClick={() => navigate("/mypage/admin-lock-requests")}>
              <span className="fdot" style={{ background: "var(--amber)" }} />
              <div><div className="ft">잠금 요청 이력</div><div className="fm">잠금 요청 처리 보기</div></div>
            </div>
            <div className="fitem" style={{ cursor: "pointer" }} onClick={() => navigate("/mypage/admin-reports")}>
              <span className="fdot" style={{ background: "var(--red)" }} />
              <div><div className="ft">신고</div><div className="fm">신고 처리 보기</div></div>
            </div>
            <div className="fitem" style={{ cursor: "pointer" }} onClick={() => navigate("/mypage/profile")}>
              <span className="fdot" style={{ background: "var(--muted)" }} />
              <div><div className="ft">내 정보 · 관리자정보</div><div className="fm">회원정보 보기</div></div>
            </div>
          </div>
        </Panel>
      </div>

      {/* 처리 필요 업무 */}
      <Panel style={{ marginTop: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 28, flexWrap: "wrap" }}>
          <div style={{ fontWeight: 700, fontSize: 13 }}>처리 필요 업무</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span className="fdot" style={{ background: "var(--red)" }} />
            <span style={{ fontSize: 13 }}>미처리</span>
            <b>{unresolvedCases.length}건</b>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span className="fdot" style={{ background: "var(--amber)" }} />
            <span style={{ fontSize: 13 }}>잠금 요청</span>
            <b>{pendingLockCount}건</b>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span className="fdot" style={{ background: "var(--blue)" }} />
            <span style={{ fontSize: 13 }}>신고 처리</span>
            <b>{pendingReportCount}건</b>
          </div>
        </div>
      </Panel>

      {/* 미처리 사건 (접수 + 조사중) */}
      <Panel title="미처리 사건" sub={`총 ${unresolvedCases.length}건`} style={{ marginTop: 16 }}>
        {casesError ? (
          <div className="prod-empty">{casesError}</div>
        ) : unresolvedCases.length === 0 ? (
          <div className="prod-empty">미처리 사건이 없습니다.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>사건ID</th><th>거래ID</th><th>이상확률</th>
                <th>우선순위</th><th>상태</th><th>접수일시</th><th></th>
              </tr>
            </thead>
            <tbody>
              {unresolvedCases.map((c) => (
                <tr key={c.fraudCaseId}>
                  <td className="tx">#{c.fraudCaseId}</td>
                  <td className="tx">{c.transactionId}</td>
                  <td className="amt">{formatProbabilityPercent(c.fraudProbability)}</td>
                  <td>{getCasePriorityLabel(c.priority)}</td>
                  <td>{getCaseStatusLabel(c.caseStatus)}</td>
                  <td style={{ fontSize: 11.5, color: "var(--muted)" }}>{formatDateTime(c.openedAt)}</td>
                  <td>
                    <button className="minibtn" onClick={() => navigate(`/mypage/admin-fraud-cases/${c.fraudCaseId}`)}>
                      상세
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>

      {/* 관리자 대시보드 하단 다크모드 설정 바 */}
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