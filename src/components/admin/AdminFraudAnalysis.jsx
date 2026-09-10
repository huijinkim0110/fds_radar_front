import { useEffect, useState } from "react";
import TopBar from "../TopBar.jsx";
import Panel from "../Panel.jsx";
import KpiCard from "../KpiCard.jsx";
import { getStats } from "../../api/fraud/fraudAnalysisAPI";
import {
  getPredictedFraudTypeLabel,
  getCasePriorityLabel,
  formatProbabilityPercent,
} from "../../constants/fraud/fraudCaseLabels";

const RISK_ORDER = [
  { level: "HIGH", color: "var(--red)" },
  { level: "MEDIUM", color: "var(--amber)" },
  { level: "LOW", color: "var(--green)" },
];

// 차트용 차분한 무채색 & 톤다운 컬러 팔레트 (기타 유형 포함)
const TYPE_COLORS = ["#475569", "#64748b", "#94a3b8", "#cbd5e1", "#e2e8f0"];

export default function AdminFraudAnalysis() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getStats()
      .then(setStats)
      .catch(() => setError("통계를 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, []);

  function distributeToHundred(counts) {
    const total = counts.reduce((a, b) => a + b, 0);
    if (total <= 0) return counts.map(() => 0);

    const raw = counts.map((c) => (c / total) * 100);
    const floors = raw.map(Math.floor);
    const remainder = 100 - floors.reduce((a, b) => a + b, 0);

    const order = raw
      .map((v, i) => ({ i, frac: v - Math.floor(v) }))
      .sort((a, b) => b.frac - a.frac);

    const result = [...floors];
    for (let k = 0; k < remainder; k++) {
      result[order[k].i] += 1;
    }
    return result;
  }

  if (loading) return <div>불러오는 중...</div>;
  if (error) return <div>{error}</div>;
  if (!stats) return null;

  const kpis = [
    { k: "이번 달 탐지", v: `${stats.monthlyDetectionCount}건`, d: "이번 달 누적", dir: "up", pct: Math.min(stats.monthlyDetectionCount * 5, 100), color: "var(--red)" },
    { k: "차단 처리", v: `${stats.blockedCount}건`, d: "종결·사기 확정", dir: "down", pct: Math.min(stats.blockedCount * 5, 100), color: "var(--blue)" },
    { k: "오탐(정상판정)", v: `${stats.falsePositiveCount}건`, d: "AI는 이상, 결과는 정상", dir: "down", pct: Math.min(stats.falsePositiveCount * 5, 100), color: "var(--amber)" },
    { k: "미탐(사후 확정)", v: `${stats.falseNegativeCount}건`, d: "AI는 정상, 결과는 사기", dir: "up", pct: Math.min(stats.falseNegativeCount * 5, 100), color: "var(--red)" },
    { k: "평균 AI점수", v: formatProbabilityPercent(stats.averageFraudProbability), d: "전체 사건 평균", dir: "up", pct: Math.round(stats.averageFraudProbability * 100), color: "var(--green)" },
  ];

  const maxDaily = Math.max(1, ...stats.daily.map((d) => d.count));
  const maxType = Math.max(1, ...stats.types.map((t) => t.count));

  const riskCounts = RISK_ORDER.map(
    (r) => stats.risk.find((x) => x.priority === r.level)?.count ?? 0
  );
  const riskPercents = distributeToHundred(riskCounts);

  return (
    <>
      <TopBar title="이상거래 분석" crumb="관리자 / 이상거래 관리" search={false} />

      {/* KPI */}
      <div className="kpis kpis-5">
        {kpis.map((k, i) => <KpiCard key={i} {...k} />)}
      </div>

      {/* 상단 2열: 최근 7일 탐지 추이 & 위험도 비율 (높이 정렬 완료) */}
      <div className="cols" style={{ marginTop: 16, alignItems: "stretch", display: "flex", gap: "16px" }}>
        
        {/* 최근 7일 탐지 추이 */}
        <div style={{ flex: 1, display: "flex" }}>
          <Panel title="최근 7일 탐지 추이" sub="일별 이상거래 탐지 건수" style={{ width: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div style={{ position: "relative", padding: "12px 0 0", flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
              
              {/* 점선 격자선 */}
              <div style={{ position: "absolute", top: 12, left: 0, right: 0, bottom: 28, display: "flex", flexDirection: "column", justifyContent: "space-between", pointerEvents: "none", opacity: 0.15 }}>
                <div style={{ borderBottom: "1px dashed var(--border-color)", width: "100%" }} />
                <div style={{ borderBottom: "1px dashed var(--border-color)", width: "100%" }} />
                <div style={{ borderBottom: "1px dashed var(--border-color)", width: "100%" }} />
              </div>

              {/* 무채색 막대 그래프 */}
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", height: "140px", paddingBottom: "16px", position: "relative", zIndex: 1 }}>
                {stats.daily.map((d, i) => {
                  const heightPercent = d.count > 0 ? (d.count / maxDaily) * 100 : 0;
                  const dateLabel = d.date ? d.date.slice(5) : "";

                  return (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end" }}>
                      
                      {/* 수치 표기 뱃지 */}
                      <div style={{ height: "20px", marginBottom: "4px", display: "flex", alignItems: "center" }}>
                        {d.count > 0 && (
                          <span style={{ fontSize: "11px", fontWeight: "bold", color: "#475569", background: "rgba(100, 116, 139, 0.12)", padding: "1px 6px", borderRadius: "8px" }}>
                            {d.count}
                          </span>
                        )}
                      </div>

                      {/* 차분한 슬레이트 무채색 막대 Bar */}
                      <div style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "flex-end", flex: 1 }}>
                        <div
                          style={{
                            width: "20px",
                            height: d.count > 0 ? `${Math.max(heightPercent, 8)}%` : "2px",
                            background: d.count > 0
                              ? "linear-gradient(180deg, #64748b 0%, #475569 100%)"
                              : "var(--border-color)",
                            borderRadius: d.count > 0 ? "4px 4px 2px 2px" : "2px",
                            transition: "all 0.3s ease",
                            opacity: d.count > 0 ? 1 : 0.25
                          }}
                        />
                      </div>

                      {/* 날짜 라벨 */}
                      <span style={{ marginTop: "8px", fontSize: "11px", color: d.count > 0 ? "var(--fg)" : "var(--muted)", fontWeight: d.count > 0 ? "bold" : "normal" }}>
                        {dateLabel}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </Panel>
        </div>

        {/* 위험도 비율 */}
        <div style={{ flex: 1, display: "flex" }}>
          <Panel title="위험도 비율" sub="전체 사건 기준" style={{ width: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div className="risk-bars" style={{ padding: "12px 0 8px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
              {RISK_ORDER.map((r, i) => {
                const pct = riskPercents[i];
                return (
                  <div className="risk-row" key={i} style={{ marginBottom: i < RISK_ORDER.length - 1 ? "12px" : "0" }}>
                    <div className="risk-label">
                      <span className="risk-dot" style={{ background: r.color }} />
                      {getCasePriorityLabel(r.level)}
                    </div>
                    <div className="risk-track">
                      <div className="risk-fill" style={{ width: `${pct}%`, background: r.color }} />
                    </div>
                    <b>{pct}%</b>
                  </div>
                );
              })}
            </div>
            <div className="risk-note" style={{ marginTop: "8px", paddingTop: "8px", borderTop: "1px dashed var(--border-color)" }}>
              AI 점수 0.90 이상은 높음, 0.80~0.90은 중간, 0.70~0.80은 낮음으로 분류됩니다.
            </div>
          </Panel>
        </div>

      </div>

      {/* 이상거래 유형별 분포 (기타 및 유형 막대 무채색 톤다운) */}
      <Panel title="이상거래 유형별 분포" sub="전체 사건 기준" style={{ marginTop: 16 }}>
        {stats.types.length === 0 ? (
          <div style={{ color: "var(--muted)", fontSize: 13, padding: "8px 0" }}>아직 분류된 이상거래 유형이 없습니다.</div>
        ) : (
          <div className="hbar-list">
            {stats.types.map((t, i) => {
              const typeLabel = getPredictedFraudTypeLabel(t.fraudType);
              const isOther = typeLabel === "기타" || t.fraudType === "OTHER" || t.fraudType === "ETC";
              
              // 기타 유형일 경우 연한 차콜 무채색 적용, 그 외는 슬레이트 톤다운 컬러 적용
              const barBg = isOther ? "#94a3b8" : TYPE_COLORS[i % TYPE_COLORS.length];

              return (
                <div className="hbar-item" key={i}>
                  <div className="hbar-top">
                    <span>{typeLabel}</span>
                    <b>{t.count}건</b>
                  </div>
                  <div className="hbar-track">
                    <div className="hbar-fill" style={{ width: `${(t.count / maxType) * 100}%`, background: barBg }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Panel>
    </>
  );
}