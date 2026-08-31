import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PRODUCTS = [
  { id: "deposit", ic: "💳", bg: "#EFF6FF", name: "입출금 통장", rate: "연 3.0%", desc: "수수료 0원, 하루만 맡겨도 이자." },
  { id: "savings", ic: "🐷", bg: "#ECFDF5", name: "자유 적금", rate: "연 5.2%", desc: "원할 때 넣고 빼는 목표 적금." },
  { id: "loan", ic: "💸", bg: "#FFF7ED", name: "비상금 대출", rate: "연 4.9%~", desc: "최대 300만원, 30초 심사." },
  { id: "card", ic: "🪙", bg: "#F5F3FF", name: "체크카드", rate: "최대 5% 캐시백", desc: "쓸수록 쌓이는 혜택." },
  { id: "invest", ic: "📈", bg: "#FEF2F2", name: "소액 투자", rate: "1,000원부터", desc: "커피 한 잔 값으로 분산 투자." },
  { id: "care", ic: "🛡️", bg: "#EFF6FF", name: "안심 케어", rate: "무료 제공", desc: "이상거래 실시간 알림·신고." },
];

export default function Home() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <div className="home">
      {/* 상단 네비 */}
      <nav className="home-nav">
        <div className="home-logo"><span className="mark">P</span>Wonly</div>
        <div className="home-menu">
          <a onClick={() => navigate("/products")}>금융 상품</a>
          <a onClick={() => navigate("/mypage/dashboard")}>내 대시보드</a>
          <a onClick={() => navigate("/support")} style={{ cursor: "pointer" }}>고객센터</a>
        </div>
        <div className="home-nav-right">
          {user ? (
            <>
              <span className="home-user">
                {user.name}님{user.role === "ADMIN" ? " (관리자)" : ""}
              </span>
              {user.role === "ADMIN" ? (
                <button className="ghost" onClick={() => navigate("/admin/fraud-cases")}>
                  관리자 페이지
                </button>
              ) : (
                <button className="ghost" onClick={() => navigate("/mypage/dashboard")}>
                  내 대시보드
                </button>
              )}
              <button className="ghost" onClick={() => {logout(); navigate("/");}}>
                로그아웃
              </button>
            </>
          ) : (
            <>
            <button className="ghost" onClick={() => navigate("/login")}>로그인</button>
            <button className="fill" onClick={() => navigate("/signup")}>회원가입</button>
            </>
          )}


        </div>
      </nav>

      {/* 히어로 */}
      <section className="hero">
        <div className="hero-badge">● 실시간 이상거래 탐지 · 24시간 가동</div>
        <h1>돈은 자유롭게,<br /><span>안전은 자동으로.</span></h1>
        <p>입출금부터 적금·대출·카드까지. 모든 거래를 Wonly가 실시간으로 지켜봅니다.</p>

        {user ? (
          /* ② 로그인 상태: 환영 메시지 */
          <div className="hero-welcome">
            {user.name}님, 환영합니다 👋
          </div>
        ) : (
          <div className="hero-cta">
            <button className="fill big" onClick={() => navigate("/signup")}>지금 시작하기</button>
            <button className="ghost big" onClick={() => navigate("/login")}>로그인</button>
          </div>
        )}
      </section>

      {/* 금융 상품 */}
      <section className="products">
        <div className="sec-h">
          <div className="k">금융 상품</div>
          <h2>필요한 건 다 있어요</h2>
        </div>
        <div className="prod-grid">
  {PRODUCTS.map((p) => (
    <div className="pcard" key={p.id} onClick={() => navigate(`/home-products/${p.id}`)}>
      <div className="ic" style={{ background: p.bg }}>{p.ic}</div>
      <h3>{p.name}</h3>
      <div className="rate">{p.rate}</div>
      <p>{p.desc}</p>
      <span className="go">보러가기 →</span>
    </div>
  ))}
</div>
      </section>

      <footer className="home-foot">© 2026 Wonly · 팀 프로젝트</footer>
    </div>
  );
}