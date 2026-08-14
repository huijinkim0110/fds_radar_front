import { useEffect, useState } from "react";
import { getPortfolio, cancelSubscription } from "../../api/financialProduct/simulatedSubscriptionAPI";

const TEMP_USER_ID = 1; // 인증 붙기 전까지 임시 고정값

function SimulatedSubscriptionList() {
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cancellingId, setCancellingId] = useState(null);

    function loadPortfolio() {
        setLoading(true);
        setError(null);
        getPortfolio(TEMP_USER_ID)
            .then((data) => setSubscriptions(data))
            .catch(() => setError('가입 내역을 불러오지 못했습니다.'))
            .finally(() => setLoading(false));
    }

    useEffect(() => {
        loadPortfolio();
    }, []);

    function handleCancel(id) {
        if (!window.confirm('이 상품의 모의가입을 해지하시겠습니까?')) return;

        setCancellingId(id);
        cancelSubscription(id)
            .then(() => {
                setSubscriptions((prev) => prev.filter((s) => s.simulatedSubscriptionId !== id));
            })
            .catch(() => alert('해지에 실패했습니다.'))
            .finally(() => setCancellingId(null));
    }

    if (loading) return <div>불러오는 중...</div>
    if (error) return <div>{error}</div>;

    const totalMaturity = subscriptions.reduce((sum, s) => sum + (s.expectedMaturityAmount ?? 0), 0);

    return (
        <div>
            <h2>나의 모의가입 포트폴리오</h2>

            {subscriptions.length === 0 ? (
                <div>모의가입한 상품이 없습니다.</div>
            ) : (
                <>
                    <p>예상 만기금액 합계 : {totalMaturity.toLocaleString()}원</p>
                    <div>
                        {subscriptions.map((s) => {
                            <div key={s.simulatedSubscriptionId}>
                                <h3>{s.productName}</h3>
                                <p>가입금액: {s.subscriptionAmount?.toLocaleString()}원</p>
                                {s.monthlyPayment != null && (
                                    <p>월 납입액: {s.monthlyPayment.toLocaleString()}원</p>
                                )}
                                <p>가입기간: {s.subscriptionPeriod}개월</p>
                                <p>예상 만기금액: {s.expectedMaturityAmount?.toLocaleString()}원</p>
                                <p>가입일: {s.subscribedAt?.slice(0, 10)}</p>
                                <button
                                    onClick={() => handleCancel(s.simulatedSubscriptionId)}
                                    disabled={cancellingId === s.simulatedSubscriptionId}
                                >
                                    {cancellingId === s.simulatedSubscriptionId ? '해지 중...' : '해지'}
                                </button>
                            </div>
                        })}
                    </div>
                </>
            )}
        </div>
    );
}

export default SimulatedSubscriptionList;