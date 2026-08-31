import TopBar from "../TopBar.jsx";
import Panel from "../Panel.jsx";
import KpiCard from "../KpiCard.jsx";

// 목데이터 (나중에 백엔드 통계 API로 교체)
const MOCK = {
  kpis: [
    { k: "이번 달 탐지", v: "247건", d: "지난달 +18%", dir: "up", pct: 78, color: "var(--red)" },
    { k: "차단 처리", v: "189건", d: "차단율 76%", dir: "down", pct: 76, color: "var(--blue)" },
    { k: "오탐(정상판정)", v: "58건", d: "23.5%", dir: "down", pct: 24, color: "var(--amber)" },
    { k: "평균 AI점수", v: "0.86", d: "위험 구간", dir: "up", pct: 86, color: "var(--green)" },
  ],
  // 최근 7일 탐지 건수
  daily: [
    { day: "월", count: 28 },
    { day: "화", count: 35 },
    { day: "수", count: 22 },
    { day: "목", count: 41 },
    { day: "금", count: 38 },
    { day: "토", count: 47 },
    { day: "일", count: 36 },
  ],
  // 유형별 분포
  types: [
    { name: "해외 결제", count: 82, color: "var(--red)" },
    { name: "심야 다발 결제", count: 61, color: "var(--amber)" },
    { name: "알 수 없는 가맹점", count: 48, color: "var(--blue)" },
    { name: "평소와 다른 지역", count: 34, color: "#7C3AED" },
    { name: "고액 이체", count: 22, color: "var(--green)" },
  ],
  // 위험도 비율
  risk: [
    { level: "높음", pct: 42, color: "var(--red)" },
    { level: "중간", pct: 35, color: "var(--amber)" },
    { level: "낮음", pct: 23, color: "var(--green)" },
  ],
};

export default function AdminFraudAnalysis() {
  const maxDaily = Math.max(...MOCK.daily.map((d) => d.count));
  const maxType = Math.max(...MOCK.types.map((t) => t.count));

  return (
    <>
      <TopBar title="이상거래 분석" crumb="관리자 / 이상거래 관리" search={false} />

      {/* KPI */}
      <div className="kpis">
        {MOCK.kpis.map((k, i) => <KpiCard key={i} {...k} />)}
      </div>

      {/* 최근 7일 추이 (막대) */}
      <Panel title="최근 7일 탐지 추이" sub="일별 이상거래 탐지 건수" style={{ marginTop: 16 }}>
        <div className="bar-chart">
          {MOCK.daily.map((d, i) => (
            <div className="bar-col" key={i}>
              <div className="bar-val">{d.count}</div>
              <div className="bar-track">
                <div className="bar-fill" style={{ height: `${(d.count / maxDaily) * 100}%` }} />
              </div>
              <div className="bar-label">{d.day}</div>
            </div>
          ))}
        </div>
      </Panel>

      <div className="cols" style={{ marginTop: 16 }}>
        {/* 유형별 분포 (가로 막대) */}
        <Panel title="이상거래 유형별 분포" sub="이번 달 기준">
          <div className="hbar-list">
            {MOCK.types.map((t, i) => (
              <div className="hbar-item" key={i}>
                <div className="hbar-top">
                  <span>{t.name}</span>
                  <b>{t.count}건</b>
                </div>
                <div className="hbar-track">
                  <div className="hbar-fill" style={{ width: `${(t.count / maxType) * 100}%`, background: t.color }} />
                </div>
              </div>
            ))}
          </div>
        </Panel>

        {/* 위험도 비율 */}
        <Panel title="위험도 비율" sub="전체 사건 기준">
          <div className="risk-bars">
            {MOCK.risk.map((r, i) => (
              <div className="risk-row" key={i}>
                <div className="risk-label">
                  <span className="risk-dot" style={{ background: r.color }} />
                  {r.level}
                </div>
                <div className="risk-track">
                  <div className="risk-fill" style={{ width: `${r.pct}%`, background: r.color }} />
                </div>
                <b>{r.pct}%</b>
              </div>
            ))}
          </div>
          <div className="risk-note">
            AI 점수 0.90 이상은 높음, 0.80~0.90은 중간, 0.70~0.80은 낮음으로 분류됩니다.
          </div>
        </Panel>
      </div>
    </>
  );
}