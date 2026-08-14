import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductDetail } from '../../api/financialProduct/productApi';
import { checkSuitability } from '../../api/recommendation/suitabilityCheckAPI';
import { hasDiagnosisHistory } from '../../api/finance/investmentProfileAPI';
import { PRODUCT_TYPE_LABELS, RISK_LEVEL_LABELS } from '../../constants/financialProduct/productLabels';
import FavoriteButton from './FavoriteButton';

const TEMP_USER_ID = 1; // 인증 붙기 전까지 임시 고정값

function ProductDetail() {
    const { productId } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 적합성 검사 관련 상태
    const [checking, setChecking] = useState(false);
    const [checkResult, setCheckResult] = useState(null); // 검사 결과
    const [needsDiagnosis, setNeedsDiagnosis] = useState(false); // 진단 필요 여부

    useEffect(() => {
        setLoading(true);
        setError(null);

        getProductDetail(productId)
            .then((data) => setProduct(data))
            .catch(() => setError('상품 정보를 불러오지 못했습니다.'))
            .finally(() => setLoading(false));
    }, [productId]);

    function handleCheckSuitability() {
        setChecking(true);
        setCheckResult(null);
        setNeedsDiagnosis(false);

        try {
            const hasHistory = await hasDiagnosisHistory(TEMP_USER_ID);

            if (!hasHistory) {
                setNeedsDiagnosis(true);
                return;
            }

            const data = await checkSuitability(TEMP_USER_ID, productId);
            setCheckResult(data);
        } catch (err) {
            alert('적합성 검사에 실패했습니다.');
        } finally {
            setChecking(false);
        }
    }

    if (loading) return <div>불러오는 중...</div>
    if (error) return <div>{error}</div>;
    if (!product) return null;

    return (
        <div>
            <button onClick={() => navigate('/products')}>목록으로</button>

            <h2>{product.productName}</h2>
            <FavoriteButton userId={TEMP_USER_ID} productId={productId} />
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

            {/* 적합성 검사 영역 */}
            <div>
                <button onClick={handleCheckSuitability} disabled={checking}>
                    {checking ? '확인 중...' : '이 상품이 나한테 맞는지 확인하기'}
                </button>

                {/* 진단 이력 없을 때 안내 */}
                {needsDiagnosis && (
                    <div>
                        <p>투자성향 진단 이력이 없어요. 먼저 진단을 받아주세요.</p>
                        <button onClick={() => navigate('/diagnosis')}>진단하러 가기</button>
                    </div>
                )}

                {/* 검사 결과 표시 */}
                {checkResult && (
                    <div>
                        <p>
                            판정결과:{' '}
                            <strong>
                                {checkResult.suitabilityResult === 'SUITABLE' ? '적합' : '부적합'}
                            </strong>
                        </p>
                        <p>{checkResult.checkReason}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ProductDetail;