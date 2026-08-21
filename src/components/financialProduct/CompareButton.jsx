import { useState } from "react";
import { useComparison } from "../../context/ComparisonContext";

export default function CompareButton({ productId }) {
    const { isInCompare, findItem, addProduct, removeProduct, canAdd} = useComparison();
    const [pending, setPending] = useState(false);

    const inCompare = isInCompare(productId);

    async function handleClick(e) {
        e.stopPropagation(); // 목록에서 카드 클릭(상세 이동)과 겹치지 않게
        if (pending) return;
        setPending(true);

        try {
            if (inCompare) {
                const item = findItem(productId);
                await removeProduct(item.comparisonItemId);
            } else {
                if (!canAdd) {
                    alert('비교함은 최대 3개까지 담을 수 있어요.');
                    return;
                }
                await addProduct(productId);
            }
        } catch (err) {
            alert('비교함 처리에 실패했습니다.');
        } finally {
            setPending(false);
        }
    }

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={pending || (!inCompare && !canAdd)}
            aria-pressed={inCompare}
        >
            {inCompare? '비교함에서 빼기' : '비교하기'}
        </button>
    );
}