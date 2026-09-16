import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getNotifications } from "../api/user/notificationAPI";

const PRODUCTS = [
  {
    id: "deposit",
    ic: "💳",
    bg: "#EFF6FF",
    name: "WON플러스예금",
    rate: "연 3.2%",
    desc: "가입기간 12개월, 원금보장, 우리은행.",
    path: "/products/1",
  },

  {
    id: "savings",
    ic: "🐷",
    bg: "#ECFDF5",
    name: "WON적금",
    rate: "연 3.2%",
    desc: "가입기간 12개월, 원금보장, 월 50만원 이내.",
    path: "/products/40",
  },

  {
    id: "loan",
    ic: "💸",
    bg: "#FFF7ED",
    name: "미래에셋생명 헤리티지 종신보험",
    rate: "연 5.7%",
    desc: "240개월 가입, 원금 비보장, 50,000원~.",
    path: "/products/97",
  },

  {
    id: "card",
    ic: "🪙",
    bg: "#F5F3FF",
    name: "MZ 플랜적금",
    rate: "연 2.95%",
    desc: "12개월, 원금보장, 월 납입한도 30만원 이하, 제주은행.",
    path: "/products/52",
  },

  {
    id: "invest",
    ic: "📈",
    bg: "#FEF2F2",
    name: "투자성향 진단",
    rate: "1분이면 끝",
    desc: "내게 맞는 투자 스타일을 알아보세요.",
    path: "/investment-diagnosis",
  },

  {
    id: "fraud",
    ic: "🚨",
    bg: "#FEF2F2",
    name: "금융사기 예방",
    rate: "최신 사기 수법 알아보기",
    desc: "최근 발생한 금융사기 유형과 예방법을 확인하세요.",
    path: "/fraud-prevention",
  },
];

export default function Home() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // ==============================
  // 알림 추가
  // ==============================
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user?.userId) {
      setUnreadCount(0);
      return;
    }

    async function loadNotifications() {
      try {
        const data = await getNotifications(user.userId);

        // read === false 인 알림만 "새로운 알림"으로 계산
        const count = data.filter(
          (notification) => notification.read === false
        ).length;

        setUnreadCount(count);
      } catch (error) {
        console.error("홈 알림 조회 실패:", error);
        setUnreadCount(0);
      }
    }

    loadNotifications();
  }, [user?.userId]);

  return (
    <div className="home">

      {/* 상단 네비 */}
      <nav className="home-nav">

        <div className="home-logo">
          <span className="mark">W</span>
          Wonly
        </div>

        <div className="home-menu">

          <a onClick={() => navigate("/products")}>
            금융 상품
          </a>

          {user && (
            <a onClick={() => navigate("/mypage/dashboard")}>
              {user?.role === "ADMIN"
                ? "관리자 대시보드"
                : "내 대시보드"}
            </a>
          )}

          <a onClick={() => navigate("/support")}>
            고객센터
          </a>

        </div>

        <div className="home-nav-right">

          {user ? (
            <>
              <span className="home-user">
                {user.name}님
                {user.role === "ADMIN" ? " (관리자)" : ""}
              </span>

              <button
                className="ghost"
                onClick={() => {
                  logout();
                  navigate("/");
                }}
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <button
                className="ghost"
                onClick={() => navigate("/login")}
              >
                로그인
              </button>

              <button
                className="fill"
                onClick={() => navigate("/signup")}
              >
                회원가입
              </button>
            </>
          )}

        </div>

      </nav>

      {/* 히어로 */}
      <section className="hero">

        <div className="hero-badge">
          ● 실시간 이상거래 탐지 · 24시간 가동
        </div>

        <h1>
          돈은 자유롭게,
          <br />
          <span>안전은 자동으로.</span>
        </h1>

        <p>
          입출금부터 적금·대출·카드까지. 모든 거래를 Wonly가
          실시간으로 지켜봅니다.
        </p>

        {user ? (
          /* 로그인 상태: 환영 메시지 */
          <div className="hero-welcome">
            {user.name}님, 환영합니다 👋
          </div>
        ) : (
          <div className="hero-cta">

            <button
              className="fill big"
              onClick={() => navigate("/signup")}
            >
              지금 시작하기
            </button>

            <button
              className="ghost big"
              onClick={() => navigate("/login")}
            >
              로그인
            </button>

          </div>
        )}

      </section>

      {/* ==============================
          알림 요약
          로그인한 사용자에게만 표시
      ============================== */}
      {user && (
        <section
          style={{
            maxWidth: "1180px",
            margin: "0 auto 40px",
            padding: "0 24px",
          }}
        >
          <div
            style={{
              padding: "22px 26px",
              border: "1px solid #dce8f8",
              borderRadius: "16px",
              background: "#f7faff",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "20px",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: "700",
                  color: "#3478f6",
                  marginBottom: "7px",
                }}
              >
                알림
              </div>

              <div
                style={{
                  fontSize: "18px",
                  fontWeight: "800",
                  color: "#172033",
                  marginBottom: "6px",
                }}
              >
                새로운 알림이 {unreadCount}개 있습니다.
              </div>

              <div
                style={{
                  fontSize: "13px",
                  color: "#6c7890",
                }}
              >
                상세한 내용은 마이페이지에서 확인하세요.
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate("/mypage/notifications")
              }
              style={{
                border: "none",
                borderRadius: "10px",
                padding: "11px 17px",
                background: "#3478f6",
                color: "#ffffff",
                fontSize: "13px",
                fontWeight: "700",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              알림 확인하기 →
            </button>
          </div>
        </section>
      )}

      {/* 금융 상품 */}
      <section className="products">

        <div className="sec-h">

          <div className="k">
            금융 상품
          </div>

          <h2>
            필요한 건 다 있어요
          </h2>

        </div>

        <div className="prod-grid">

          {PRODUCTS.map((p) => (

            <div
              className="pcard"
              key={p.id}
              onClick={() => navigate(p.path)}
            >

              <div
                className="ic"
                style={{ background: p.bg }}
              >
                {p.ic}
              </div>

              <h3>
                {p.name}
              </h3>

              <div className="rate">
                {p.rate}
              </div>

              <p>
                {p.desc}
              </p>

              <span className="go">
                보러가기 →
              </span>

            </div>

          ))}

        </div>

      </section>

      <footer className="home-foot">
        © 2026 Wonly · 팀 프로젝트
      </footer>

    </div>
  );
}