import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getProducts } from "../../api/financialProduct/productAPI";
import { PRODUCT_TYPE_LABELS, RISK_LEVEL_LABELS } from "../../constants/financialProduct/productLabels";
import FavoriteButton from "./FavoriteButton";
import CompareButton from "./CompareButton";
import TopBar from "../TopBar.jsx";
import Panel from "../Panel.jsx";

const TEMP_USER_ID = 1;

const RISK_COLOR = {
  VERY_LOW: "var(--green)",
  LOW: "var(--green)",
  MEDIUM: "var(--amber)",
  HIGH: "var(--red)",
  VERY_HIGH: "var(--red)",
};

function ProductList() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [productType, setProductType] = useState("");
  const [riskLevel, setRiskLevel] = useState("");

  useEffect(() => {
    setLoading(true);
    setError(null);
    getProducts({ productType, riskLevel, page })
      .then((data) => {
        setProducts(data.content);
        setTotalPages(data.totalPages);
      })
      .catch(() => setError("상품 목록을 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, [productType, riskLevel, page]);

  function handleFilterChange(setter, value) {
    setter(value);
    setPage(0);
  }

  return (
    <>
      <TopBar title="금융 상품" crumb="홈 / 금융 상품" search={false} />

      {/* 필터 */}
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

      {/* 목록 */}
      {loading ? (
        <div className="loading">불러오는 중…</div>
      ) : error ? (
        <Panel><div className="prod-empty">{error}</div></Panel>
      ) : products.length === 0 ? (
        <Panel><div className="prod-empty">조건에 맞는 상품이 없습니다.</div></Panel>
      ) : (
        <div className="fp-grid">
          {products.map((p) => (
            <div className="fp-card" key={p.productId}>
              {/* 카드 본문 클릭 → 진짜 상품 상세 */}
              <div className="fp-body" onClick={() => navigate(`/products/${p.productId}`)}>
                <div className="fp-top">
                  <span className="fp-type">{PRODUCT_TYPE_LABELS[p.productType]}</span>
                  <span className="fp-risk" style={{ color: RISK_COLOR[p.riskLevel] || "var(--muted)" }}>
                    ● {RISK_LEVEL_LABELS[p.riskLevel]}
                  </span>
                </div>
                <h3 className="fp-name">{p.productName}</h3>
                <div className="fp-inst">{p.institutionName}</div>
                <div className="fp-rate">
                  {p.expectedReturnRate != null ? (
                    <>연 <b>{p.expectedReturnRate}%</b></>
                  ) : (
                    <span className="fp-norate">수익률 정보 없음</span>
                  )}
                </div>
              </div>

              {/* 액션 버튼 (진짜 productId 숫자) */}
              <div className="fp-actions" onClick={(e) => e.stopPropagation()}>
                <FavoriteButton userId={TEMP_USER_ID} productId={p.productId} />
                <CompareButton productId={p.productId} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 페이지네이션 */}
      {!loading && !error && products.length > 0 && (
        <div className="fp-pager">
          <button className="fp-pg-btn" disabled={page === 0} onClick={() => setPage(page - 1)}>← 이전</button>
          <span className="fp-pg-num">{page + 1} / {totalPages || 1}</span>
          <button className="fp-pg-btn" disabled={page + 1 >= totalPages} onClick={() => setPage(page + 1)}>다음 →</button>
        </div>
      )}
    </>
  );
}

export default ProductList;