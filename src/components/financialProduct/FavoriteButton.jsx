import { useEffect, useState } from "react";
import { addFavorite, removeFavorite, checkFavorite } from "../../api/financialProduct/favoriteProductAPI";

export default function FavoriteButton({ userId, productId, initialFavorited }) {
    const [isFavorited, setIsFavorited] = useState(initialFavorited ?? false);
    const [loading, setLoading] = useState(initialFavorited === undefined);
    const [pending, setPending] = useState(false);

    useEffect(() => {
        if (initialFavorited !== undefined) return;
        let cancelled = false;
        checkFavorite(userId, productId)
            .then((result) => { if (!cancelled) setIsFavorited(result);})
            .catch(() => {})
            .finally(() => { if (!cancelled) setLoading(false);});
        return () => { cancelled = true; };
    }, [userId, productId, initialFavorited]);

    const handleClick = async () => {
        if (pending) return;
        setPending(true);
        const prev = isFavorited;
        setIsFavorited(!prev);

        try {
            if (prev) {
                await removeFavorite(userId, productId);
            } else {
                await addFavorite(userId, productId);
            }
        } catch (err) {
            const errorCode = err.response?.data?.errorCode;
            if (errorCode === 'INVALID_STATE') {
                // 서버 기준 상태를 신뢰(이미 등록/이미 해제된 상태였던 경우)
                setIsFavorited(!prev);
            } else {
                setIsFavorited(prev);
            }
            console.error('관심상품 처리 실패:', err.response?.data?.message ?? err.message);
        } finally {
            setPending(false);
        }
    };

       return (
        <button
  type="button"
  onClick={handleClick}
  disabled={loading || pending}
  aria-pressed={isFavorited}
  aria-label={isFavorited ? "관심상품 해제" : "관심상품 등록"}
  title={isFavorited ? "관심상품 해제" : "관심상품 등록"}
  style={{
    width: "32px",
    height: "32px",
    padding: 0,
    border: "none",
    background: "transparent",
    color: isFavorited ? "#F5B301" : "#AAB2C0",
    fontSize: "25px",
    lineHeight: 1,
    cursor: pending ? "default" : "pointer",
    opacity: pending ? 0.6 : 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }}
>
  {isFavorited ? "★" : "☆"}
</button>
    );
}