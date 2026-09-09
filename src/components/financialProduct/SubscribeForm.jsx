import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { subscribe } from '../../api/financialProduct/simulatedSubscriptionAPI';
import { getMyAccounts } from '../../account/accountAPI';
import { getGoals } from '../../api/finance/financialGoalsAPI';

// 백엔드 ALLOWED_METHODS와 반드시 동일하게 유지할 것
const ALLOWED_METHODS = {
    DEPOSIT: ['LUMP_SUM'],
    SAVINGS: ['INSTALLMENT'],
    BOND: ['LUMP_SUM'],
    FUND: ['LUMP_SUM', 'INSTALLMENT', 'MIXED'],
    INSURANCE: ['LUMP_SUM', 'INSTALLMENT', 'MIXED'],
    OTHER_PRODUCT: ['LUMP_SUM'],
};

const METHOD_LABELS = {
    LUMP_SUM: '일시납',
    INSTALLMENT: '월납', 
    MIXED: '혼합(일시납+월납)',
};

export default function SubscribeForm({ userId, product, onCancel }) {
    const navigate = useNavigate();
    const allowedMethods = ALLOWED_METHODS[product.productType] ?? ['LUMP_SUM'];

    const [accounts, setAccounts] = useState([]);
    const [accountsLoading, setAccountsLoading] = useState(true);
    const [accountId, setAccountId] = useState('');

    const [goals, setGoals] = useState([]);
    const [goalId, setGoalId] = useState(''); // 선택사항 - 빈 문자열이면 미연동

    const [paymentMethod, setPaymentMethod] = useState(allowedMethods[0]);
    const [initialAmount, setInitialAmount] = useState('');
    const [monthlyPayment, setMonthlyPayment] = useState('');
    const [period, setPeriod] = useState(product.subscriptionPeriod ?? '');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);

    const needsInitial = paymentMethod === 'LUMP_SUM' || paymentMethod === 'MIXED';
    const needsMonthly = paymentMethod === 'INSTALLMENT' || paymentMethod === 'MIXED';

    useEffect(() => {
        getMyAccounts(userId)
            .then((list) => {
                const withdrawable = list.filter((a) => a.accountType === 'CHECKING');
                setAccounts(withdrawable);
                const firstActive = withdrawable.find((a) => a.status === 'ACTIVE');
                if (firstActive) setAccountId(String(firstActive.id));
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
        
        const initialValue = needsInitial ? Number(initialAmount) : 0;
        const monthlyValue = needsMonthly ? Number(monthlyPayment) : 0;

        if (needsInitial && (!initialValue || initialValue <= 0)) {
            setError('일시납 초기금액을 입력해주세요.');
            return;
        }
        if (needsMonthly && (!monthlyValue || monthlyValue <= 0)) {
            setError('월 납입액을 입력해주세요.');
            return;
        }

        const totalAmount = initialValue + monthlyValue * periodValue;
        if (product.minAmount != null && totalAmount < product.minAmount) {
            setError(`최소 가입금액은 ${product.minAmount.toLocaleString()}원입니다.`);
            return;
        }
        if (product.maxAmount != null && totalAmount > product.maxAmount) {
            setError(`최대 가입금액은 ${product.maxAmount.toLocaleString()}원입니다.`);
            return;
        }

        const selectedAccount = accounts.find((a) => String(a.id) === accountId);

        if (selectedAccount && selectedAccount.status !== 'ACTIVE') {
            setError('사용 정지되었거나 해지된 계좌는 선택할 수 없습니다.');
            return;
        }
        if (selectedAccount && selectedAccount.balance < initialValue + monthlyValue) {
            setError('선택한 계좌의 잔액이 부족합니다.');
            return;
        }

        setSubmitting(true);
        subscribe({
            userId,
            productId: product.productId,
            accountId: Number(accountId),
            goalId: goalId ? Number(goalId) : null,
            paymentMethod,
            initialAmount: needsInitial ? initialValue : null,
            monthlyPayment: needsMonthly ? monthlyValue: null,
            subscriptionPeriod: periodValue
        })
            .then((data) => setResult(data))
            .catch((err) => setError(err.response?.data?.message ?? '모의가입에 실패했습니다.'))
            .finally(() => setSubmitting(false));
    }

    if (result) {
        return (
            <div style={styles.resultWrap}>
                <div style={styles.resultBadge}>✓</div>
                <div style={styles.resultTitle}>모의가입이 완료되었습니다.</div>

                <div style={styles.resultGrid}>
                    <InfoRow label="출금 계좌" value={result.accountNumber} />
                    {result.initialAmount != null && (
                        <InfoRow label="일시납 초기금액" value={`${result.initialAmount.toLocaleString()}원`} />
                    )}
                    {result.monthlyPayment != null && (
                        <InfoRow
                            label="월 납입액"
                            value={`${result.monthlyPayment.toLocaleString()}원`}
                        />
                    )}
                    <InfoRow label="가입기간" value={`${result.subscriptionPeriod}개월`}/>
                    <InfoRow label="예상 만기금액" value={`${result.expectedMaturityAmount?.toLocaleString()}원`} highlight/> 
                    <InfoRow label="첫 출금액" value={`${result.paidAmount?.toLocaleString()}원`} />
                    {result.goalName && (
                        <InfoRow label="연결된 목표" value={result.goalName} />
                    )}
                </div>

                <div style={styles.resultActions}>
                    <button style={styles.primaryButton} onClick={() => navigate('/mypage/portfolio')}>
                        내 모의가입 목록 보기
                    </button>
                    <button style={styles.secondaryButton} onClick={() => setResult(null)}>
                        다시 가입하기
                    </button>
                </div>
            </div>
        );
    }

    return (

        <form onSubmit={handleSubmit} style={styles.form}>
            <label style={styles.field}>
                <span style={styles.fieldLabel}>출금 계좌</span>
                {accountsLoading ? (
                    <span>계좌 불러오는 중...</span>
                ) : accounts.length === 0 ? (
                    <span>등록된 계좌가 없습니다. 계좌를 먼저 개설해주세요.</span>
                ) : (
                    <select
                        style={styles.input}
                        value={accountId}
                        onChange={(e) => setAccountId(e.target.value)}
                    >
                        {accounts.map((a) => {
                            const disabled = a.status !== 'ACTIVE';
                            const statusLabel = 
                                a.status === 'ACCOUNT_BLOCKED' ? ' (사용 정지)' :
                                a.status === 'CLOSED' ? ' (해지됨)' : '';
                            return (
                                <option key={a.id} value={a.id} disabled={disabled}>
                                    {a.accountName ? `${a.accountName} (${a.accountNumber})` : a.accountNumber}{statusLabel}
                                </option>
                            );
                        })}
                    </select>
                )}
            </label>

            <div style={styles.formGrid}>
                {allowedMethods.length > 1 && (
                    <label style={styles.field}>
                        <span style={styles.fieldLabel}>결제 방식</span>
                        <select
                            style={styles.input}
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                        >
                            {allowedMethods.map((m) => (
                                <option key={m} value={m}>{METHODS_LABELS[m]}</option>
                            ))}
                        </select>
                    </label>
                )}

                {needsInitial && (
                    <label style={styles.field}>
                        <span style={styles.fieldLabel}>일시납 초기금액(원)</span>
                        <input 
                            style={styles.input}
                            type="number"
                            value={initialAmount}
                            onChange={(e) => setInitialAmount(e.target.value)}
                        />
                    </label>
                )}

                {needsMonthly && (
                    <label style={styles.field}>
                        <span style={styles.fieldLabel}>월 납입액(원)</span>
                        <input 
                            style={styles.input}
                            type="number"
                            value={monthlyPayment}
                            onChange={(e) => setMonthlyPayment(e.target.value)}
                        />
                    </label>
                )}

                <label style={styles.field}>
                    <span style={styles.fieldLabel}>가입기간(개월)</span>
                    <input
                        style={styles.input}
                        type="number"
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        min={1}
                    />
                </label>
            </div>

            {goals.length > 0 && (
                <div style={styles.field}>
                    <label style={styles.field}>
                        <span style={styles.fieldLabel}>연결할 재무목표(선택)</span>
                        <select
                            style={styles.input}
                            value={goalId}
                            onChange={(e) => setGoalId(e.target.value)}
                        >
                            <option value="">연결 안 함</option>
                            {goals.map((g) => (
                                <option key={g.goalId} value={g.goalId}>
                                    {g.goalName} ({g.achievementRate}% 달성중)
                                </option>
                            ))}
                        </select>
                    </label>
                    <p style={styles.fieldLabel}>
                        연결하면 이 가입에서 빠져나가는 금액이 목표 달성률에 자동 반영돼요.
                    </p>
                </div>
            )}

            {error && <p style={styles.errorBox}>{error}</p>}
            <div style={styles.buttonRow}>
                <button
                    type="submit"
                    style={styles.submitButton}
                    disabled={submitting || accounts.length === 0}
                >
                    {submitting ? '가입 처리 중...' : '모의가입 신청'}
                </button>
                {onCancel && (
                    <button type="button" style={styles.secondaryButton} onClick={onCancel}>
                        취소
                    </button>
                )}
            </div>
        </form>
    );
}

function InfoRow({ label, value, highlight = false }) {
    return (
        <div style={styles.infoRow}>
            <span style={styles.infoLabel}>{label}</span>
            <span
                style={{
                    ...styles.infoValue,
                    color: highlight ? 'var(--blue)' : 'var(--ink)',
                    fontSize: highlight ? '16px' : '13px',
                }}
            >
                {value}
            </span>
        </div>
    );
}

const styles = {
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
    },
    formGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '18px',
    },
    field: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
    },
    fieldLabel: {
        fontSize: '13px',
        color: 'var(--muted)',
        fontWeight: 600,
    },
    input: {
        width: '100%',
        padding: '9px 12px',
        border: '1px solid var(--line)',
        borderRadius: '8px',
        fontSize: '14px',
        color: 'var(--ink)',
        background: '#fff',
        boxSizing: 'border-box',
        fontFamily: 'inherit',
    },
    errorBox: {
        padding: '10px 14px',
        borderRadius: '8px',
        background: 'rgba(239, 68, 68, 0.08)',
        border: '1px solid rgba(239, 68, 68, 0.25)',
        color: '#ef4444',
        fontSize: '13px',
        fontWeight: 600,
    },
    submitButton: {
        alignSelf: 'flex-start',
        padding: '10px 22px',
        border: 'none',
        borderRadius: '9px',
        background: 'var(--blue)',
        color: '#fff',
        fontSize: '14px',
        fontWeight: 700,
        cursor: 'pointer',
    },
    buttonRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '8px',
    },
    resultWrap: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        padding: '12px 0 4px',
    },
    resultBadge: {
        width: '44px',
        height: '44px',
        borderRadius: '999px',
        background: 'var(--blue)',
        color: '#fff',
        fontSize: '20px',
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '12px',
    },
    resultTitle: {
        fontSize: '15px',
        fontWeight: 700,
        color: 'var(--ink)',
        marginBottom: '20px',
    },
    resultGrid: {
        width: '100%',
        maxWidth: '360px',
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
        padding: '16px 20px',
        borderRadius: '12px',
        background: 'var(--panel2)',
        border: '1px solid var(--line)',
        marginBottom: '20px',
    },
    infoRow: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '8px 0',
        borderBottom: '1px solid var(--line)',
    },
    infoLabel: {
        fontSize: '13px',
        color: 'var(--muted)',
    },
    infoValue: {
        fontWeight: 700,
    },
    resultActions: {
        display: 'flex',
        gap: '10px',
    },
    primaryButton: {
        padding: '10px 18px',
        border: 'none',
        borderRadius: '9px',
        background: 'var(--blue)',
        color: '#fff',
        fontSize: '13px',
        fontWeight: 700,
        cursor: 'pointer',
    },
    secondaryButton: {
        padding: '10px 18px',
        border: '1px solid var(--line)',
        borderRadius: '9px',
        background: 'transparent',
        color: 'var(--ink)',
        fontSize: '14px',
        fontWeight: 600,
        cursor: 'pointer',
    },
};