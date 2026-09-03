import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { subscribe } from '../../api/financialProduct/simulatedSubscriptionAPI';
import { getMyAccounts } from '../../account/accountAPI';
import { getGoals } from '../../api/finance/financialGoalsAPI';

// 적금(SAVINGS)은 subscriptionAmount를 "월 납입액"으로, 그 외 상품은 "일시납 총액"으로
function SubscribeForm({ userId, product }) {
    const navigate = useNavigate();
    const isInstallment = product.productType === 'SAVINGS';

    const [accounts, setAccounts] = useState([]);
    const [accountsLoading, setAccountsLoading] = useState(true);
    const [accountId, setAccountId] = useState('');

    const [goals, setGoals] = useState([]);
    const [goalId, setGoalId] = useState(''); // 선택사항 - 빈 문자열이면 미연동

    const [amount, setAmount] = useState('');
    const [period, setPeriod] = useState(product.subscriptionPeriod ?? '');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);

    useEffect(() => {
        getMyAccounts(userId)
            .then((list) => {
                setAccounts(list);
                if (list.length > 0) setAccountId(String(list[0].id));
            })
            .catch(() => setError('계좌 목록을 불러오지 못했습니다.'))
            .finally(() => setAccountsLoading(false));

        getGoals(userId)
            .then((list) => setGoals(list.filter((g) => g.goalStatus === 'IN_PROGRESS')))
            .catch(() => {}); // 목표는 선택사항이라 실패해도 가입 자체는 막지 않음
    }, [userId]);

    function handleSubmit(e) {
        e.preventDefault();
        setError(null);

        if (!accountId) {
            setError('출금할 계좌를 선택해주세요.');
            return;
        }

        const amountValue = Number(amount);
        const periodValue = Number(period);

        if (!amountValue || amountValue <= 0) {
            setError('가입금액을 입력해주세요.');
            return;
        }
        if (!periodValue || periodValue <= 0) {
            setError('가입기간을 입력해주세요.');
            return;
        }
        if (product.minAmount != null && amountValue < product.minAmount) {
            setError(`최소 가입금액은 ${product.minAmount.toLocaleString()}원입니다.`);
            return;
        }
        if (product.maxAmount != null && amountValue > product.maxAmount) {
            setError(`최대 가입금액은 ${product.maxAmount.toLocaleString()}원입니다.`);
            return;
        }

        const selectedAccount = accounts.find((a) => String(a.id) === accountId);
        if (selectedAccount && selectedAccount.balance < amountValue) {
            setError('선택한 계좌의 잔액이 부족합니다.');
            return;
        }

        setSubmitting(true);
        subscribe({
            userId,
            productId: product.productId,
            accountId: Number(accountId),
            goalId: goalId ? Number(goalId) : null,
            subscriptionAmount: amountValue,
            subscriptionPeriod: periodValue
        })
            .then((data) => setResult(data))
            .catch((err) => setError(err.response?.data?.message ?? '모의가입에 실패했습니다.'))
            .finally(() => setSubmitting(false));
    }

    if (result) {
        return (
            <div>
                <p>모의가입이 완료되었습니다.</p>
                <dl>
                    <dt>출금 계좌</dt>
                    <dd>{result.accountNumber}</dd>

                    <dt>가입금액</dt>
                    <dd>{result.subscriptionAmount?.toLocaleString()}원</dd>

                    {result.monthlyPayment != null && (
                        <>
                            <dt>월 납입액</dt>
                            <dd>{result.monthlyPayment.toLocaleString()}원</dd>
                        </>
                    )}
                    
                    <dt>가입기간</dt>
                    <dd>{result.subscriptionPeriod}개월</dd>

                    <dt>예상 만기금액</dt>
                    <dd>{result.expectedMaturityAmount?.toLocaleString()}원</dd>

                    <dt>첫 출금액</dt>
                    <dd>{result.paidAmount?.toLocaleString()}원</dd>

                    {result.goalName && (
                        <>
                            <dt>연결된 목표</dt>
                            <dd>{result.goalName}</dd>
                        </>
                    )}
                </dl>
                <button onClick={() => navigate('/mypage/portfolio')}>내 모의가입 목록 보기</button>
                <button onClick={() => setResult(null)}>다시 가입하기</button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>
                    출금 계좌
                    {accountsLoading ? (
                        <span>계좌 불러오는 중...</span>
                    ) : accounts.length === 0 ? (
                        <span>등록된 계좌가 없습니다. 계좌를 먼저 개설해주세요.</span>
                    ) : (
                        <select value={accountId} onChange={(e) => setAccountId(e.target.value)}>
                            {accounts.map((a) => (
                                <option key={a.id} value={a.id}>
                                    {a.accountName ?? a.accountNumber} ({a.balance?.toLocaleString()}원)
                                </option>
                            ))}
                        </select>
                    )}
                </label>
            </div>

            <div>
                <label>
                    {isInstallment ? '월 납입액' : '가입금액'} (원)
                    <input 
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        min={product.minAmount ?? undefined}
                        max={product.maxAmount ?? undefined}
                    />
                </label>
            </div>

            <div>
                <label>
                    가입기간(개월)
                    <input 
                        type="number"
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        min={1}
                    />
                </label>
            </div>

            {goals.length > 0 && (
                <div>
                    <label>
                        연결할 재무목표 (선택)
                        <select value={goalId} onChange={(e) => setGoalId(e.target.value)}>
                            <option value="">연결 안 함</option>
                            {goals.map((g) => (
                                <option key={g.goalId} value={g.goalId}>
                                    {g.goalName} ({g.achievementRate}& 달성중)
                                </option>
                            ))}
                        </select>
                    </label>
                    <p>연결하면 이 가입에서 실제로 빠져나가는 금액이 목표 달성률에 자동 반영돼요.</p>
                </div>
            )}

            {error && <p>{error}</p>}

            <button type="submit" disabled={submitting || accounts.length === 0}>
                {submitting ? '가입 처리 중...' : '모의가입 신청'}
            </button>
        </form>
    );
}

export default SubscribeForm;