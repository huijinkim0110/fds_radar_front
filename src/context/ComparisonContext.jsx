import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { 
    createComparison,
    addItem,
    removeItem,
    getComparisonDetail,
    getUserComparisons,
    renameComparison
} from "../api/financialProduct/productComparisonAPI";

const TEMP_USER_ID = 1;
const MAX_COMPARE_ITEMS = 3;
const DEFAULT_COMPARISON_NAME = '내 비교함';

const ComparisonContext = createContext(null);

export function ComparisonProvider({ children }) {
    const { user } = useAuth();
    const isLoggedIn = !!user;
    const [comparisonId, setComparisonId] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSaved, setIsSaved] = useState(false);

    // 앱 진입 시 기존 비교함이 있으면 불러오고, 없으면 comparisonId=null로 둠(첫 담기 시점에 생성)
    useEffect(() => {
        let cancelled = false;
        // 비로그인은 비교함 조회 자체를 스킵
        if (!isLoggedIn) { setLoading(false); return; }

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
            setIsSaved(false); // 새로 만든 비교함은 아직 저장 전 상태
        }

        await addItem(targetId, productId);
        await refresh(targetId);
    }, [comparisonId, refresh]);

    // 저장 : 지금 비교함 이름만 바꿈. 담긴 상품(화면)은 그대로 유지
    const saveComparison = useCallback(async (name) => {
        if (!comparisonId) return;
        await renameComparison(comparisonId, name);
        setIsSaved(true);
    }, [comparisonId]);

    // 비교함 비우기 : 활성 비교함을 초기화. 이후 담는 상품은 새 비교함으로 들어감
    const clearComparison = useCallback(() => {
        setComparisonId(null);
        setItems([]);
        setIsSaved(false);
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
        isSaved,
        isInCompare,
        findItem,
        canAdd,
        addProduct,
        removeProduct,
        saveComparison,
        clearComparison,
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