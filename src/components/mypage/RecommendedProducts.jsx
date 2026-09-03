import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getLatestProfile, hasDiagnosisHistory } from "../../api/finance/investmentProfileAPI";
import { getUnifiedRecommendations, getRecommendationHistory, getRecommendationHistoryItems } from "../../api/recommendation/recommendationAPI";
import { isStale, formatElapsed } from "../../utils/staleness";
import TopBar from "../TopBar";
import Panel from "../Panel";

const TEMP_USER_ID = 1;

export default function RecommendedProducts() {
    const navigate = useNavigate();

    const [checking, setChecking] = useState(true);
    const [needsDiagnosis, setNeedsDiagnosis] = useState(false);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);
    const [latestProfile, setLatestProfile] = useState(null);
    const [goalMissing, setGoalMissing] = useState(false);
    const [history, setHistory] = useState([]);

    useEffect(() => {
        hasDiagnosisHistory(TEMP_USER_ID)
            .then((has) => setNeedsDiagnosis(!has))
            .catch(() => {})
            .finally(() => setChecking(false));
    }, []);

    useEffect(() => {
        if (needsDiagnosis === false) {
            getLatestProfile(TEMP_USER_ID).then(setLatestProfile).catch(() => {});
            loadHistory();
        }
    }, [needsDiagnosis]);

    // 저장된 추천 이력 불러오기 - 가장 최근 것을 자동으로 화면에 표시
    function loadHistory() {
        getRecommendationHistory(TEMP_USER_ID)
            .then((list) => {
                setHistory(list);
                if (list.length > 0) {
                    loadHistoryItems(list[0].recommendationResultId);
                }
            })
            .catch(() => {});
    }

    // 특정 이력의 상품 목록을 불러와 결과 화면에 표시
    function loadHistoryItems(recommendationResultId) {
        getRecommendationHistoryItems(recommendationResultId).then((items) => {
            setResults(items.map((i) => ({
                productId: i.product.productId,
                productName: i.product.productName,
                score: i.suitabilityScore,
            })));
        });
    }

    function handleFetchRecommendations() {
        setLoading(true);
        setError(null);
        setResults(null);

        getUnifiedRecommendations({ userId: TEMP_USER_ID })
            .then((data) => {
                setResults(data.results);
                setGoalMissing(data.goalMissing);
                loadHistory(); // 방금 받은 결과도 이력 목록에 반영
            })
            .catch(() => setError('AI 추천 서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.'))
            .finally(() => setLoading(false));
    }

    if (checking) {
        return (
            <div style={{ padding: "50px 0", textAlign: "center", color: "var(--muted)", fontSize: "14px" }}>
                투자 성향 확인 중...
            </div>
        );
    }

    // 진단 이력이 없는 경우
    if (needsDiagnosis) {
        return (
            <>
                <TopBar title="맞춤 추천 상품" crumb="홈 / 금융 / 추천 상품" search={false} />
                <Panel title="투자성향 진단 필요" sub="맞춤형 상품을 추천해 드리기 위해 먼저 성향 진단이 필요합니다.">
                    <div style={{ padding: "40px 20px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
                        <div style={{ fontSize: "14px", color: "var(--muted)" }}>
                            아직 투자성향 진단 이력이 없어요. 지금 바로 진단하고 나에게 딱 맞는 상품을 확인해보세요!
                        </div>
                        <button
                            type="button"
                            className="minibtn"
                            onClick={() => navigate('/investment-diagnosis')}
                            style={{ padding: "10px 20px", background: "var(--blue)", color: "#fff", borderColor: "var(--blue)", fontSize: "13px" }}
                        >
                            진단하러 가기
                        </button>
                    </div>
                </Panel>
            </>
        );
    }

    return (
        <>
            <TopBar title="맞춤 추천 상품" crumb="홈 / 금융 / 추천 상품" search={false} />

            {/* 상단 가이드 및 액션 영역 */}
            <div
                style={{
                    padding: "18px 20px",
                    marginBottom: "20px",
                    border: "1px solid var(--line)",
                    borderRadius: "12px",
                    background: "var(--panel)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "12px",
                }}
            >
                <div>
                    <div style={{ fontSize: "14px", fontWeight: "700", color: "var(--ink)", marginBottom: "4px" }}>
                        AI 기반 맞춤 금융 상품 추천
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--muted)" }}>
                        회원님의 투자 성향과 프로필을 분석하여 최적의 상품을 제안해 드립니다.
                    </div>
                </div>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <button
                        type="button"
                        className="minibtn"
                        onClick={() => navigate('/investment-diagnosis')}
                        style={{ background: "var(--panel2)", color: "var(--ink)", borderColor: "var(--line)" }}
                    >
                        인적사항 변경 / 재진단
                    </button>
                    <button
                        type="button"
                        className="minibtn"
                        onClick={handleFetchRecommendations}
                        disabled={loading}
                        style={{ background: "var(--blue)", color: "#fff", borderColor: "var(--blue)", padding: "8px 16px" }}
                    >
                        {loading ? '추천 받는 중...' : '✨ 추천 받기'}
                    </button>
                </div>
            </div>

            {/* 진단 주기 경고 메시지 */}
            {latestProfile && isStale(latestProfile.diagnosedAt) && (
                <div
                    style={{
                        padding: "14px 18px",
                        marginBottom: "20px",
                        borderRadius: "10px",
                        background: "rgba(245, 158, 11, 0.1)",
                        border: "1px solid rgba(245, 158, 11, 0.3)",
                        fontSize: "12px",
                        color: "#f59e0b",
                        fontWeight: "600",
                    }}
                >
                    ⚠ 투자성향 진단이 {formatElapsed(latestProfile.diagnosedAt)}이에요. 정확한 추천을 위해 재진단 후 이용하시는 것을 권장해요.
                </div>
            )}

            {goalMissing && (
                <p>
                    ⚠ 설정된 재무목표가 없어서 추천 정확도가 떨어질 수 있어요.{' '}
                    <button type="button" onClick={() => navigate('/mypage/financial-goals')}>재무목표 등록하기</button>
                </p>
            )}

            {/* 에러 메시지 */}
            {error && (
                <div style={{ padding: "14px", marginBottom: "20px", borderRadius: "10px", background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", fontSize: "12px", textAlign: "center" }}>
                    {error}
                </div>
            )}

            {/* 추천 결과 영역 */}
            <Panel title="추천 결과 리스트" sub="분석 완료된 맞춤 상품 목록입니다.">
                {!results ? (
                    <div style={{ padding: "60px 0", textAlign: "center", color: "var(--muted)", fontSize: "13px" }}>
                        상단 우측의 <strong>'추천 받기'</strong> 버튼을 눌러 상품을 확인해보세요!
                    </div>
                ) : results.length === 0 ? (
                    <div style={{ padding: "50px 0", textAlign: "center", color: "var(--muted)", fontSize: "13px" }}>
                        현재 조건에 맞는 추천 상품이 없어요.
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {results.map((item) => (
                            <div
                                key={item.productId}
                                onClick={() => navigate(`/products/${item.productId}`)}
                                style={{
                                    padding: "16px 20px",
                                    borderRadius: "10px",
                                    border: "1px solid var(--line)",
                                    background: "var(--panel2)",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    cursor: "pointer",
                                    transition: "all 0.2s ease",
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--blue)")}
                                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--line)")}
                            >
                                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                    <div style={{ fontSize: "15px", fontWeight: "700", color: "var(--ink)" }}>
                                        {item.productName}
                                    </div>
                                </div>

                                <div style={{ textAlign: "right" }}>
                                    <div style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "2px" }}>매칭 점수</div>
                                    <div style={{ fontSize: "15px", fontWeight: "700", color: "var(--blue)" }}>
                                        {item.score?.toFixed(2)}점
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Panel>

            {history.length > 1 && (
                <Panel title="이전 추천 이력" sub="지난번에 받았던 추천 결과를 다시 볼 수 있어요.">
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {history.slice(1).map((h) => (
                            <div
                                key={h.recommendationResultId}
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    padding: "10px 14px",
                                    borderRadius: "8px",
                                    border: "1px solid var(--line)",
                                }}
                            >
                                <span style={{ fontSize: "13px", color: "var(--muted)"}}>
                                    {h.requestedAt?.slice(0, 10)} 추천
                                </span>
                                <button
                                    type="button"
                                    className="minibtn"
                                    onClick={() => loadHistoryItems(h.recommendationResultId)}
                                >
                                    다시 보기
                                </button>
                            </div>
                        ))}
                    </div>
                </Panel>
            )}
        </>
    );
}