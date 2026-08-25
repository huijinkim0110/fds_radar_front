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

const TEMP_USER_ID = 1; // 인증 붙기 전까지 임시 고정값

function DiagnosisResults() {
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

    if (loading) return <div>불러오는 중...</div>
    if (error) return <div>{error}</div>

    if (profiles.length === 0) {
        return (
            <div>
                <p>아직 진단 이력이 없어요.</p>
                <button onClick={() => navigate('/mypage/diagnosis')}>진단하러 가기</button>
            </div>
        );
    }

    const latest = profiles[0];

    return (
        <div>
            <h2>진단 결과</h2>

            {isStale(latest.diagnosedAt) && (
                <p>⚠ 가장 최근 진단이 {formatElapsed(latest.diagnosedAt)}이에요. 재진단을 권장해요.</p>
            )}
            <button onClick={() => navigate('/mypage/diagnosis')}>재진단하기</button>

            <div>
                {profiles.map((profile) => (
                    <div key={profile.investmentProfileId}>
                        <h3>{profile.diagnosedAt?.slice(0, 10)} 진단</h3>
                        <p>투자성향: {RISK_TENDENCY_LABELS[profile.riskTendency]}</p>
                        <p>투자경험: {INVESTMENT_EXPERIENCE_LABELS[profile.investmentExperience]}</p>
                        <p>손실감내수준: {LOSS_TOLERANCE_LABELS[profile.lossTolerance]}</p>
                        <p>선호 투자기간: {PREFERRED_PERIOD_LABELS[profile.preferredPeriod]}</p>
                        <p>원금보장 선호: {profile.principalProtectionPreference ? '필요' : '불필요'}</p>
                        <p>진단 점수: {profile.diagnosisScore}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default DiagnosisResults;