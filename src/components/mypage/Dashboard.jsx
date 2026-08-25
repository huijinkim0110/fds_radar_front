import { useEffect, useState } from "react";
import { getFavorites } from "../../api/financialProduct/favoriteProductAPI";
import { getPortfolio } from "../../api/financialProduct/simulatedSubscriptionAPI";
import { getLatestProfile, hasDiagnosisHistory } from "../../api/finance/investmentProfileAPI";
import { getFinancialProfile, hasFinancialProfile } from "../../api/finance/financialProfileAPI";
import { isStale, formatElapsed } from "../../utils/staleness";
import TopBar from "../TopBar.jsx";
import Panel from "../Panel.jsx";
import KpiCard from "../KpiCard.jsx";

const TEMP_USER_ID = 1;

const RISK_TENDENCY_LABELS = {
  STABLE: "안정형",
  NEUTRAL: "중립형",
  ACTIVE: "적극형",
  AGGRESSIVE: "공격형",
};

function Dashboard() {
  const [favoriteCount, setFavoriteCount] = useState(null);
  const [activeSubscriptionCount, setActiveSubscriptionCount] = useState(null);
  const [latestProfile, setLatestProfile] = useState(null);
  const [hasDiagnosis, setHasDiagnosis] = useState(null);
  const [financialProfile, setFinancialProfile] = useState(null);
  const [hasFinProfile, setHasFinProfile] = useState(null);

  useEffect(() => {
    getFavorites(TEMP_USER_ID)
      .then((list) => setFavoriteCount(list.length))
      .catch(() => {});

    getPortfolio(TEMP_USER_ID)
      .then((list) =>
        setActiveSubscriptionCount(list.filter((s) => s.subscriptionStatus === "ACTIVE").length)
      )
      .catch(() => {});

    hasDiagnosisHistory(TEMP_USER_ID).then(setHasDiagnosis).catch(() => {});
    hasFinancialProfile(TEMP_USER_ID).then(setHasFinProfile).catch(() => {});
  }, []);

  useEffect(() => {
    if (hasDiagnosis) {
      getLatestProfile(TEMP_USER_ID).then(setLatestProfile).catch(() => {});
    }
  }, [hasDiagnosis]);

  useEffect(() => {
    if (hasFinProfile) {
      getFinancialProfile(TEMP_USER_ID).then(setFinancialProfile).catch(() => {});
    }
  }, [hasFinProfile]);

  // 오래된 데이터 안내
  const staleNotices = [];
  if (latestProfile && isStale(latestProfile.diagnosedAt)) {
    staleNotices.push(`투자성향 진단이 ${formatElapsed(latestProfile.diagnosedAt)}이에요. 재진단을 권장해요.`);
  }
  if (financialProfile && isStale(financialProfile.updatedAt ?? financialProfile.createdAt)) {
    staleNotices.push(
      `재무 프로필을 ${formatElapsed(financialProfile.updatedAt ?? financialProfile.createdAt)} 수정 안했어요. 업데이트를 권장해요.`
    );
  }

  // KPI 카드 데이터 (2번 스타일의 KpiCard 포맷에 맞춤)
  const kpis = [
    {
      k: "가입한 상품",
      v: activeSubscriptionCount === null ? "…" : `${activeSubscriptionCount}건`,
      d: "가입중",
      dir: "down",
      pct: activeSubscriptionCount ? Math.min(activeSubscriptionCount * 20, 100) : 0,
      color: "var(--blue)",
    },
    {
      k: "관심 상품",
      v: favoriteCount === null ? "…" : `${favoriteCount}건`,
      d: "등록됨",
      dir: "down",
      pct: favoriteCount ? Math.min(favoriteCount * 20, 100) : 0,
      color: "var(--green)",
    },
    {
      k: "투자성향",
      v: hasDiagnosis === false ? "미진단" : latestProfile ? RISK_TENDENCY_LABELS[latestProfile.riskTendency] : "…",
      d: hasDiagnosis === false ? "진단 필요" : "최근 진단",
      dir: hasDiagnosis === false ? "up" : "down",
      pct: latestProfile ? 100 : 20,
      color: "var(--amber)",
    },
    {
      k: "재무 프로필",
      v: hasFinProfile === false ? "미작성" : hasFinProfile ? "작성됨" : "…",
      d: hasFinProfile === false ? "작성 필요" : "정상",
      dir: hasFinProfile === false ? "up" : "down",
      pct: hasFinProfile ? 100 : 20,
      color: "var(--blue)",
    },
  ];

  return (
    <>
      <TopBar title="내 대시보드" crumb="홈 / 마이페이지" search={false} />

      {/* 오래된 데이터 안내 배너 */}
      {staleNotices.length > 0 && (
        <div className="cols" style={{ gridTemplateColumns: "1fr", marginBottom: 16 }}>
          <Panel title="확인이 필요해요" sub="오래된 정보">
            <div className="feed">
              {staleNotices.map((msg, i) => (
                <div className="fitem" key={i}>
                  <span className="fdot" style={{ background: "var(--amber)" }} />
                  <div>
                    <div className="ft">{msg}</div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      )}

      {/* KPI 요약 */}
      <div className="kpis">
        {kpis.map((k, i) => (
          <KpiCard key={i} {...k} />
        ))}
      </div>

      {/* 상세 패널들 */}
      <div className="cols">
        <Panel title="자산·거래" sub="계좌·카드·보안">
          <div className="feed">
            <div className="fitem">
              <span className="fdot" style={{ background: "var(--blue)" }} />
              <div><div className="ft">계좌·카드</div><div className="fm">준비 중입니다.</div></div>
            </div>
            <div className="fitem">
              <span className="fdot" style={{ background: "var(--green)" }} />
              <div><div className="ft">보안·신고</div><div className="fm">준비 중입니다.</div></div>
            </div>
            <div className="fitem">
              <span className="fdot" style={{ background: "var(--amber)" }} />
              <div><div className="ft">자산관리</div><div className="fm">준비 중입니다.</div></div>
            </div>
          </div>
        </Panel>

        <Panel title="내 투자·재무" sub="진단 및 프로필">
          <div className="feed">
            <div className="fitem">
              <span className="fdot" style={{ background: latestProfile ? "var(--green)" : "var(--muted)" }} />
              <div>
                <div className="ft">투자성향</div>
                <div className="fm">
                  {hasDiagnosis === false
                    ? "아직 진단 이력이 없어요."
                    : latestProfile
                    ? RISK_TENDENCY_LABELS[latestProfile.riskTendency]
                    : "불러오는 중…"}
                </div>
              </div>
            </div>
            <div className="fitem">
              <span className="fdot" style={{ background: "var(--muted)" }} />
              <div><div className="ft">재무목표</div><div className="fm">준비 중입니다.</div></div>
            </div>
            <div className="fitem">
              <span className="fdot" style={{ background: "var(--muted)" }} />
              <div><div className="ft">내 정보</div><div className="fm">준비 중입니다.</div></div>
            </div>
          </div>
        </Panel>
      </div>
    </>
  );
}

export default Dashboard;