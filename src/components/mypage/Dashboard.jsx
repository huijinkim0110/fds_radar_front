import { useEffect, useState } from "react";
import { getFavorites } from "../../api/financialProduct/favoriteProductAPI";
import { getPortfolio } from "../../api/financialProduct/simulatedSubscriptionAPI";
import { getLatestProfile, hasDiagnosisHistory } from "../../api/finance/investmentProfileAPI";
import { getFinancialProfile, hasFinancialProfile } from "../../api/finance/financialProfileAPI";
import { isStale, formatElapsed } from "../../utils/staleness";

const TEMP_USER_ID = 1;

const RISK_TENDENCY_LABELS = {
    STABLE: '안정형', 
    NEUTRAL: '중립형',
    ACTIVE: '적극형',
    AGGRESSIVE: '공격형'
};

function Dashboard() {
    const [favoriteCount, setFavoriteCount] = useState(null);
    const [activeSubscriptionCount, setActiveSubscriptionCount] = useState(null);
    const [latestProfile, setLatestProfile] = useState(null);
    const [hasDiagnosis, setHasDiagnosis] = useState(null);
    const [financialProfile, setFinancialProfile] = useState(null);
    const [hasFinProfile, setHasFinProfile] = useState(null);

    useEffect(() => {
        getFavorites(TEMP_USER_ID)
            .then((list) => setFavoriteCount(list.length))
            .catch(() => {});

        getPortfolio(TEMP_USER_ID)
            .then((list) => setActiveSubscriptionCount(list.filter((s) => s.subscriptionStatus === 'ACTIVE').length))
            .catch(() => {})

        hasDiagnosisHistory(TEMP_USER_ID)
            .then(setHasDiagnosis)
            .catch(() => {});

        hasFinancialProfile(TEMP_USER_ID)
            .then(setHasFinProfile)
            .catch(() => {});
    }, []);

    useEffect(() => {
        if (hasDiagnosis) {
            getLatestProfile(TEMP_USER_ID).then(setLatestProfile).catch(() => {});
        }
    }, [hasDiagnosis]);

    useEffect(() => {
        if (hasFinProfile) {
            getFinancialProfile(TEMP_USER_ID).then(setFinancialProfile).catch(() => {});
        }
    }, [hasFinProfile]);

    // 오래된 데이터 안내 배너용 항목 모으기
    const staleNotices = [];
    if (latestProfile && isStale(latestProfile.diagnosedAt)) {
        staleNotices.push(`투자성향 진단이 ${formatElapsed(latestProfile.diagnosedAt)}이에요. 재진단을 권장해요.`);
    }
    if (financialProfile && isStale(financialProfile.updatedAt ?? financialProfile.createdAt)) {
        staleNotices.push(`재무 프로필을 ${formatElapsed(financialProfile.updatedAt ?? financialProfile.createdAt)} 수정 안했어요. 업데이트를 권장해요.`);
    }

    return (
        <div>
            <h2>대시보드</h2>

            {/* 오래된 데이터 안내 */}
            {staleNotices.length > 0 && (
                <section>
                    {staleNotices.map((msg, i) => (
                        <p key={i}>⚠ {msg}</p>
                    ))}
                </section>
            )}

            {/* 계좌·카드 */}
            <section>
                <h3>계좌·카드</h3>
                <p>준비 중입니다.</p>
            </section>

            {/* 보안·신고 */}
            <section>
                <h3>보안·신고</h3>
                <p>준비 중입니다.</p>
            </section>

            {/* 자산관리 */}
            <section>
                <h3>자산관리</h3>
                <p>준비 중입니다.</p>
            </section>

            {/* 나의 상품 */}
            <section>
                <h3>가입한 상품</h3>
                <p>{activeSubscriptionCount === null ? '불러오는 중...' : `${activeSubscriptionCount}건 가입중`}</p>
            </section>

            <section>
                <h3>관심상품</h3>
                <p>{favoriteCount === null ? '불러오는 중...' : `${favoriteCount}건 등록됨`}</p>
            </section>

            {/* 내 투자성향 */}
            <section>
                <h3>투자성향</h3>
                {hasDiagnosis === false && <p>아직 진단 이력이 없어요.</p>}
                {latestProfile && (
                    <p>최근 진단 결과: {RISK_TENDENCY_LABELS[latestProfile.riskTendency]}</p>
                )}
            </section>

            {/* 재무목표 */}
            <section>
                <h3>재무목표</h3>
                <p>준비 중입니다.</p>
            </section>

            {/* 내 정보 */}
            <section>
                <h3>내 정보</h3>
                <p>준비 중입니다.</p>
            </section>
        </div>
    );
}

export default Dashboard;