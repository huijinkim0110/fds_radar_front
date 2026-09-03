import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRecentProfiles } from "../../api/finance/investmentProfileAPI";
import { 
    RISK_TENDENCY_LABELS,
    INVESTMENT_EXPERIENCE_LABELS,
    LOSS_TOLERANCE_LABELS,
    PREFERRED_PERIOD_LABELS
} from "../../constants/finance/investmentProfileLabels";
import { isStale, formatElapsed } from "../../utils/staleness";
import TopBar from "../TopBar";
import Panel from "../Panel";

const TEMP_USER_ID = 1; // 인증 붙기 전까지 임시 고정값

export default function DiagnosisResults() {
    const navigate = useNavigate();

    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        getRecentProfiles(TEMP_USER_ID)
            .then(setProfiles)
            .catch(() => setError('진단 이력을 불러오지 못했습니다.'))
            .finally(() => setLoading(false));
    }, []);

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
                <TopBar title="투자성향 진단 결과" crumb="홈 / 금융 / 진단 결과" search={false} />
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
                                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                    <span style={{ fontSize: "15px", fontWeight: "700", color: "var(--ink)" }}>
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
                        </div>
                    ))}
                </div>
            </Panel>
        </>
    );
}