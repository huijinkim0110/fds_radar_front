import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
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
  const { isDark, toggleDarkMode } = useTheme();
  const adminId = user?.userId;

  const [dashboard, setDashboard] = useState(null);
  const [dashboardError, setDashboardError] = useState(null);
  const [myCases, setMyCases] = useState([]);
  const [casesError, setCasesError] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isCasesOpen, setIsCasesOpen] = useState(true);
  const [priorityFilter, setPriorityFilter] = useState("ALL");

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

  const filteredCases = useMemo(() => {
    if (priorityFilter === "ALL") return myCases;
    return myCases.filter((c) => {
      const label = getCasePriorityLabel(c.priority);
      return c.priority === priorityFilter || label === priorityFilter;
    });
  }, [myCases, priorityFilter]);

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

      {/* 상단 레이아웃 */}
      <div className="cols">
        <div style={{ flex: 1 }}>
          {loading ? (
            <div className="loading">불러오는 중…</div>
          ) : dashboardError ? (
            <Panel><div className="prod-empty">{dashboardError}</div></Panel>
          ) : (
            <div className="kpis" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {kpis.map((k, i) => <KpiCard key={i} {...k} />)}
            </div>
          )}
        </div>

        <div style={{ flex: 1 }}>
          <Panel title="처리 현황" sub="내 담당 기준">
            {dashboard ? (
              <div className="admin-stat" style={{ padding: "8px 0" }}>
                <div className="admin-stat-row"><span>접수</span><b>{dashboard.receivedCaseCount}건</b></div>
                <div className="admin-stat-row"><span>조사중</span><b style={{ color: "var(--amber)" }}>{dashboard.investigatingCaseCount}건</b></div>
                <div className="admin-stat-row"><span>종결</span><b style={{ color: "var(--green)" }}>{dashboard.closedCaseCount}건</b></div>
              </div>
            ) : (
              <div className="prod-empty">데이터 없음</div>
            )}
          </Panel>
        </div>
      </div>

      {/* 중단 레이아웃: 바로가기 슬림화 & 내 담당 사건 넓게 확보 */}
      <div className="cols" style={{ marginTop: 16, alignItems: "stretch", display: "flex", gap: "16px" }}>
        
        {/* 좌측: 바로가기 (폭을 180px로 딱 고정) */}
        <div style={{ width: "180px", flexShrink: 0 }}>
          <Panel title="바로가기" sub="관리 업무">
            <div className="feed" style={{ display: "flex", flexDirection: "column", gap: "4px", paddingRight: 0 }}>
              <div className="fitem" style={{ cursor: "pointer", padding: "6px 0", gap: "6px" }} onClick={() => navigate("/mypage/admin-fraud-analysis")}>
                <span className="fdot" style={{ background: "var(--blue)", flexShrink: 0 }} />
                <div style={{ minWidth: 0, overflow: "hidden" }}>
                  <div className="ft" style={{ fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>오탐·미탐 분석</div>
                  <div className="fm" style={{ fontSize: 11, whiteSpace: "nowrap" }}>이상거래 분석</div>
                </div>
              </div>

              <div className="fitem" style={{ cursor: "pointer", padding: "6px 0", gap: "6px" }} onClick={() => navigate("/mypage/admin-lock-requests")}>
                <span className="fdot" style={{ background: "var(--amber)", flexShrink: 0 }} />
                <div style={{ minWidth: 0, overflow: "hidden" }}>
                  <div className="ft" style={{ fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>잠금 요청 이력</div>
                  <div className="fm" style={{ fontSize: 11, whiteSpace: "nowrap" }}>잠금 요청 처리</div>
                </div>
              </div>

              <div className="fitem" style={{ cursor: "pointer", padding: "6px 0", gap: "6px" }} onClick={() => navigate("/mypage/admin-disputes")}>
                <span className="fdot" style={{ background: "var(--red)", flexShrink: 0 }} />
                <div style={{ minWidth: 0, overflow: "hidden" }}>
                  <div className="ft" style={{ fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>이의제기</div>
                  <div className="fm" style={{ fontSize: 11, whiteSpace: "nowrap" }}>이의제기 심사</div>
                </div>
              </div>

              <div className="fitem" style={{ cursor: "pointer", padding: "6px 0", gap: "6px" }} onClick={() => navigate("/mypage/profile")}>
                <span className="fdot" style={{ background: "var(--muted)", flexShrink: 0 }} />
                <div style={{ minWidth: 0, overflow: "hidden" }}>
                  <div className="ft" style={{ fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>내 정보 관리</div>
                  <div className="fm" style={{ fontSize: 11, whiteSpace: "nowrap" }}>관리자 정보</div>
                </div>
              </div>
            </div>
          </Panel>
        </div>

        {/* 우측: 내 담당 사건 (남는 공간 전체 차지) */}
        <div style={{ flex: 1, minWidth: 0 }}>
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