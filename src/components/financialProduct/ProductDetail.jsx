import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getProductDetail } from '../../api/financialProduct/productAPI';
import { checkSuitability } from '../../api/recommendation/suitabilityCheckAPI';
import { hasDiagnosisHistory } from '../../api/finance/investmentProfileAPI';
import { PRODUCT_TYPE_LABELS, RISK_LEVEL_LABELS } from '../../constants/financialProduct/productLabels';
import FavoriteButton from './FavoriteButton';
import CompareButton from './CompareButton';
import SubscribeForm from './SubscribeForm';

const TEMP_USER_ID = 1; // 인증 붙기 전까지 임시 고정값

function ProductDetail() {
    const { productId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const isLoggedIn = !!user;

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 가입 전 적합성 게이트 상태
    const [gateStep, setGateStep] = useState('idle');
    // idle -> checking -> needsDiagnosis | suitable | unsuitable
    const [checkResult, setCheckResult] = useState(null);
    const [riskAcknowledged, setRiskAcknowledged] = useState(false);

    useEffect(() => {
        setLoading(true);
        setError(null);

        getProductDetail(productId)
            .then((data) => setProduct(data))
            .catch(() => setError('상품 정보를 불러오지 못했습니다.'))
            .finally(() => setLoading(false));
    }, [productId]);

    async function handleStartSubscribe() {
        if (!isLoggedIn) {
            navigate('/login');
            return;
        }
        setGateStep('checking');
        setRiskAcknowledged(false);

        try {
            const hasHistory = await hasDiagnosisHistory(TEMP_USER_ID);

            if (!hasHistory) {
                setGateStep('needsDiagnosis');
                return;
            }

            const result = await checkSuitability(TEMP_USER_ID, productId);
            setCheckResult(result);
            setGateStep(result.suitabilityResult === 'SUITABLE' ? 'suitable' : 'unsuitable');
        } catch (err) {
            alert('적합성 검사에 실패했습니다.');
            setGateStep('idle');
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
            <CompareButton productId={productId} />
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

            {/* 가입 게이트 */}
            <div>
                {gateStep === 'idle' && isLoggedIn && (
                    <button onClick={handleStartSubscribe}>가입하기</button>
                )}

                {gateStep === 'idle' && !isLoggedIn && (
                    <div>
                        <p>가입은 로그인 후 이용 가능해요.</p>
                        <button onClick={() => navigate('/login')}>로그인하러 가기</button>
                    </div>
                )}

                {gateStep === 'checking' && <p>적합성 검사 중...</p>}

                {gateStep === 'needsDiagnosis' && (
                    <div>
                        <p>투자성향 진단 이력이 없어요. 먼저 진단을 받아주세요.</p>
                        <button onClick={() => navigate('/investment-diagnosis')}>진단하러 가기</button>
                        <button onClick={() => setGateStep('idle')}>취소</button>
                    </div>
                )}

                {/* 적합 : 조용히 통과 -> 기존 SubscribeForm 바로 노출 */}
                {gateStep === 'suitable' && (
                    <>
                        {checkResult?.goalNote && <p>ℹ {checkResult.goalNote}</p>}
                        <SubscribeForm userId={TEMP_USER_ID} product={product}/>
                    </>
                )}

                {/* 부적합 : 사유 + 체크박스 확인 전엔 SubscribeForm 안 보여줌 */}
                {gateStep === 'unsuitable' && (
                    <div>
                        <p><strong>이 상품은 회원님의 투자성향과 맞지 않아요.</strong></p>
                        <p>{checkResult?.checkReason}</p>
                        {checkResult?.goalNote && <p>ℹ {checkResult.goalNote}</p>}

                        <label>
                            <input 
                                type="checkbox"
                                checked={riskAcknowledged}
                                onChange={(e) => setRiskAcknowledged(e.target.checked)}
                            />
                            위 내용을 확인했으며, 그럼에도 가입을 진행하겠습니다.
                        </label>

                        <button
                            type="button"
                            onClick={() => {
                                setGateStep('idle');
                                setRiskAcknowledged(false);
                            }}
                        >
                            가입 취소
                        </button>

                        {riskAcknowledged && (
                            <SubscribeForm userId={TEMP_USER_ID} product={product} />
                        )}
                    </div>
                )}
            </div>
        </div>        
    );
}

export default ProductDetail;