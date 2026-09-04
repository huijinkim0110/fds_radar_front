import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { addFavorite, removeFavorite, checkFavorite } from "../../api/financialProduct/favoriteProductAPI";

export default function FavoriteButton({ userId, productId, initialFavorited }) {
    const { user } = useAuth();
    const isLoggedIn = !!user;
    const [isFavorited, setIsFavorited] = useState(initialFavorited ?? false);
    const [loading, setLoading] = useState(initialFavorited === undefined);
    const [pending, setPending] = useState(false);

    useEffect(() => {
        if (!isLoggedIn) { setLoading(false); return; } // 비로그인은 관심상품 여부 조회도 스킵
        if (initialFavorited !== undefined) return;
        let cancelled = false;
        checkFavorite(userId, productId)
            .then((result) => { if (!cancelled) setIsFavorited(result);})
            .catch(() => {})
            .finally(() => { if (!cancelled) setLoading(false);});
        return () => { cancelled = true; };
    }, [userId, productId, initialFavorited, isLoggedIn]);

    const handleClick = async () => {
        if (!isLoggedIn) {
            alert('로그인이 필요한 기능이에요.');
            return;
        }
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
            aria-label={isFavorited ? '관심상품 해제' : '관심상품 등록'}
        >
            {isFavorited ? '★' : '☆'}
        </button>
    );
}