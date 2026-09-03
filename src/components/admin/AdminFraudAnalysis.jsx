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

const TYPE_COLORS = ["var(--red)", "var(--amber)", "var(--blue)", "#7C3AED", "var(--green)"];

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
  const totalRisk = RISK_ORDER.reduce(
    (sum, r) => sum + (stats.risk.find((x) => x.priority === r.level)?.count ?? 0),
    0
  );

  return (
    <>
      <TopBar title="이상거래 분석" crumb="관리자 / 이상거래 관리" search={false} />

      {/* KPI */}
      <div className="kpis">
        {kpis.map((k, i) => <KpiCard key={i} {...k} />)}
      </div>

      {/* 최근 7일 추이 (막대) */}
      <Panel title="최근 7일 탐지 추이" sub="일별 이상거래 탐지 건수" style={{ marginTop: 16 }}>
        <div className="bar-chart">
          {stats.daily.map((d, i) => (
            <div className="bar-col" key={i}>
              <div className="bar-val">{d.count}</div>
              <div className="bar-track">
                <div className="bar-fill" style={{ height: `${(d.count / maxDaily) * 100}%` }} />
              </div>
              <div className="bar-label">{d.date.slice(5)}</div>
            </div>
          ))}
        </div>
      </Panel>

      <div className="cols" style={{ marginTop: 16 }}>
        {/* 유형별 분포 (가로 막대) */}
        <Panel title="이상거래 유형별 분포" sub="전체 사건 기준">
          {stats.types.length === 0 ? (
            <div style={{ color: "var(--muted)", fontSize: 13 }}>아직 분류된 이상거래 유형이 없습니다.</div>
          ) : (
            <div className="hbar-list">
              {stats.types.map((t, i) => (
                <div className="hbar-item" key={i}>
                  <div className="hbar-top">
                    <span>{getPredictedFraudTypeLabel(t.fraudType)}</span>
                    <b>{t.count}건</b>
                  </div>
                  <div className="hbar-track">
                    <div className="hbar-fill" style={{ width: `${(t.count / maxType) * 100}%`, background: TYPE_COLORS[i % TYPE_COLORS.length] }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>

        {/* 위험도 비율 */}
        <Panel title="위험도 비율" sub="전체 사건 기준">
          <div className="risk-bars">
            {RISK_ORDER.map((r, i) => {
              const count = stats.risk.find((x) => x.priority === r.level)?.count ?? 0;
              const pct = totalRisk > 0 ? Math.round((count / totalRisk) * 100) : 0;
              return (
                <div className="risk-row" key={i}>
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
          <div className="risk-note">
            AI 점수 0.90 이상은 높음, 0.80~0.90은 중간, 0.70~0.80은 낮음으로 분류됩니다.
          </div>
        </Panel>
      </div>
    </>
  );
}