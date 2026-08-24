import { useState } from "react";
import { useComparison } from "../../context/ComparisonContext";
import { useToast } from "../../context/ToastContext";

export default function CompareButton({ productId }) {
    const { isInCompare, findItem, addProduct, removeProduct, canAdd} = useComparison();
    const { showToast } = useToast();
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
                showToast('비교함에서 삭제했어요.');
            } else {
                if (!canAdd) {
                    alert('비교함은 최대 3개까지 담을 수 있어요.');
                    return;
                }
                await addProduct(productId);
                showToast('비교함에 담았어요.');
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
            disabled={pending}
            aria-pressed={inCompare}
            aria-label={inCompare? '비교함에서 빼기' : '비교함에 넣기'}
            title={inCompare ? '비교함에서 빼기' : '비교함에 넣기'}
        >
            {inCompare? '-' : '+'}
        </button>
    );
}