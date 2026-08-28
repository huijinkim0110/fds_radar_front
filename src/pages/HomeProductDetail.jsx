import { useParams, useNavigate } from "react-router-dom";

const PRODUCTS = {
  deposit: {
    ic: "💳", bg: "#EFF6FF", name: "입출금 통장", tag: "수시입출금",
    rate: "연 3.0%", rateLabel: "기본 금리",
    summary: "수수료 걱정 없이 하루만 맡겨도 이자가 붙는 파킹통장이에요.",
    features: [
      "이체·출금 수수료 전액 면제",
      "하루만 예치해도 일할 계산으로 이자 지급",
      "급여·연금 이체 시 우대금리 +0.5%p",
      "체크카드 실적 조건 없음",
    ],
    info: [
      ["가입 대상", "만 17세 이상 개인"],
      ["예치 한도", "제한 없음"],
      ["이자 지급", "매월 첫째 영업일"],
      ["금리", "연 3.0% (우대 포함 최대 3.5%)"],
    ],
    notice: "예금자보호법에 따라 원금과 이자를 합쳐 1인당 최고 5천만원까지 보호됩니다.",
  },
  savings: {
    ic: "🐷", bg: "#ECFDF5", name: "자유 적금", tag: "적립식 예금",
    rate: "연 5.2%", rateLabel: "최고 금리",
    summary: "원할 때 원하는 만큼. 자유롭게 모으는 목표 달성 적금이에요.",
    features: [
      "매달 1천원부터 자유롭게 납입",
      "만기 12개월, 최고 연 5.2% 금리",
      "자동이체 등록 시 우대금리 +0.3%p",
      "중도해지해도 약정이자 일부 보장",
    ],
    info: [
      ["가입 대상", "만 17세 이상 개인"],
      ["가입 기간", "6 ~ 36개월"],
      ["납입 방식", "자유적립식 (월 최대 300만원)"],
      ["금리", "연 4.5% ~ 5.2%"],
    ],
    notice: "중도해지 시 약정금리가 아닌 중도해지금리가 적용됩니다. 예금자보호 대상입니다.",
  },
  loan: {
    ic: "💸", bg: "#FFF7ED", name: "비상금 대출", tag: "소액 신용대출",
    rate: "연 4.9%~", rateLabel: "최저 금리",
    summary: "급할 때 30초 심사로 바로. 필요한 만큼만 빌리는 비상금 대출이에요.",
    features: [
      "최대 300만원까지 한도 제공",
      "모바일 30초 간편 심사",
      "중도상환수수료 0원",
      "하루만 써도 일할 이자 계산",
    ],
    info: [
      ["가입 대상", "만 19세 이상, 재직 확인 가능자"],
      ["대출 한도", "최대 300만원"],
      ["대출 기간", "최대 12개월"],
      ["금리", "연 4.9% ~ 15.9% (신용등급별 차등)"],
    ],
    notice: "대출은 개인 신용도에 따라 한도·금리가 달라지며, 연체 시 신용점수가 하락할 수 있습니다.",
  },
  card: {
    ic: "🪙", bg: "#F5F3FF", name: "체크카드", tag: "체크카드",
    rate: "최대 5%", rateLabel: "캐시백",
    summary: "쓸수록 쌓이는 혜택. 실적 조건 없이 캐시백 받는 체크카드예요.",
    features: [
      "카페·편의점·대중교통 5% 캐시백",
      "전월 실적 조건 없음",
      "해외 결제 수수료 면제",
      "실시간 사용 알림 무료",
    ],
    info: [
      ["가입 대상", "본인 명의 입출금 계좌 보유자"],
      ["연회비", "없음"],
      ["캐시백 한도", "월 최대 2만원"],
      ["발급", "신청 후 3~5영업일"],
    ],
    notice: "캐시백은 익월 말 지급되며, 가맹점 사정에 따라 적립이 제외될 수 있습니다.",
  },
  invest: {
    ic: "📈", bg: "#FEF2F2", name: "소액 투자", tag: "투자 상품",
    rate: "1,000원~", rateLabel: "최소 투자금",
    summary: "커피 한 잔 값으로 시작하는 분산 투자. 성향에 맞게 추천받아요.",
    features: [
      "1,000원부터 소액 투자 가능",
      "투자성향 진단 후 맞춤 포트폴리오 추천",
      "국내외 ETF·펀드 분산 투자",
      "자동 리밸런싱 지원",
    ],
    info: [
      ["가입 대상", "만 19세 이상 개인"],
      ["최소 투자금", "1,000원"],
      ["투자 유형", "ETF, 펀드, 채권"],
      ["수수료", "연 0.3% (운용보수)"],
    ],
    notice: "투자 상품은 예금자보호 대상이 아니며, 원금 손실이 발생할 수 있습니다. 투자 전 성향 진단을 권장합니다.",
    cta: { label: "투자성향 진단하기 →", to: "/mypage/diagnosis" },
  },
  care: {
    ic: "🛡️", bg: "#EFF6FF", name: "안심 케어", tag: "보안 서비스",
    rate: "무료", rateLabel: "이용료",
    summary: "24시간 실시간 감시. 이상거래를 자동 차단하는 무료 보안 서비스예요.",
    features: [
      "모든 거래 24시간 실시간 모니터링",
      "이상거래 탐지 시 자동 차단",
      "즉시 알림 발송 및 본인 확인",
      "피해 발생 시 신고 원스톱 처리",
    ],
    info: [
      ["가입 대상", "전 고객 자동 적용"],
      ["이용료", "무료"],
      ["탐지 방식", "AI 이상거래 탐지(FDS)"],
      ["알림", "앱 푸시 · SMS"],
    ],
    notice: "탐지 정확도 향상을 위해 거래 패턴이 분석되며, 관련 정보는 안전하게 암호화됩니다.",
    cta: { label: "내 대시보드 보기 →", to: "/mypage/dashboard" },
  },
};

export default function HomeProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const p = PRODUCTS[id];

  if (!p) {
    return (
      <div className="hpd-wrap">
        <p style={{ color: "var(--muted)" }}>존재하지 않는 상품입니다.</p>
        <button className="fill" onClick={() => navigate("/")}>홈으로</button>
      </div>
    );
  }

  return (
    <div className="hpd">
      <div className="hpd-wrap">
        <button className="hpd-back" onClick={() => navigate(-1)}>← 뒤로</button>

        {/* 헤더 */}
        <div className="hpd-head">
          <div className="hpd-ic" style={{ background: p.bg }}>{p.ic}</div>
          <div>
            <div className="hpd-tag">{p.tag}</div>
            <h1 className="hpd-name">{p.name}</h1>
            <p className="hpd-summary">{p.summary}</p>
          </div>
          <div className="hpd-rate">
            <div className="hpd-rate-label">{p.rateLabel}</div>
            <div className="hpd-rate-val">{p.rate}</div>
          </div>
        </div>

        {/* 주요 특징 */}
        <div className="hpd-section">
          <h2>주요 특징</h2>
          <ul className="hpd-features">
            {p.features.map((f, i) => (
              <li key={i}><span className="hpd-check">✓</span>{f}</li>
            ))}
          </ul>
        </div>

        {/* 상품 정보 */}
        <div className="hpd-section">
          <h2>상품 정보</h2>
          <table className="hpd-table">
            <tbody>
              {p.info.map(([k, v], i) => (
                <tr key={i}>
                  <th>{k}</th>
                  <td>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 유의사항 */}
        <div className="hpd-notice">
          <strong>⚠ 유의사항</strong>
          <p>{p.notice}</p>
        </div>

        {/* CTA 버튼 */}
        <div className="hpd-cta">
          {p.cta ? (
            <button className="fill big" onClick={() => navigate(p.cta.to)}>{p.cta.label}</button>
          ) : (
            <button className="fill big" onClick={() => alert("가입 기능은 준비 중입니다.")}>가입하기 →</button>
          )}
          <button className="ghost big" onClick={() => navigate("/products")}>다른 상품 보기</button>
        </div>
      </div>
    </div>
  );
}