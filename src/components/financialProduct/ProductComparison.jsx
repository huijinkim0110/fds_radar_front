import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useComparison } from "../../context/ComparisonContext";
import { useConfirm } from "../../context/ConfirmContext";
import { useToast } from "../../context/ToastContext";
import { getUserComparisons, getComparisonDetail } from "../../api/financialProduct/productComparisonAPI";
import { PRODUCT_TYPE_LABELS, RISK_LEVEL_LABELS } from "../../constants/financialProduct/productLabels";
import TopBar from "../TopBar.jsx";
import Panel from "../Panel.jsx";

const TEMP_USER_ID = 1;

const FIELDS = [
  { key: "institutionName", label: "금융사" },
  { key: "productType", label: "유형" },
  { key: "riskLevel", label: "위험등급" },
  { key: "expectedReturnRate", label: "예상수익률" },
  { key: "subscriptionPeriod", label: "가입기간" },
  { key: "principalProtection", label: "원금보장" },
];

function formatValue(key, item) {
  switch (key) {
    case "productType": return PRODUCT_TYPE_LABELS[item.productType];
    case "riskLevel": return RISK_LEVEL_LABELS[item.riskLevel];
    case "expectedReturnRate": return item.expectedReturnRate != null ? `연 ${item.expectedReturnRate}%` : "-";
    case "subscriptionPeriod": return item.subscriptionPeriod != null ? `${item.subscriptionPeriod}개월` : "-";
    case "principalProtection": return item.principalProtection ? "O" : "X";
    default: return item[key];
  }
}

// 숫자로 비교 가능한 항목 중 제일 좋은 값인지 판단(현재는 예상수익률만 하이라이트 대상)
function isBest(key, item, items) {
  if (key !== "expectedReturnRate") return false;
  const max = Math.max(...items.map((i) => i.expectedReturnRate ?? -Infinity));
  return item.expectedReturnRate == max;
}

function ProductComparison() {
  const { comparisonId: activeId, items: activeItems, removeProduct, saveComparison, clearComparison, isSaved, maxItems } = useComparison();
  const confirm = useConfirm();
  const { showToast } = useToast();
  const { comparisonId: routeId } = useParams(); // /mypage/comparisons/:comparisonId(지난 비교함 볼 때만 존재)
  const navigate = useNavigate();

  // routeId가 없으면 활성 비교함을 보고, 있으면 그 비교함을 직접 조회
  const viewingId = routeId ?? activeId;
  const isActive = !routeId || Number(routeId) === activeId;

  const [pastComparisons, setPastComparisons] = useState([]);
  const [items, setItems] = useState([]);
  const [visibleFields, setVisibleFields] = useState(FIELDS.map((f) => f.key));

  useEffect(() => {
    getUserComparisons(TEMP_USER_ID).then(setPastComparisons).catch(() => {});
  }, [activeId]);

  useEffect(() => {
    if (isActive) {
      setItems(activeItems);
      return;
    }
    if (!viewingId) return;
    getComparisonDetail(viewingId).then((detail) => setItems(detail.items)).catch(() => {});
  }, [viewingId, isActive, activeItems]);

  function toggleField(key) {
    setVisibleFields((prev) =>
      prev.includes(key) ? prev.filter((f) => f !== key) : [...prev, key]
    );
  }

  // 저장 : 지금 비교함에 이름만 붙임. 화면(담긴 상품)은 그대로 유지, 지난 비교함 목록만 갱신
  async function handleSave() {
    const name = prompt("이 비교함에 붙일 이름을 입력해주세요.", "비교함");
    if (!name) return;

    try {
      await saveComparison(name);
      getUserComparisons(TEMP_USER_ID).then(setPastComparisons).catch(() => {});
    } catch (err) {
      alert("저장에 실패했습니다.");
    }
  }

  // 비교함 비우기 : 화면 초기화, 이후 담는 상품은 새 비교함으로
  async function handleClear() {
    const confirmMessage = isSaved
      ? "비교함을 비울까요? 저장된 내용은 지난 비교함에서 계속 볼 수 있어요."
      : "비교함을 비울까요? 저장하지 않으면 지금 담긴 상품은 다시 볼 수 없어요.";
    const ok = await confirm(confirmMessage);
    if (!ok) return;

    clearComparison();
    showToast("비교함을 비웠어요.");
  }

  async function handleRemove(comparisonItemId) {
    try {
      await removeProduct(comparisonItemId);
      // 지난 비교함을 보는 중이면 화면도 직접 갱신
      if (!isActive) {
        setItems((prev) => prev.filter((i) => i.comparisonItemId !== comparisonItemId));
      }
    } catch (err) {
      alert("삭제에 실패했습니다.");
    }
  }

  // 빈 비교함 화면
  if (items.length === 0) {
    return (
      <>
        <TopBar title="비교상품" crumb="마이페이지 / 비교상품" search={false} />
        <Panel>
          <div className="cmp-empty">
            <div className="cmp-empty-ic">⚖️</div>
            <p>비교함에 담긴 상품이 없어요.</p>
            <span>상품 목록에서 "+ 비교함에 담기"를 눌러 담아주세요.</span>
            <button className="primary" style={{ maxWidth: 220, marginTop: 16 }} onClick={() => navigate("/products")}>
              상품 목록으로 가기 →
            </button>
          </div>
        </Panel>
        {pastComparisons.length > 0 && (
          <PastComparisonList items={pastComparisons} activeId={activeId} />
        )}
      </>
    );
  }

  const visible = FIELDS.filter((f) => visibleFields.includes(f.key));

  return (
    <>
      <TopBar title="비교상품" crumb="마이페이지 / 비교상품" search={false} />

      <Panel
        title={`비교함 (${items.length}/${maxItems})`}
        sub="담은 상품을 나란히 비교해요"
        right={
          isActive && (
            <div style={{ display: "flex", gap: 8 }}>
              <button className="minibtn" onClick={handleSave}>저장</button>
              <button className="minibtn warn" onClick={handleClear}>비우기</button>
            </div>
          )
        }
      >
        {/* 보여줄 항목 선택 */}
        <div className="cmp-fields">
          {FIELDS.map((f) => (
            <label key={f.key} className={`cmp-field ${visibleFields.includes(f.key) ? "on" : ""}`}>
              <input
                type="checkbox"
                checked={visibleFields.includes(f.key)}
                onChange={() => toggleField(f.key)}
              />
              {f.label}
            </label>
          ))}
        </div>

        {/* 비교 표 */}
        <div className="cmp-table-wrap">
          <table className="cmp-table">
            <thead>
              <tr>
                <th className="cmp-th-field">항목</th>
                {items.map((item) => (
                  <th key={item.productId}>
                    <div className="cmp-prod-head">
                      <span className="cmp-prod-name">{item.productName}</span>
                      <button className="cmp-remove" type="button" onClick={() => handleRemove(item.comparisonItemId)}>
                        삭제
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((f) => (
                <tr key={f.key}>
                  <td className="cmp-field-label">{f.label}</td>
                  {items.map((item) => {
                    const best = isBest(f.key, item, items);
                    return (
                      <td key={item.productId} className={best ? "cmp-best" : ""}>
                        {formatValue(f.key, item)}
                        {best ? " ★" : ""}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {pastComparisons.length > 0 && (
        <PastComparisonList items={pastComparisons} activeId={activeId} />
      )}
    </>
  );
}

function PastComparisonList({ items, activeId }) {
  return (
    <Panel title="지난 비교함" sub="저장한 비교함" style={{ marginTop: 16 }}>
      <div className="cmp-past">
        {items.map((c) => (
          <Link key={c.comparisonId} to={`/mypage/comparisons/${c.comparisonId}`} className="cmp-past-item">
            <span className="cmp-past-name">{c.comparisonName}</span>
            {c.comparisonId === activeId && <span className="cmp-past-now">현재</span>}
          </Link>
        ))}
      </div>
    </Panel>
  );
}

export default ProductComparison;