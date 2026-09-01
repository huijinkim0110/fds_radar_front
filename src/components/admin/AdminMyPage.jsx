import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext"; // 다크모드용 Context 추가
import { getAdminDashboard, getMyCases } from "../../api/fraud/fraudCaseAPI";
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
  const { isDark, toggleDarkMode } = useTheme(); // 다크모드 상태 및 토글 함수
  const adminId = user?.userId;   // 로그인한 관리자 ID (드롭다운 대체)

  const [dashboard, setDashboard] = useState(null);
  const [dashboardError, setDashboardError] = useState(null);
  const [myCases, setMyCases] = useState([]);
  const [casesError, setCasesError] = useState(null);
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
    ]).finally(() => setLoading(false));
  }, [adminId]);

  // 로그인 정보에 userId 없을 때
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
  const kpis = dashboard
    ? [
        { k: "배정된 사건", v: `${dashboard.assignedCaseCount}건`, d: "진행 중", dir: "up", pct: 60, color: "var(--blue)" },
        { k: "오늘 접수", v: `${dashboard.todayReceivedCaseCount}건`, d: "전체", dir: "up", pct: 45, color: "var(--red)" },
        { k: "조사중", v: `${dashboard.investigatingCaseCount}건`, d: "처리 중", dir: "up", pct: 50, color: "var(--amber)" },
        { k: "종결", v: `${dashboard.closedCaseCount}건`, d: "완료", dir: "down", pct: 80, color: "var(--green)" },
      ]
    : [];

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

      {/* 처리 현황 요약 + 바로가기 */}
      <div className="cols" style={{ marginTop: 16 }}>
        <Panel title="처리 현황" sub="내 담당 기준">
          {dashboard ? (
            <div className="admin-stat">
              <div className="admin-stat-row"><span>접수</span><b>{dashboard.receivedCaseCount}건</b></div>
              <div className="admin-stat-row"><span>조사중</span><b style={{ color: "var(--amber)" }}>{dashboard.investigatingCaseCount}건</b></div>
              <div className="admin-stat-row"><span>종결</span><b style={{ color: "var(--green)" }}>{dashboard.closedCaseCount}건</b></div>
            </div>
          ) : (
            <div className="prod-empty">데이터 없음</div>
          )}
        </Panel>

        {/* 바로가기 */}
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
            <div className="fitem" style={{ cursor: "pointer" }} onClick={() => navigate("/mypage/admin-disputes")}>
              <span className="fdot" style={{ background: "var(--red)" }} />
              <div><div className="ft">이의제기</div><div className="fm">이의제기 심사 보기</div></div>
            </div>
            <div className="fitem" style={{ cursor: "pointer" }} onClick={() => navigate("/mypage/profile")}>
              <span className="fdot" style={{ background: "var(--muted)" }} />
              <div><div className="ft">내 정보 · 관리자정보</div><div className="fm">회원정보 보기</div></div>
            </div>
          </div>
        </Panel>
      </div>

      {/* 내 담당 사건 */}
      <Panel title="내 담당 사건" sub={`총 ${myCases.length}건`} style={{ marginTop: 16 }}>
        {casesError ? (
          <div className="prod-empty">{casesError}</div>
        ) : myCases.length === 0 ? (
          <div className="prod-empty">담당 중인 사건이 없습니다.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>사건ID</th><th>거래ID</th><th>이상확률</th>
                <th>우선순위</th><th>상태</th><th>접수일시</th><th></th>
              </tr>
            </thead>
            <tbody>
              {myCases.map((c) => (
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