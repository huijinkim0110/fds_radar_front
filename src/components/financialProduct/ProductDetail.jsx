import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductDetail } from '../../api/productApi';
import { PRODUCT_TYPE_LABELS, RISK_LEVEL_LABELS } from '../../constants/productLabels';

function ProductDetail() {
    const { productId } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        setError(null);

        getProductDetail(productId)
            .then((data) => setProduct(data))
            .catch(() => setError('상품 정보를 불러오지 못했습니다.'))
            .finally(() => setLoading(false));
    }, [productId]);

    if (loading) return <div>불러오는 중...</div>
    if (error) return <div>{error}</div>;
    if (!product) return null;

    return (
        <div>
            <button onClick={() => navigate('/products')}>목록으로</button>

            <h2>{product.productName}</h2>
            <p>{product.institutionName}</p>

            <dl>
                <dt>상품유형</dt>
                <dd>{PRODUCT_TYPE_LABELS[product.productType]}</dd>

                <dt>위험등급</dt>
                <dd>{RISK_LEVEL_LABELS[product.riskLevel]}</dd>

                <dt>원금보장</dt>
                <dd>{product.principalProtection ? '보장' : '비보장'}</dd>

                <dt>예상수익률</dt>
                <dd>{product.expectedReturnRate != null ? `연 ${product.expectedReturnRate}%` : '-'}</dd>

                <dt>가입기간</dt>
                <dd>{product.subscriptionPeriod != null ? `${product.subscriptionPeriod}개월` : '-'}</dd>

                <dt>가입금액</dt>
                <dd>
                    {product.minAmount != null ? `${product.minAmount.toLocaleString()}원` : '제한없음'}
                    {' ~ '}
                    {product.maxAmount != null ? `${product.maxAmount.toLocaleString()}원` : '제한없음'}
                </dd>

                <dt>상품설명</dt>
                <dd>{product.description}</dd>
            </dl>
        </div>
    );
}

export default ProductDetail;