import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getFavorites,
  removeFavorite,
} from "../../api/financialProduct/favoriteProductAPI";
import {
  PRODUCT_TYPE_LABELS,
} from "../../constants/financialProduct/productLabels";

import TopBar from "../TopBar.jsx";
import Panel from "../Panel.jsx";

const TEMP_USER_ID = 1;

export default function FavoriteProductList() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadFavorites = useCallback(() => {
    setLoading(true);
    setError(null);

    getFavorites(TEMP_USER_ID)
      .then(setProducts)
      .catch((err) =>
        setError(err.response?.data?.message ?? err.message)
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const handleRemove = async (productId) => {
    const prevProducts = products;

    setProducts((list) =>
      list.filter((p) => p.productId !== productId)
    );

    try {
      await removeFavorite(TEMP_USER_ID, productId);
    } catch (err) {
      setProducts(prevProducts);

      console.error(
        "관심상품 해제 실패:",
        err.response?.data?.message ?? err.message
      );
    }
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "1180px",
        margin: "0 auto",
        padding: "32px 24px 60px",
        boxSizing: "border-box",
      }}
    >
      <TopBar
        title="관심상품"
        crumb="홈 / 자산관리 / 관심상품"
        search={false}
      />

      <div style={{ marginTop: 20 }}>
        <Panel
          title="관심상품"
          sub={`내가 저장한 금융상품 ${products.length}개`}
        >
          {loading ? (
            <div
              style={{
                padding: "48px 0",
                textAlign: "center",
                color: "var(--muted)",
                fontSize: 14,
              }}
            >
              관심상품을 불러오는 중…
            </div>
          ) : error ? (
            <div
              style={{
                padding: "48px 0",
                textAlign: "center",
                color: "var(--muted)",
                fontSize: 14,
              }}
            >
              관심상품을 불러오지 못했습니다.
            </div>
          ) : products.length === 0 ? (
            <div
              style={{
                padding: "55px 20px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: 28,
                  color: "var(--muted)",
                  marginBottom: 10,
                }}
              >
                ☆
              </div>

              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "var(--ink)",
                  marginBottom: 5,
                }}
              >
                등록된 관심상품이 없습니다.
              </div>

              <div
                style={{
                  fontSize: 13,
                  color: "var(--muted)",
                }}
              >
                금융상품에서 별표를 눌러 관심상품을 추가해보세요.
              </div>
            </div>
          ) : (
            <div>
              {products.map((product, index) => (
                <div
                  key={product.productId}
                  onClick={() =>
                    navigate(`/products/${product.productId}`)
                  }
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 20,
                    padding: "20px 4px",
                    borderBottom:
                      index === products.length - 1
                        ? "none"
                        : "1px solid var(--line)",
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 7,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: "var(--blue)",
                        }}
                      >
                        {PRODUCT_TYPE_LABELS[product.productType] ??
                          product.productType}
                      </span>

                      {product.principalProtection && (
                        <span
                          style={{
                            padding: "3px 7px",
                            borderRadius: 999,
                            background: "var(--panel2)",
                            color: "var(--muted)",
                            fontSize: 11,
                            fontWeight: 600,
                          }}
                        >
                          원금보장
                        </span>
                      )}
                    </div>

                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: 800,
                        color: "var(--ink)",
                        marginBottom: 5,
                      }}
                    >
                      {product.productName}
                    </div>

                    <div
                      style={{
                        fontSize: 13,
                        color: "var(--muted)",
                      }}
                    >
                      {product.institutionName}
                    </div>
                  </div>

                  <div
                    style={{
                      minWidth: 115,
                      textAlign: "right",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--muted)",
                        marginBottom: 4,
                      }}
                    >
                      예상 수익률
                    </div>

                    <div
                      style={{
                        fontSize: 17,
                        fontWeight: 800,
                        color: "var(--ink)",
                      }}
                    >
                      {product.expectedReturnRate != null
                        ? `연 ${product.expectedReturnRate}%`
                        : "-"}
                    </div>
                  </div>

                  <button
                    type="button"
                    title="관심상품 해제"
                    aria-label="관심상품 해제"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(product.productId);
                    }}
                    style={{
                      width: 36,
                      height: 36,
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 0,
                      border: "none",
                      background: "transparent",
                      color: "#F2B01E",
                      fontSize: 24,
                      lineHeight: 1,
                      cursor: "pointer",
                    }}
                  >
                    ★
                  </button>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}