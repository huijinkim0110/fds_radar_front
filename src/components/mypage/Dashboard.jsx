import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFavorites } from "../../api/financialProduct/favoriteProductAPI";
import { getPortfolio } from "../../api/financialProduct/simulatedSubscriptionAPI";
import { getLatestProfile, hasDiagnosisHistory } from "../../api/finance/investmentProfileAPI";
import { getFinancialProfile, hasFinancialProfile } from "../../api/finance/financialProfileAPI";

import { getGoals } from "../../api/finance/financialGoalsAPI";

import { getMyAccounts } from "../../account/accountAPI";
import { getMyCards } from "../../account/cardAPI";
import { isStale, formatElapsed } from "../../utils/staleness";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext.jsx";
import AdminDashboard from "../admin/AdminMyPage.jsx";

import TopBar from "../TopBar.jsx";
import KpiCard from "../KpiCard.jsx";
import Panel from "../Panel.jsx";

const TEMP_USER_ID = 1;

const RISK_TENDENCY_LABELS = {
  STABLE: "안정형",
  NEUTRAL: "중립형",
  ACTIVE: "적극형",
  AGGRESSIVE: "공격형",
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isDark, toggleDarkMode } = useTheme();
  const userId = user?.userId;

  // ── 진짜 계좌·카드 (DB) ──
  const [accounts, setAccounts] = useState([]);
  const [cards, setCards] = useState([]);

  // 투자·재무 API 데이터
  const [favoriteCount, setFavoriteCount] = useState(null);
  const [subscriptions, setSubscriptions] = useState(null);
  const [goals, setGoals] = useState(null);
  const [latestProfile, setLatestProfile] = useState(null);
  const [hasDiagnosis, setHasDiagnosis] = useState(null);
  const [financialProfile, setFinancialProfile] = useState(null);
  const [hasFinProfile, setHasFinProfile] = useState(null);

  // 계좌·카드 로드 (로그인 유저 기준)
  useEffect(() => {
    if (!userId) return;
    getMyAccounts(userId).then(setAccounts).catch(() => {});
    getMyCards(userId).then(setCards).catch(() => {});
  }, [userId]);

  // 투자·재무 로드
  useEffect(() => {
    getFavorites(TEMP_USER_ID).then((list) => setFavoriteCount(list.length)).catch(() => {});
    getPortfolio(TEMP_USER_ID)

      .then((list) => setSubscriptions(list))
      .catch(() => {});

    getGoals(TEMP_USER_ID)

      .then((list) => setActiveSubscriptionCount(list.filter((s) => s.subscriptionStatus === "ACTIVE").length))

      .catch(() => {});
    hasDiagnosisHistory(TEMP_USER_ID).then(setHasDiagnosis).catch(() => {});
    hasFinancialProfile(TEMP_USER_ID).then(setHasFinProfile).catch(() => {});
  }, []);

  useEffect(() => {
    if (hasDiagnosis) getLatestProfile(TEMP_USER_ID).then(setLatestProfile).catch(() => {});
  }, [hasDiagnosis]);

  useEffect(() => {
    if (hasFinProfile) getFinancialProfile(TEMP_USER_ID).then(setFinancialProfile).catch(() => {});
  }, [hasFinProfile]);

  // 총 잔액 (진짜 계좌 합)
  const totalBalance = accounts.reduce((sum, a) => sum + Number(a.balance), 0);

  // 오래된 데이터 안내
  const staleNotices = [];
  if (latestProfile && isStale(latestProfile.diagnosedAt)) {
    staleNotices.push(`투자성향 진단이 ${formatElapsed(latestProfile.diagnosedAt)}이에요. 재진단을 권장해요.`);
  }
  if (financialProfile && isStale(financialProfile.updatedAt ?? financialProfile.createdAt)) {
    staleNotices.push(`재무 프로필을 ${formatElapsed(financialProfile.updatedAt ?? financialProfile.createdAt)} 수정 안했어요. 업데이트를 권장해요.`);
  }


  // 모의가입 전체 달성률 (실제 누적 납입액 / 목표 납입액)
  const totalPaid = (subscriptions ?? []).reduce((sum, s) => sum + (s.paidAmount ?? 0), 0);
  const totalTarget = (subscriptions ?? []).reduce((sum, s) => {
    const target = s.monthlyPayment != null ? s.monthlyPayment * s.subscriptionPeriod : s.subscriptionAmount;
    return sum + (target ?? 0);
  }, 0);
  const subscriptionAchievementRate = totalTarget === 0 ? 0 : Math.round((totalPaid / totalTarget) * 1000) / 10;

  // 재무목표 전체 평균 달성률
  const avgGoalAchievement = !goals || goals.length === 0
    ? 0
    : Math.round((goals.reduce((sum, g) => sum + (g.achievementRate ?? 0), 0) / goals.length) * 10) / 10;

  // 송금 처리 함수
  async function handleTransfer(e) {
    e.preventDefault();
    const amt = Number(form.amount);
    if (!amt || amt <= 0) return setTransferMsg("금액을 입력해주세요.");
    if (amt > balance) return setTransferMsg("잔액이 부족합니다.");

    try {
      setBalance((prev) => prev - amt);  // 화면 잔액 즉시 차감
      setTxns((prev) => [
        {
          time: new Date().toLocaleString("ko-KR", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }),
          name: `이체 · ${form.recipient}`,
          kind: "이체",
          amt: `₩ ${amt.toLocaleString()}`,
          status: "정상",
        },
        ...prev.slice(0, 3),
      ]);
      setTransferMsg("송금이 완료되었습니다.");
      setForm({ recipient: "", amount: "" });
      setTimeout(() => {
        setShowTransfer(false);
        setTransferMsg("");
      }, 1500);
    } catch (err) {
      setTransferMsg("송금에 실패했습니다.");
    }
  }

  // KPI 카드 구성 (두 번째 API 데이터 + 첫 번째 스타일 적용)
  const kpis = [
    {
      k: "가입한 상품",
      v: subscriptions === null ? "…" : `${subscriptions.length}건`,
      d: subscriptions === null ? "가입중" : `평균 달성률 ${subscriptionAchievementRate}%`,
      dir: "down",
      pct: subscriptions ? subscriptionAchievementRate : 0,
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

  // 관리자면 관리자 대시보드로
  if (user?.role === "ADMIN") return <AdminDashboard />;

  return (
    <>
      <TopBar title="내 대시보드" crumb="홈 / 내 계좌 및 자산 요약" />

      {/* 잔액 (송금하기 삭제, 잔액만) */}
      <div className="balance">
        <div>
          <div className="lbl">내 총 자산</div>
          <div className="big">₩ {totalBalance.toLocaleString()}</div>
          <div style={{ marginTop: 12 }}>
            <span className="safe"><i />계정 보안 상태 · 안전</span>
          </div>
        </div>
        <button className="report-btn" onClick={() => navigate("/mypage/report")}>
          ＋ 이상거래 신고
        </button>
      </div>

      {/* 계좌(왼쪽) / 카드(오른쪽) — 나란히 */}
<div className="ac-row" style={{ marginTop: 16 }}>
  {/* 계좌 슬라이드 */}
  <Panel title="내 계좌" sub={`${accounts.length}개`}>
    <div className="slide-row">
      {accounts.map((a) => (
        <div key={a.id} className="slide-card acc" onClick={() => navigate("/mypage/accounts")}>
          <div className="slide-top">
            <span className="slide-tag">계좌</span>
            <span className="slide-num">{a.accountNumber}</span>
          </div>
          <div className="slide-name">{a.accountName}</div>
          <div className="slide-value">₩ {Number(a.balance).toLocaleString()}</div>
        </div>
      ))}
    </div>
  </Panel>

  {/* 카드 슬라이드 */}
  <Panel title="내 카드" sub={`${cards.length}장`}>
    <div className="slide-row">
      {cards.map((c) => (
        <div key={c.id} className="slide-card card" onClick={() => navigate("/mypage/cards")}>
          <div className="slide-top">
            <span className="slide-tag">{c.cardType === "CREDIT" ? "신용" : "체크"}</span>
            <span className="slide-num">{c.cardNumber}</span>
          </div>
          <div className="slide-name">{c.cardName}</div>
          <div className="slide-value">한도 ₩ {Number(c.availableLimit).toLocaleString()}</div>
        </div>
      ))}
    </div>
  </Panel>
</div>

      {/* 오래된 데이터 안내 */}
      {staleNotices.length > 0 && (
        <div className="cols" style={{ gridTemplateColumns: "1fr", marginBottom: 16, marginTop: 16 }}>
          <Panel title="확인이 필요해요" sub="오래된 정보">
            <div className="feed">
              {staleNotices.map((msg, i) => (
                <div className="fitem" key={i}>
                  <span className="fdot" style={{ background: "var(--amber)" }} />
                  <div><div className="ft">{msg}</div></div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      )}

      {/* KPI */}
      <div className="kpis" style={{ marginTop: 16 }}>
        {kpis.map((k, i) => <KpiCard key={i} {...k} />)}
      </div>

      {/* 최근 거래 / 투자·재무 — 높이 맞춤 */}
      <div className="cols cols-eq">
        <Panel title="내 최근 거래" sub="의심 거래는 자동 표시" right={<div className="filterpill">전체</div>}>
          <div className="dash-empty">
            거래 내역은 <span onClick={() => navigate("/mypage/transactions")} style={{ color: "var(--blue)", cursor: "pointer", fontWeight: 600 }}>거래내역 페이지</span>에서 확인하세요.
          </div>
        </Panel>

        <Panel title="내 투자·재무" sub="진단 및 프로필">
          <div className="feed">
            <div className="fitem">
              <span className="fdot" style={{ background: latestProfile ? "var(--green)" : "var(--muted)" }} />
              <div>
                <div className="ft">투자성향</div>
                <div className="fm">
                  {hasDiagnosis === false ? "아직 진단 이력이 없어요." : latestProfile ? RISK_TENDENCY_LABELS[latestProfile.riskTendency] : "불러오는 중…"}
                </div>
              </div>
            </div>
            <div className="fitem">
              <span className="fdot" style={{ background: hasFinProfile ? "var(--blue)" : "var(--muted)" }} />
              <div>
                <div className="ft">재무 프로필</div>
                <div className="fm">{hasFinProfile === false ? "아직 작성되지 않았어요." : hasFinProfile ? "작성 완료" : "불러오는 중…"}</div>
              </div>
            </div>
            <div className="fitem">
              <span className="fdot" style={{ background: "var(--muted)" }} />
              <div><div className="ft">내 정보 및 목표</div><div className="fm">상태 정상</div></div>
            </div>
          </div>
        </Panel>
      </div>

      {/* 다크모드 설정 */}
      <div className="panel" style={{ marginTop: 20 }}>
        <div className="setrow" style={{ padding: "4px 0", borderBottom: "none" }}>
          <div>
            <div className="st">화면 테마 설정</div>
            <div className="sm">다크모드로 눈의 피로를 줄여보세요.</div>
          </div>
          <button type="button" className={`toggle ${isDark ? "on" : ""}`} onClick={toggleDarkMode} aria-label="다크모드 토글" />
        </div>
      </div>
    </>
  );
}