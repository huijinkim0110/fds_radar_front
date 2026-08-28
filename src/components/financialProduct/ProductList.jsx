import { useState } from "react";
import { useNavigate } from "react-router-dom";
import FavoriteButton from "./FavoriteButton";
import CompareButton from "./CompareButton";
import TopBar from "../TopBar.jsx";
import Panel from "../Panel.jsx";

const TEMP_USER_ID = 1;

const PRODUCTS_DATA = [
  {
    productId: "deposit",
    productType: "DEPOSIT",
    riskLevel: "LOW",
    productName: "입출금 통장",
    institutionName: "Wonly은행",
    expectedReturnRate: 3.0,
    ic: "💳", bg: "#EFF6FF",
  },
  {
    productId: "savings",
    productType: "SAVINGS",
    riskLevel: "LOW",
    productName: "자유 적금",
    institutionName: "Wonly은행",
    expectedReturnRate: 5.2,
    ic: "🐷", bg: "#ECFDF5",
  },
  {
    productId: "loan",
    productType: "LOAN",
    riskLevel: "MEDIUM",
    productName: "비상금 대출",
    institutionName: "Wonly캐피탈",
    expectedReturnRate: 4.9,
    ic: "💸", bg: "#FFF7ED",
  },
  {
    productId: "card",
    productType: "CARD",
    riskLevel: "LOW",
    productName: "체크카드",
    institutionName: "Wonly카드",
    expectedReturnRate: null,
    ic: "🪙", bg: "#F5F3FF",
  },
  {
    productId: "invest",
    productType: "INVESTMENT",
    riskLevel: "HIGH",
    productName: "소액 투자",
    institutionName: "Wonly투자증권",
    expectedReturnRate: null,
    ic: "📈", bg: "#FEF2F2",
  },
  {
    productId: "care",
    productType: "SERVICE",
    riskLevel: "LOW",
    productName: "안심 케어",
    institutionName: "Wonly보안",
    expectedReturnRate: null,
    ic: "🛡️", bg: "#EFF6FF",
  },
];

const PRODUCT_TYPE_LABELS = {
  DEPOSIT: "입출금통장",
  SAVINGS: "적금",
  LOAN: "대출",
  CARD: "체크카드",
  INVESTMENT: "소액투자",
  SERVICE: "보안서비스",
};

const RISK_LEVEL_LABELS = {
  LOW: "저위험",
  MEDIUM: "중위험",
  HIGH: "고위험",
};

const RISK_COLOR = {
  LOW: "var(--green)",
  MEDIUM: "var(--amber)",
  HIGH: "var(--red)",
};

function ProductList() {
  const navigate = useNavigate();

  const [productType, setProductType] = useState("");
  const [riskLevel, setRiskLevel] = useState("");

  const filteredProducts = PRODUCTS_DATA.filter((p) => {
    if (productType && p.productType !== productType) return false;
    if (riskLevel && p.riskLevel !== riskLevel) return false;
    return true;
  });

  function handleFilterChange(setter, value) {
    setter(value);
  }

  return (
    // 상단 여백(paddingTop: "32px")을 추가하여 화면 위쪽을 넉넉하게 띄웠습니다.
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 24px 60px 24px" }}>
      <TopBar title="금융 상품" crumb="홈 / 금융 상품" search={false} />

      {/* 필터 영역 */}
      <div style={{ marginTop: "24px", marginBottom: "28px" }}>
        <Panel title="상품 찾기" sub="유형·위험등급으로 필터링">
          <div className="prodfilter">
            <div className="field">
              <label>상품 유형</label>
              <select value={productType} onChange={(e) => handleFilterChange(setProductType, e.target.value)}>
                <option value="">전체 유형</option>
                {Object.entries(PRODUCT_TYPE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>위험 등급</label>
              <select value={riskLevel} onChange={(e) => handleFilterChange(setRiskLevel, e.target.value)}>
                <option value="">전체 위험등급</option>
                {Object.entries(RISK_LEVEL_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>
        </Panel>
      </div>

      {/* 목록 영역 */}
      {filteredProducts.length === 0 ? (
        <Panel><div className="prod-empty">조건에 맞는 상품이 없습니다.</div></Panel>
      ) : (
        <div className="fp-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
          {filteredProducts.map((p) => (
            <div 
              className="fp-card" 
              key={p.productId}
              style={{ borderRadius: "16px", padding: "4px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}
            >
              {/* 카드 본문 */}
              <div className="fp-body" onClick={() => navigate(`/home-products/${p.productId}`)} style={{ cursor: "pointer", padding: "20px" }}>
                <div className="fp-top" style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                  <span style={{ fontSize: "24px", padding: "8px", background: p.bg, borderRadius: "12px" }}>{p.ic}</span>
                  <div>
                    <span className="fp-type" style={{ fontSize: "12px", color: "var(--muted)" }}>{PRODUCT_TYPE_LABELS[p.productType]}</span>
                    <div className="fp-risk" style={{ color: RISK_COLOR[p.riskLevel] || "var(--muted)", fontSize: "12px", fontWeight: "600" }}>
                      ● {RISK_LEVEL_LABELS[p.riskLevel]}
                    </div>
                  </div>
                </div>
                <h3 className="fp-name" style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "6px" }}>{p.productName}</h3>
                <div className="fp-inst" style={{ fontSize: "13px", color: "var(--muted)", marginBottom: "16px" }}>{p.institutionName}</div>
                <div className="fp-rate" style={{ fontSize: "15px" }}>
                  {p.expectedReturnRate != null ? (
                    <>연 <b style={{ fontSize: "18px" }}>{p.expectedReturnRate}%</b></>
                  ) : (
                    <span className="fp-norate" style={{ color: "var(--primary)" }}>혜택 상세 보기</span>
                  )}
                </div>
              </div>

              {/* 액션 버튼 */}
              <div className="fp-actions" onClick={(e) => e.stopPropagation()} style={{ padding: "0 20px 20px 20px", display: "flex", gap: "8px" }}>
                <FavoriteButton userId={TEMP_USER_ID} productId={p.productId} />
                <CompareButton productId={p.productId} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductList;