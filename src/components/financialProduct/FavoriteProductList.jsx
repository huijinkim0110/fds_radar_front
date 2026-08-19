import { useEffect, useState, useCallback } from "react";
import { getFavorites, removeFavorite } from "../../api/financialProduct/favoriteProductAPI";
import { PRODUCT_TYPE_LABELS, RISK_LEVEL_LABELS } from "../../constants/financialProduct/productLabels";

const TEMP_USER_ID = 1; // 인증 붙기 전까지 임시 고정값

export default function FavoriteProductList() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadFavorites = useCallback(() => {
        setLoading(true);
        setError(null);
        getFavorites(TEMP_USER_ID)
            .then(setProducts)
            .catch((err) => setError(err.response?.data?.message ?? err.message))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        loadFavorites();
    }, [loadFavorites]);

    const handleRemove = async (productId) => {
        const prevProducts = products;
        setProducts((list) => list.filter((p) => p.productId !== productId));
        try {
            await removeFavorite(TEMP_USER_ID, productId);
        } catch (err) {
            setProducts(prevProducts);
            console.error('관심상품 해제 실패:', err.response?.data?.message ?? err.message);
        }
    };

    if (loading) return <div>불러오는 중...</div>;
    if (error) return <div>관심상품을 불러오지 못했습니다. ({error})</div>;
    if (products.length === 0) return <div>등록된 관심상품이 없습니다.</div>;

    return (
        <div>
            <h2>관심상품</h2>
            <ul>
                {products.map((product) => (
                    <li key={product.productId}>
                        <div>
                            <div>{product.productName}</div>
                            <div>
                                {product.institutionName} · {PRODUCT_TYPE_LABELS[product.productType]} · 위험도 {RISK_LEVEL_LABELS[product.riskLevel]}
                            </div>
                            <div>
                                예상 수익률 {product.expectedReturnRate}%
                                {product.principalProtection ? ' · 원금보장' : ''}
                            </div>
                        </div>
                        <button type="button" onClick={() => handleRemove(product.productId)}>해제</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}