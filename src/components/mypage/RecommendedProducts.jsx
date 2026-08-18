import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getLatestProfile, hasDiagnosisHistory } from "../../api/finance/investmentProfileAPI";
import { getUnifiedRecommendations } from "../../api/recommendation/recommendationAPI";
import { isStale, formatElapsed } from "../../utils/staleness";

const TEMP_USER_ID = 1;

const SOURCE_LABELS = {
    AI_SECURITIES: 'AI 증권 추천', 
    AI_INSURANCE: 'AI 보험 추천',
    RULE_BASED: '예적금 (규칙 기반)'
};

function RecommendedProducts() {
    const navigate = useNavigate();

    const [checking, setChecking] = useState(true);
    const [needsDiagnosis, setNeedsDiagnosis] = useState(false);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);
    const [latestProfile, setLatestProfile] = useState(null);

    useEffect(() => {
        hasDiagnosisHistory(TEMP_USER_ID)
            .then((has) => setNeedsDiagnosis(!has))
            .catch(() => {})
            .finally(() => setChecking(false));
    }, []);

    useEffect(() => {
        if (needsDiagnosis === false) {
            getLatestProfile(TEMP_USER_ID).then(setLatestProfile).catch(() => {});
        }
    }, [needsDiagnosis]);

    function handleFetchRecommendations() {
        setLoading(true);
        setError(null);
        setResults(null);

        getUnifiedRecommendations({ userId: TEMP_USER_ID })
            .then(setResults)
            .catch(() => setError('AI 추천 서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.'))
            .finally(() => setLoading(false));
    }

    if (checking) return <div>확인 중...</div>

    if (needsDiagnosis) {
        return (
            <div>
                <p>투자성향 진단 이력이 없어요. 먼저 진단을 받아주세요.</p>
                <button onClick={() => navigate('/mypage/diagnosis')}>진단하러 가기</button>
            </div>
        );
    }

    return (
        <div>
            <h2>추천 상품</h2>
            <button onClick={handleFetchRecommendations} disabled={loading}>
                {loading ? '추천 받는 중...' : '추천 받기'}
            </button>

            <p>
                <button type="button" onClick={() => navigate('/mypage/diagnosis')}>
                    인적사항이 바뀌었나요? 재진단하기
                </button>
            </p>

            {latestProfile && isStale(latestProfile.diagnosedAt) && (
                <p>⚠ 투자성향 진단이 {formatElapsed(latestProfile.diagnosedAt)}이에요. 재진단 후 추천받는 것을 권장해요.</p>
            )}

            {error && <p>{error}</p>}

            {results && (
                <div>
                    {results.length === 0 ? (
                        <p>추천할 수 있는 상품이 없어요.</p>
                    ) : (
                        <ul>
                            {results.map((item) => (
                                <li key={item.productId} onClick={() => navigate(`/products/${item.productId}`)}>
                                    <span>{item.productName}</span>
                                    <span> · {SOURCE_LABELS[item.source] ?? item.source}</span>
                                    <span> · 점수 {item.score?.toFixed(2)}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}

export default RecommendedProducts;