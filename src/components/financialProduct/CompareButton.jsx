import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useComparison } from "../../context/ComparisonContext";
import { useToast } from "../../context/ToastContext";

export default function CompareButton({ productId }) {
  const { user } = useAuth();
  const isLoggedIn = !!user;
  const { isInCompare, findItem, addProduct, removeProduct, canAdd } = useComparison();
  const { showToast } = useToast();
  const [pending, setPending] = useState(false);

  const inCompare = isInCompare(productId);

  async function handleClick(e) {

    e.stopPropagation(); // 목록에서 카드 클릭(상세 이동)과 겹치지 않게
    if (!isLoggedIn) {
      alert('로그인이 필요한 기능이에요.');
      return;
    }

    if (pending) return;
    setPending(true);

    try {
      if (inCompare) {
        const item = findItem(productId);
        await removeProduct(item.comparisonItemId);
        showToast("비교함에서 삭제했어요.");
      } else {
        if (!canAdd) {
          alert("비교함은 최대 3개까지 담을 수 있어요.");
          return;
        }

        await addProduct(productId);
        showToast("비교함에 담았어요.");
      }
    } catch (err) {
      alert("비교함 처리에 실패했습니다.");
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
      title={inCompare ? "비교함에서 빼기" : "비교함에 넣기"}
      style={{
        minWidth: "112px",
        height: "38px",
        padding: "0 16px",
        borderRadius: "20px",
        border: "1.5px solid #6366F1",
        background: inCompare ? "#EEF2FF" : "transparent",
        color: "#6366F1",
        fontSize: "13px",
        fontWeight: "700",
        fontFamily: "inherit",
        cursor: pending ? "default" : "pointer",
        opacity: pending ? 0.6 : 1,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
        whiteSpace: "nowrap",
        transition: "all 0.2s ease",
      }}
    >
      <span
        style={{
          fontSize: inCompare ? "16px" : "20px",
          lineHeight: 1,
          fontWeight: "500",
        }}
      >
        {inCompare ? "✓" : "+"}
      </span>

      <span>
        {inCompare ? "비교중" : "비교 담기"}
      </span>
    </button>
  );
}