import { useState, useEffect } from 'react';
import { useNavigate} from 'react-router-dom';
import { getProducts } from '../../api/financialProduct/productAPI';
import { PRODUCT_TYPE_LABELS, RISK_LEVEL_LABELS } from '../../constants/financialProduct/productLabels';

function ProductList() {
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [productType, setProductType] = useState('');
    const [riskLevel, setRiskLevel] = useState('');

    useEffect(() => {
        setLoading(true);
        setError(null);

        getProducts({ productType, riskLevel, page })
            .then((data) => {
                setProducts(data.content);
                setTotalPages(data.totalPages);
            })
            .catch(() => setError('상품 목록을 불러오지 못했습니다.'))
            .finally(() => setLoading(false));
    }, [productType, riskLevel, page]);

    function handleFilterChange(setter, value) {
        setter(value);
        setPage(0);
    }

    if (loading) return <div>불러오는 중...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div>
            <select
                value={productType}
                onChange={(e) => handleFilterChange(setProductType, e.target.value)}
            >
                <option value="">전체 유형</option>
                {Object.entries(PRODUCT_TYPE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                ))}
            </select>

            <select
                value={riskLevel}
                onChange={(e) => handleFilterChange(setRiskLevel, e.target.value)}
            >
                <option value="">전체 위험등급</option>
                {Object.entries(RISK_LEVEL_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                ))}
            </select>

            {products.length === 0 ? (
                <div>조건에 맞는 상품이 없습니다.</div>
            ) : (
                <div>
                    {products.map((p) => (
                        <div key={p.productId} onClick={() => navigate(`/products/${p.productId}`)}>
                            <h3>{p.productName}</h3>
                            <p>{p.institutionName}</p>
                            <p>{PRODUCT_TYPE_LABELS[p.productType]} / {RISK_LEVEL_LABELS[p.riskLevel]}</p>
                            <p>{p.expectedReturnRate != null ? `연 ${p.expectedReturnRate}%` : '-'}</p>
                        </div>
                    ))}
                </div>
            )}

            <div>
                <button disabled={page === 0} onClick={() => setPage(page - 1)}>이전</button>
                <span>{page + 1} / {totalPages || 1}</span>
                <button disabled={page + 1 >= totalPages} onClick={() => setPage(page + 1)}>다음</button>
            </div>
        </div>
    );
}

export default ProductList;