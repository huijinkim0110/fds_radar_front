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

const RISK_TENDENCY_LABELS = {
  STABLE: "안정형",
  NEUTRAL: "중립형",
  ACTIVE: "적극형",
  AGGRESSIVE: "공격형",
};

const ACCOUNT_COLORS = [
  "#BFDBFE", "#A7F3D0", "#FDE68A", "#DDD6FE", "#BAE6FD",
];

const CARD_COLORS = [
  "#E0E7FF", "#FCE7F3", "#D1FAE5", "#FEF3C7", "#FFE4E6",
];

function AccountCarousel({ accounts, onNavigate, onAdd }) {
  const [current, setCurrent] = useState(0);
  const acc = accounts[current];

  return (
    <div style={{ width: "100%", overflow: "hidden" }}>
      {acc ? (
        <div onClick={onNavigate} style={{
          padding: "24px 28px", borderRadius: 16,
          background: ACCOUNT_COLORS[current % ACCOUNT_COLORS.length],
          cursor: "pointer", marginBottom: 12, minHeight: 130
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
            <span style={{ fontSize: 14, color: "rgba(30,30,60,0.6)" }}>계좌</span>
            <span style={{ fontSize: 14, color: "rgba(30,30,60,0.6)" }}>{acc.accountNumber}</span>
          </div>
          <div style={{ fontSize: 15, color: "rgba(30,30,60,0.7)", marginBottom: 4 }}>{acc.accountName || "계좌"}</div>
          <div style={{ fontSize: "clamp(16px, 2.5vw, 20px)", fontWeight: 700, color: "#1E1E3C" }}>
            ₩ {Number(acc.balance).toLocaleString()}
          </div>
        </div>
      ) : (
        <div style={{
          minHeight: 130, borderRadius: 16, border: "2px dashed var(--line)",
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: 12, cursor: "pointer", color: "var(--muted)", fontSize: 15
        }} onClick={onAdd}>+ 계좌 추가</div>
      )}

      {/* 화면 비율에 맞춰 동적으로 크기가 조절되는 하단 탭 */}
      <div style={{
        display: "flex",
        gap: "1%",
        width: "100%",
        overflowX: "auto",
        WebkitOverflowScrolling: "touch",
        paddingBottom: 4,
        scrollbarWidth: "none"
      }}>
        {accounts.map((a, i) => (
          <div 
            key={a.id} 
            onClick={() => setCurrent(i)} 
            style={{
              flex: "1 1 calc(25% - 8px)",
              minWidth: "65px",
              maxWidth: "120px",
              padding: "8px 6px", 
              borderRadius: 10, 
              cursor: "pointer",
              background: i === current ? ACCOUNT_COLORS[i % ACCOUNT_COLORS.length] : "var(--panel2)",
              border: `0.5px solid ${i === current ? "transparent" : "var(--line)"}`,
              transition: "all 0.2s",
              boxSizing: "border-box",
              textAlign: "center"
            }}
          >
            <div style={{ fontSize: "clamp(10px, 1.1vw, 12px)", color: i === current ? "rgba(30,30,60,0.7)" : "var(--muted)", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {a.accountNumber}
            </div>
            <div style={{ fontSize: "clamp(11px, 1.2vw, 13px)", fontWeight: 600, color: i === current ? "rgba(30,30,60,0.7)" : "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {a.accountName || "계좌"}
            </div>
          </div>
        ))}
        <div 
          onClick={onAdd} 
          style={{
            flex: "0 0 36px",
            minWidth: "36px",
            padding: "8px 0", 
            borderRadius: 10, 
            cursor: "pointer",
            background: "var(--panel2)", 
            border: "1.5px dashed var(--line)",
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            color: "var(--muted)", 
            fontSize: 16, 
            fontWeight: 300,
            boxSizing: "border-box"
          }}
        >+</div>
      </div>
    </div>
  );
}

function CardCarousel({ cards, onNavigate, onAdd }) {
  const [current, setCurrent] = useState(0);
  const card = cards[current];

  return (
    <div style={{ width: "100%", overflow: "hidden" }}>
      {card ? (
        <div onClick={onNavigate} style={{
          padding: "24px 28px", borderRadius: 16,
          background: CARD_COLORS[current % CARD_COLORS.length],
          cursor: "pointer", marginBottom: 12, minHeight: 130
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
            <span style={{ fontSize: 14, color: "rgba(30,30,60,0.6)" }}>{card.cardType === "CREDIT" ? "신용" : "체크"}</span>
            <span style={{ fontSize: 14, color: "rgba(30,30,60,0.7)" }}>{card.cardNumber}</span>
          </div>
          <div style={{ fontSize: 15, color: "rgba(30,30,60,0.7)", marginBottom: 4 }}>{card.cardName || "카드"}</div>
          <div style={{ fontSize: "clamp(16px, 2.5vw, 20px)", fontWeight: 700, color: "#1E1E3C" }}>
            한도 ₩ {Number(card.availableLimit).toLocaleString()}
          </div>
        </div>
      ) : (
        <div style={{
          minHeight: 130, borderRadius: 16, border: "2px dashed var(--line)",
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: 12, cursor: "pointer", color: "var(--muted)", fontSize: 15
        }} onClick={onAdd}>+ 카드 추가</div>
      )}

      {/* 화면 비율에 맞춰 동적으로 크기가 조절되는 하단 탭 */}
      <div style={{
        display: "flex",
        gap: "1%",
        width: "100%",
        overflowX: "auto",
        WebkitOverflowScrolling: "touch",
        paddingBottom: 4,
        scrollbarWidth: "none"
      }}>
        {cards.map((c, i) => (
          <div 
            key={c.id} 
            onClick={() => setCurrent(i)} 
            style={{
              flex: "1 1 calc(25% - 8px)",
              minWidth: "65px",
              maxWidth: "120px",
              padding: "8px 6px", 
              borderRadius: 10, 
              cursor: "pointer",
              background: i === current ? CARD_COLORS[i % CARD_COLORS.length] : "var(--panel2)",
              border: `0.5px solid ${i === current ? "transparent" : "var(--line)"}`,
              transition: "all 0.2s",
              boxSizing: "border-box",
              textAlign: "center"
            }}
          >
            <div style={{ fontSize: "clamp(10px, 1.1vw, 12px)", color: i === current ? "rgba(30,30,60,0.7)" : "var(--muted)", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {c.cardType === "CREDIT" ? "신용" : "체크"}
            </div>
            <div style={{ fontSize: "clamp(11px, 1.2vw, 13px)", fontWeight: 600, color: i === current ? "rgba(30,30,60,0.7)" : "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {c.cardName || "카드"}
            </div>
          </div>
        ))}
        <div 
          onClick={onAdd} 
          style={{
            flex: "0 0 36px",
            minWidth: "36px",
            padding: "8px 0", 
            borderRadius: 10, 
            cursor: "pointer",
            background: "var(--panel2)", 
            border: "1.5px dashed var(--line)",
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            color: "var(--muted)", 
            fontSize: 16, 
            fontWeight: 300,
            boxSizing: "border-box"
          }}
        >+</div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isDark, toggleDarkMode } = useTheme();
  const userId = user?.userId;

  const [accounts, setAccounts] = useState([]);
  const [cards, setCards] = useState([]);
  const [favoriteCount, setFavoriteCount] = useState(null);
  const [subscriptions, setSubscriptions] = useState(null);
  const [goals, setGoals] = useState(null);
  const [latestProfile, setLatestProfile] = useState(null);
  const [hasDiagnosis, setHasDiagnosis] = useState(null);
  const [financialProfile, setFinancialProfile] = useState(null);
  const [hasFinProfile, setHasFinProfile] = useState(null);

  useEffect(() => {
    if (!userId) return;
    getMyAccounts(userId).then(setAccounts).catch(() => {});
    getMyCards(userId).then(setCards).catch(() => {});
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    getFavorites(userId).then((list) => setFavoriteCount(list.length)).catch(() => {});
    getPortfolio(userId).then((list) => setSubscriptions(list)).catch(() => {});
    getGoals(userId).then(setGoals).catch(() => {});
    hasDiagnosisHistory(userId).then(setHasDiagnosis).catch(() => {});
    hasFinancialProfile(userId).then(setHasFinProfile).catch(() => {});
  }, [userId]);

  useEffect(() => {
    if (hasDiagnosis && userId) getLatestProfile(userId).then(setLatestProfile).catch(() => {});
  }, [hasDiagnosis, userId]);

  useEffect(() => {
    if (hasFinProfile && userId) getFinancialProfile(userId).then(setFinancialProfile).catch(() => {});
  }, [hasFinProfile, userId]);

  const totalBalance = accounts.reduce((sum, a) => sum + Number(a.balance), 0);

  const staleNotices = [];
  if (latestProfile && isStale(latestProfile.diagnosedAt)) {
    staleNotices.push(`투자성향 진단이 ${formatElapsed(latestProfile.diagnosedAt)}이에요. 재진단을 권장해요.`);
  }
  if (financialProfile && isStale(financialProfile.updatedAt ?? financialProfile.createdAt)) {
    staleNotices.push(`재무 프로필을 ${formatElapsed(financialProfile.updatedAt ?? financialProfile.createdAt)} 수정 안했어요. 업데이트를 권장해요.`);
  }

  const totalPaid = (subscriptions ?? []).reduce((sum, s) => sum + (s.paidAmount ?? 0), 0);
  const totalTarget = (subscriptions ?? []).reduce((sum, s) => {
    const target = s.monthlyPayment != null ? s.monthlyPayment * s.subscriptionPeriod : s.subscriptionAmount;
    return sum + (target ?? 0);
  }, 0);
  const subscriptionAchievementRate = totalTarget === 0 ? 0 : Math.round((totalPaid / totalTarget) * 1000) / 10;

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

  if (user?.role === "ADMIN") return <AdminDashboard />;

  const inProgressGoals = (goals ?? []).filter(g => g.goalStatus === "IN_PROGRESS").slice(0, 3);

  return (
    <>
      <TopBar title="내 대시보드" crumb="홈 / 내 계좌 및 자산 요약" />

      <div className="balance">
        <div>
          <div className="lbl">내 총 자산</div>
          <div className="big">₩ {totalBalance.toLocaleString()}</div>
          <div style={{ marginTop: 20 }}>
            <span className="safe"><i />계정 보안 상태 · 안전</span>
          </div>
        </div>
        <button className="report-btn" onClick={() => navigate("/mypage/report")}>
          ＋ 이상거래 신고
        </button>
      </div>

      {/* 화면 크기에 따라 반응형 레이아웃 */}
      <div className="ac-row" style={{ marginTop: 20, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
        <Panel title="내 계좌" sub={`${accounts.length}개`} style={{ minWidth: 0 }}>
          <AccountCarousel
            accounts={accounts}
            onNavigate={() => navigate("/mypage/accounts")}
            onAdd={() => navigate("/mypage/accounts")}
          />
        </Panel>
        <Panel title="내 카드" sub={`${cards.length}장`} style={{ minWidth: 0 }}>
          <CardCarousel
            cards={cards}
            onNavigate={() => navigate("/mypage/cards")}
            onAdd={() => navigate("/mypage/cards")}
          />
        </Panel>
      </div>

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

      <div className="kpis" style={{ marginTop: 16 }}>
        {kpis.map((k, i) => <KpiCard key={i} {...k} />)}
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: 16,
        marginTop: 20,
        alignItems: "stretch"
      }}>
        <div style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 14, padding: "18px 20px", boxShadow: "0 1px 3px rgba(16,24,40,0.04)" }}>
          <div className="ph-head" style={{ marginBottom: 20 }}>
            <div>
              <h3>재무목표</h3>
              <div className="ph-sub">진행 중인 목표</div>
            </div>
            <span onClick={() => navigate("/mypage/financial-goals")} style={{ fontSize: 14, color: "var(--blue)", cursor: "pointer", fontWeight: 600 }}>전체 보기 →</span>
          </div>
          {inProgressGoals.length === 0 ? (
            <div className="dash-empty">진행 중인 재무목표가 없습니다.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {inProgressGoals.map((g) => (
                <div key={g.goalId} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>
                    <span>{g.goalName}</span>
                    <span style={{ color: "var(--blue)" }}>{Math.min(g.achievementRate ?? 0, 100)}%</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 999, background: "var(--line)", overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: 999, background: "var(--blue)", width: `${Math.min(g.achievementRate ?? 0, 100)}%` }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--muted)" }}>
                    <span>₩{g.currentAmount?.toLocaleString()}</span>
                    <span>₩{g.targetAmount?.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 14, padding: "18px 20px", boxShadow: "0 1px 3px rgba(16,24,40,0.04)" }}>
          <div style={{ marginBottom: 20 }}>
            <h3>내 투자·재무</h3>
            <div className="ph-sub">진단 및 프로필</div>
          </div>
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
        </div>
      </div>

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