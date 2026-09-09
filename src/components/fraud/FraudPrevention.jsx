import { useNavigate } from "react-router-dom";

const FRAUD_TYPES = [
  {
    id: "voice",
    ic: "📞",
    bg: "#FEF2F2",
    color: "#DC2626",
    name: "보이스피싱",
    tag: "전화 사기",
    desc: "검찰·금융감독원을 사칭해 계좌 이체를 유도하는 수법. 공공기관은 절대 전화로 송금을 요구하지 않습니다.",
    tips: ["모르는 번호의 송금 요청 즉시 거절", "전화 끊고 공식 번호로 직접 확인", "가족에게 사전 공유"],
  },
  {
    id: "smishing",
    ic: "📱",
    bg: "#FFF7ED",
    color: "#D97706",
    name: "스미싱",
    tag: "문자 사기",
    desc: "택배·청첩장·건강검진 등 문자에 악성 링크를 삽입해 클릭을 유도, 악성앱을 설치시키는 수법.",
    tips: ["출처 불명 링크 클릭 금지", "스마트폰 보안 앱 설치", "앱은 공식 스토어에서만 설치"],
  },
  {
    id: "pharming",
    ic: "🌐",
    bg: "#ECFDF5",
    color: "#059669",
    name: "파밍",
    tag: "가짜 사이트",
    desc: "정상 사이트처럼 위장한 가짜 사이트로 유도해 계좌번호·비밀번호 등 개인정보를 탈취하는 수법.",
    tips: ["주소창 URL 반드시 확인", "금융 사이트는 즐겨찾기로만 접속", "보안카드 전체 입력 요구 시 즉시 의심"],
  },
  {
    id: "messenger",
    ic: "💬",
    bg: "#EFF6FF",
    color: "#2563EB",
    name: "메신저피싱",
    tag: "메신저 사기",
    desc: "카카오톡 등에서 가족·지인을 사칭해 급전이 필요하다며 송금을 요청하는 수법.",
    tips: ["송금 전 반드시 전화로 본인 확인", "프로필 사진·이름만으로 신뢰 금지", "낯선 계좌로 송금 자제"],
  },
  {
    id: "loan",
    ic: "💸",
    bg: "#F5F3FF",
    color: "#7C3AED",
    name: "대출사기",
    tag: "선입금 사기",
    desc: "저금리 대출을 미끼로 선이자·수수료·보증금 명목의 선입금을 요구하는 수법. 정상 금융기관은 선입금을 요구하지 않습니다.",
    tips: ["선입금 요구 즉시 거절", "금융감독원 제도권 금융기관 조회", "계약서 없는 대출 절대 진행 금지"],
  },
  {
    id: "investment",
    ic: "📈",
    bg: "#FEF9C3",
    color: "#CA8A04",
    name: "투자리딩방 사기",
    tag: "투자 사기",
    desc: "카카오톡·텔레그램 리딩방에서 고수익을 보장한다며 투자를 유도, 원금을 가로채고 잠적하는 수법.",
    tips: ["고수익 보장 투자 무조건 의심", "미인가 투자 업체 신고", "금융감독원 투자사기 신고센터 이용"],
  },
];

export default function FraudPrevention() {
  const navigate = useNavigate();

  return (
    <div style={{ background: "#fff", minHeight: "100vh", color: "#0B1424" }}>
      {/* 상단 네비 */}
      <nav className="home-nav">
        <div className="home-logo"><span className="mark">W</span>Wonly</div>
        <div className="home-nav-right">
          <button className="ghost" onClick={() => navigate("/")}>← 홈으로</button>
          <button className="fill" onClick={() => navigate("/login")}>로그인</button>
        </div>
      </nav>

      {/* 히어로 */}
      <div style={{ background: "linear-gradient(135deg,#1E40AF,#3B82F6)", color: "#fff", padding: "60px 44px", textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🚨</div>
        <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: -0.8, marginBottom: 12 }}>금융사기 예방</h1>
        <p style={{ fontSize: 16, opacity: 0.85, lineHeight: 1.7, maxWidth: 480, margin: "0 auto" }}>
          최근 발생한 금융사기 유형과 예방법을 확인하세요.<br />
          알아야 막을 수 있습니다.
        </p>
      </div>

      {/* 사기 유형 카드 목록 */}
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "60px 44px" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#2563EB", marginBottom: 8 }}>최신 사기 수법 알아보기</div>
          <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.6 }}>이런 수법을 조심하세요</h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {FRAUD_TYPES.map((f) => (
            <div
              key={f.id}
              style={{
                border: "1px solid #EAEEF4",
                borderRadius: 18,
                padding: 26,
                transition: "0.15s",
                background: "#fff",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#C7D6F0";
                e.currentTarget.style.boxShadow = "0 12px 30px rgba(37,99,235,0.08)";
                e.currentTarget.style.transform = "translateY(-3px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#EAEEF4";
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {/* 아이콘 + 태그 */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div style={{ width: 46, height: 46, borderRadius: 13, background: f.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
                  {f.ic}
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: f.color, background: f.bg, padding: "3px 10px", borderRadius: 20 }}>
                  {f.tag}
                </span>
              </div>

              {/* 제목 + 설명 */}
              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10 }}>{f.name}</h3>
              <p style={{ fontSize: 13, color: "#5B6B84", lineHeight: 1.7, marginBottom: 16 }}>{f.desc}</p>

              {/* 예방 팁 */}
              <div style={{ borderTop: "1px solid #EAEEF4", paddingTop: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: f.color, marginBottom: 8 }}>예방 TIP</div>
                {f.tips.map((tip, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, fontSize: 12, color: "#26324A", marginBottom: 6, lineHeight: 1.5 }}>
                    <span style={{ color: f.color, fontWeight: 700, flexShrink: 0 }}>✓</span>
                    {tip}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 하단 신고 안내 */}
        <div style={{
          marginTop: 60, padding: "28px 32px", borderRadius: 16,
          background: "linear-gradient(135deg,#FEF2F2,#FFF7ED)",
          border: "1px solid rgba(220,38,38,0.2)",
          display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16
        }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#DC2626", marginBottom: 6 }}>🚨 금융사기 피해를 당했다면?</div>
            <div style={{ fontSize: 13, color: "#5B6B84", lineHeight: 1.7 }}>
              즉시 은행에 지급정지 요청 후 금융감독원(1332) 또는 경찰청(112)에 신고하세요.
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ textAlign: "center", background: "#fff", borderRadius: 12, padding: "12px 20px", border: "1px solid rgba(220,38,38,0.2)" }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#DC2626" }}>1332</div>
              <div style={{ fontSize: 11, color: "#5B6B84", marginTop: 2 }}>금융감독원</div>
            </div>
            <div style={{ textAlign: "center", background: "#fff", borderRadius: 12, padding: "12px 20px", border: "1px solid rgba(220,38,38,0.2)" }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#DC2626" }}>112</div>
              <div style={{ fontSize: 11, color: "#5B6B84", marginTop: 2 }}>경찰청</div>
            </div>
          </div>
        </div>
      </div>

      <footer className="home-foot">© 2026 Wonly · 팀 프로젝트</footer>
    </div>
  );
}