import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRecentProfiles } from "../../api/finance/investmentProfileAPI";
import { getUnifiedRecommendations, getRecommendationHistory, getRecommendationHistoryItems } from "../../api/recommendation/recommendationAPI";
import { 
    RISK_TENDENCY_LABELS,
    INVESTMENT_EXPERIENCE_LABELS,
    LOSS_TOLERANCE_LABELS,
    PREFERRED_PERIOD_LABELS
} from "../../constants/finance/investmentProfileLabels";
import { isStale, formatElapsed } from "../../utils/staleness";
import TopBar from "../TopBar";
import Panel from "../Panel";
import RecommendedProducts from "../mypage/RecommendedProducts";

const TEMP_USER_ID = 1; // 인증 붙기 전까지 임시 고정값

export default function DiagnosisResults() {
    const navigate = useNavigate();

    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 진단 카드별 추천 펼침 상태 - 한 번에 하나의 카드만 펼쳐짐(아코디언)
    const [expandedProfileId, setExpandedProfileId] = useState(null);
    const [recLoading, setRecLoading] = useState(false);
    const [recResults, setRecResults] = useState(null);
    const [goalMissing, setGoalMissing] = useState(false);
    // 유저의 전체 추천 이력(모든 진단 시점 포함) - 한 번만 불러와서 진단별로 필터링하여 사용
    const [recHistory, setRecHistory] = useState(null);

    useEffect(() => {
        getRecentProfiles(TEMP_USER_ID)
            .then(setProfiles)
            .catch(() => setError('진단 이력을 불러오지 못했습니다.'))
            .finally(() => setLoading(false));
    }, []);

    // 전체 추천 이력을 한 번만 불러옴(모든 진단 시점 것 포함)
    function ensureRecHistoryLoaded() {
        if (recHistory !== null) return; // 이미 불러왔으면 재요청 안함
        getRecommendationHistory(TEMP_USER_ID)
            .then(setRecHistory)
            .catch(() => setRecHistory([]));
    }
    
    // 특정 진단 카드 펼치기/접기
    function handleToggleExpand(investmentProfileId) {
        if (expandedProfileId === investmentProfileId) {
            setExpandedProfileId(null);
            setRecResults(null);
            return;
        }
        setExpandedProfileId(investmentProfileId);
        setRecResults(null);
        ensureRecHistoryLoaded();
    }

    // recHistory가 로드되면, 펼쳐진 카드에 해당하는 진단 기준 추천 이력을 필터링해서 최신 것 표시
    useEffect(() => {
        if (expandedProfileId === null || recHistory === null) return;

        const matched = recHistory.filter(
            (h) => h.investmentProfile?.investmentProfileId === expandedProfileId
        );

        if (matched.length > 0) {
            loadRecHistoryItems(matched[0].recommendationResultId);
        } else {
            setRecResults(null); // 이 진단 기준으로 받은 추천 이력이 아직 없음
        }
    }, [expandedProfileId, recHistory]);

    // 특정 추천 이력의 상품 목록을 불러와 결과 화면에 표시
    function loadRecHistoryItems(recommendationResultId) {
        getRecommendationHistoryItems(recommendationResultId).then((items) => {
            setRecResults(items.map((i) => ({
                productId: i.product.productId,
                productName: i.product.productName,
                score: i.suitabilityScore,
            })));
        });
    }

    // 새로 추천받기(최신 진단 카드에서만 호출됨)
    function handleFetchRecommendations() {
        setRecLoading(true);
        setRecResults(null);

        getUnifiedRecommendations({ userId: TEMP_USER_ID })
            .then((data) => {
                setRecResults(data.results);
                setGoalMissing(data.goalMissing);
                setRecHistory(null); // 다음에 펼칠 때 새로 불러오도록 캐시 초기화
            })
            .catch(() => alert('AI 추천 서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.'))
            .finally(() => setRecLoading(false));
    }

    if (loading) {
        return (
            <div style={{ padding: "50px 0", textAlign: "center", color: "var(--muted)", fontSize: "14px" }}>
                진단 결과를 불러오는 중...
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: "30px", textAlign: "center", color: "#ef4444", fontSize: "13px" }}>
                {error}
            </div>
        );
    }

    // 진단 이력이 없는 경우
    if (profiles.length === 0) {
        return (
            <>
                <TopBar title="투자성향 진단 결과" crumb="홈 / 금융 / 진단·추천 결과" search={false} />
                <Panel title="진단 이력 없음" sub="아직 진행된 투자성향 진단 내역이 없습니다.">
                    <div style={{ padding: "40px 20px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
                        <div style={{ fontSize: "14px", color: "var(--muted)" }}>
                            아직 진단 이력이 없어요. 지금 바로 진단하고 나에게 맞는 투자 성향을 확인해보세요!
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

    const latest = profiles[0];

    return (
        <>
            <TopBar title="투자성향 진단 결과" crumb="홈 / 금융 / 진단 결과" search={false} />

            {/* 상단 안내 및 재진단 액션 영역 */}
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
                        나의 투자 성향 기록
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--muted)" }}>
                        그동안 진행했던 투자성향 진단 결과와 세부 성향 변화를 확인할 수 있습니다.
                    </div>
                </div>
                <button
                    type="button"
                    className="minibtn"
                    onClick={() => navigate('/investment-diagnosis')}
                    style={{ background: "var(--blue)", color: "#fff", borderColor: "var(--blue)", padding: "8px 16px" }}
                >
                    🔄 재진단하기
                </button>
            </div>

            {/* 최신 진단 주기 경고 메시지 */}
            {isStale(latest.diagnosedAt) && (
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
                    ⚠ 가장 최근 진단이 {formatElapsed(latest.diagnosedAt)}이에요. 정확한 금융 상품 추천을 위해 재진단을 권장해요.
                </div>
            )}

            {/* 진단 결과 카드 리스트 영역 */}
            <Panel title="진단 이력 목록" sub="역대 진단받은 상세 내역 카드입니다.">
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {profiles.map((profile, index) => (
                        <div
                            key={profile.investmentProfileId}
                            style={{
                                padding: "20px 24px",
                                borderRadius: "12px",
                                border: index === 0 ? "1.5px solid var(--blue)" : "1px solid var(--line)",
                                background: "var(--panel2)",
                                display: "flex",
                                flexDirection: "column",
                                gap: "16px",
                            }}
                        >
                            {/* 카드 헤더 (날짜, 최신 뱃지, 점수) */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div 
                                    style={{ display: "flex", gap: "8px", alignItems: "center", cursor: "pointer" }}
                                    onClick={() => handleToggleExpand(profile.investmentProfileId)}
                                >
                                    <span style={{ fontSize: "15px", fontWeight: "700", color: "var(--ink)", textDecoration: "underline" }}>
                                        {profile.diagnosedAt?.slice(0, 10)} 진단
                                    </span>
                                    {index === 0 && (
                                        <span
                                            style={{
                                                fontSize: "11px",
                                                fontWeight: "700",
                                                padding: "2px 8px",
                                                borderRadius: "4px",
                                                background: "var(--blue)",
                                                color: "#fff",
                                            }}
                                        >
                                            최신
                                        </span>
                                    )}
                                    <span style={{ fontSize: "12px", color: "var(--muted)"}}>
                                        {expandedProfileId === profile.investmentProfileId ? '▲ 추천상품 접기' : '▼ 추천상품 보기'}
                                    </span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                    <span style={{ fontSize: "12px", color: "var(--muted)" }}>진단 점수</span>
                                    <span style={{ fontSize: "15px", fontWeight: "700", color: "var(--blue)" }}>
                                        {profile.diagnosisScore}점
                                    </span>
                                </div>
                            </div>

                            {/* 세부 정보 그리드 (가독성 향상) */}
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                                    gap: "12px 20px",
                                    paddingTop: "14px",
                                    borderTop: "1px solid var(--line)",
                                }}
                            >
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                                    <span style={{ color: "var(--muted)" }}>투자성향</span>
                                    <strong style={{ color: "var(--ink)" }}>{RISK_TENDENCY_LABELS[profile.riskTendency]}</strong>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                                    <span style={{ color: "var(--muted)" }}>투자경험</span>
                                    <strong style={{ color: "var(--ink)" }}>{INVESTMENT_EXPERIENCE_LABELS[profile.investmentExperience]}</strong>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                                    <span style={{ color: "var(--muted)" }}>손실감내수준</span>
                                    <strong style={{ color: "var(--ink)" }}>{LOSS_TOLERANCE_LABELS[profile.lossTolerance]}</strong>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                                    <span style={{ color: "var(--muted)" }}>선호 투자기간</span>
                                    <strong style={{ color: "var(--ink)" }}>{PREFERRED_PERIOD_LABELS[profile.preferredPeriod]}</strong>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                                    <span style={{ color: "var(--muted)" }}>원금보장 선호</span>
                                    <strong style={{ color: "var(--ink)" }}>{profile.principalProtectionPreference ? '필요' : '불필요'}</strong>
                                </div>
                            </div>

                            {/* 추천 상품 펼침 영역 */}
                            {expandedProfileId === profile.investmentProfileId && (
                                <div style={{ paddingTop: "14px", borderTop: "1px solid var(--line)" }}>
                                    {index === 0 && (
                                        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "12px" }}>
                                            <button
                                                type="button"
                                                className="minibtn"
                                                onClick={handleFetchRecommendations}
                                                disabled={recLoading}
                                                style={{ background: "var(--blue)", color: "#fff", borderColor: "var(--blue)", padding: "8px 16px" }}
                                            >
                                                {recLoading ? '추천 받는 중...' : '✨ 새로 추천 받기'}
                                            </button>
                                        </div>
                                    )}

                                    {index === 0 && goalMissing && (
                                        <p style={{ fontSize: "12px", color: "#f59e0b", marginBottom: "12px"}}>
                                             ⚠ 설정된 재무목표가 없어서 추천 정확도가 떨어질 수 있어요.{' '}
                                             <button type="button" onClick={() => navigate('/mypage/financial-goals')}>재무목표 등록하기</button>
                                        </p>
                                    )}

                                    {index !== 0 && recResults === null && (
                                        <div style={{ fontSize: "13px", color: "var(--muted)", textAlign: "center", padding: "20px 0"}}>
                                            이 진단 시점에 받은 추천 이력이 없어요.
                                        </div>
                                    )}

                                    <RecommendedProducts results={recResults} />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </Panel>
        </>
    );
}