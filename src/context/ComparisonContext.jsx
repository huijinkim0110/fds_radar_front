import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { 
    createComparison,
    addItem,
    removeItem,
    getComparisonDetail,
    getUserComparisons
} from "../api/financialProduct/productComparisonAPI";

const TEMP_USER_ID = 1;
const MAX_COMPARE_ITEMS = 3;
const DEFAULT_COMPARISON_NAME = '내 비교함';

const ComparisonContext = createContext(null);

export function ComparisonProvider({ children }) {
    const [comparisonId, setComparisonId] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    // 앱 진입 시 기존 비교함이 있으면 불러오고, 없으면 comparisonId=null로 둠(첫 담기 시점에 생성)
    useEffect(() => {
        let cancelled = false;

        getUserComparisons(TEMP_USER_ID)
            .then((list) => {
                if (!cancelled && list.length > 0) {
                    setComparisonId(list[0].comparisonId);
                }
            })
            .catch(() => {})
            .finally(() => { if (!cancelled) setLoading(false); });

        return () => { cancelled = true; };
    }, []);

    const refresh = useCallback((id) => {
        if (!id) return Promise.resolve();
        return getComparisonDetail(id).then((detail) => setItems(detail.items));
    }, []);

    useEffect(() => {
        if (comparisonId) refresh(comparisonId);
    }, [comparisonId, refresh]);

    const isInCompare = useCallback(
        (productId) => items.some((i) => i.productId === Number(productId)),
        [items]
    );

    const findItem = useCallback(
        (productId) => items.find((i) => i.productId === Number(productId)),
        [items]
    );

    const canAdd = items.length < MAX_COMPARE_ITEMS;

    const addProduct = useCallback(async (productId) => {
        let targetId = comparisonId;

        // 비교함이 아직 없으면 처음 담는 시점에 자동 생성
        if (!targetId) {
            const created = await createComparison(TEMP_USER_ID, DEFAULT_COMPARISON_NAME);
            targetId = created.comparisonId;
            setComparisonId(targetId);
        }

        await addItem(targetId, productId);
        await refresh(targetId);
    }, [comparisonId, refresh]);

    // 지금 비교함은 이력으로 남기고, 이름을 새로 지어 활성 비교함을 교체
    const startNewComparison = useCallback(async (name) => {
        const created = await createComparison(TEMP_USER_ID, name);
        setComparisonId(created.comparisonId);
        setItems([]); // 새 비교함은 빈 상태로 시작
    }, []);

    const removeProduct = useCallback(async (comparisonItemId) => {
        if (!comparisonId) return;
        await removeItem(comparisonId, comparisonItemId);
        await refresh(comparisonId);
    }, [comparisonId, refresh]);

    const value = {
        comparisonId,
        items,
        loading,
        isInCompare,
        findItem,
        canAdd,
        addProduct,
        removeProduct,
        startNewComparison,
        maxItems: MAX_COMPARE_ITEMS
    };

    return (
        <ComparisonContext.Provider value={value}>
            {children}
        </ComparisonContext.Provider>
    )
}

export function useComparison() {
    const ctx = useContext(ComparisonContext);
    if (!ctx) throw new Error('useComparison은 ComparisonProvider 내부에서만 사용할 수 있습니다.');
    return ctx;
}