import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useComparison } from "../../context/ComparisonContext";
import { getUserComparisons, getComparisonDetail } from "../../api/financialProduct/productComparisonAPI";
import { PRODUCT_TYPE_LABELS, RISK_LEVEL_LABELS } from "../../constants/financialProduct/productLabels";

const TEMP_USER_ID = 1;

const FIELDS = [
    { key: 'institutionName', label: '금융사' },
    { key: 'productType', label: '유형' },
    { key: 'riskLevel', label: '위험등급' },
    { key: 'expectedReturnRate', label: '예상수익률' },
    { key: 'subscriptionPeriod', label: '가입기간' },
    { key: 'principalProtection', label: '원금보장' }
];

function formatValue(key, item) {
    switch (key) {
        case 'productType': return PRODUCT_TYPE_LABELS[item.productType];
        case 'riskLevel': return RISK_LEVEL_LABELS[item.riskLevel];
        case 'expectedReturnRate': return item.expectedReturnRate != null ? `연 ${item.expectedReturnRate}%` : '-';
        case 'subscriptionPeriod': return item.subscriptionPeriod != null ? `${item.subscriptionPeriod}개월` : '-';
        case 'principalProtection': return item.principalProtection ? 'O' : 'X';
        default: return item[key];
    }
}

// 숫자로 비교 가능한 항목 중 제일 좋은 값인지 판단(현재는 예상수익률만 하이라이트 대상)
function isBest(key, item, items) {
    if (key !== 'expectedReturnRate') return false;
    const max = Math.max(...items.map((i) => i.expectedReturnRate ?? -Infinity));
    return item.expectedReturnRate == max;
}

function ProductComparison() {
    const { comparisonId: activeId, items: activeItems, removeProduct, saveComparison, clearComparison } = useComparison();
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
        const name = prompt('이 비교함에 붙일 이름을 입력해주세요.', '비교함');
        if (!name) return;

        try {
            await saveComparison(name);
            getUserComparisons(TEMP_USER_ID).then(setPastComparisons).catch(() => {});
        } catch (err) {
            alert('저장에 실패했습니다.');
        }
    }

    // 비교함 비우기 : 화면 초기화, 이후 담는 상품은 새 비교함으로
    function handleClear() {
        clearComparison();
    }

    async function handleRemove(comparisonItemId) {
        try {
            await removeProduct(comparisonItemId);
            // 지난 비교함을 보는 중이면 화면도 직접 갱신
            if (!isActive) {
                setItems((prev) => prev.filter((i) => i.comparisonItemId !== comparisonItemId));
            }
        } catch (err) {
            alert('삭제에 실패했습니다.');
        }
    }

    if (items.length === 0) {
        return (
            <div>
                <div>비교함에 담긴 상품이 없어요. 상품 목록에서 "비교하기"를 눌러 담아주세요.</div>
                {pastComparisons.length > 0 && (
                    <PastComparisonList items={pastComparisons} activeId={activeId} />
                )}
            </div>
        );
    }

    return (
        <div>
            <h2>비교상품</h2>
            {isActive && (
                <div>
                    <button type="button" onClick={handleSave}>저장</button>
                    <button type="button" onClick={handleClear}>비교함 비우기</button>
                </div>
            )}

            {/* 보여줄 항목 선택 */}
            <div>
                {FIELDS.map((f) => (
                    <label key={f.key}>
                        <input 
                            type="checkbox"
                            checked={visibleFields.includes(f.key)}
                            onChange={() => toggleField(f.key)}
                        />
                        {f.label}
                    </label>
                ))}
            </div>

            <table>
                <thead>
                    <tr>
                        <th></th>
                        {items.map((item) => (
                            <th key={item.productId}>
                                {item.productName}
                                <button type="button" onClick={() => handleRemove(item.comparisonItemId)}>
                                    삭제
                                </button>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {FIELDS.filter((f) => visibleFields.includes(f.key)).map((f) => (
                        <tr key={f.key}>
                            <td>{f.label}</td>
                            {items.map((item) => (
                                <td key={item.productId}>
                                    {formatValue(f.key, item)}
                                    {isBest(f.key, item, items) ? ' ★' : ''}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>

            {pastComparisons.length > 0 && (
                <PastComparisonList items={pastComparisons} activeId={activeId} />
            )}
        </div>
    );
}

function PastComparisonList({ items, activeId }) {
    return (
        <div>
            <h3>지난 비교함</h3>
            <ul>
                {items.map((c) => (
                    <li key={c.comparisonId}>
                        <Link to={`/mypage/comparisons/${c.comparisonId}`}>
                            {c.comparisonName}{c.comparisonId === activeId ? ' (현재)' : ''}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default ProductComparison;