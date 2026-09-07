import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { subscribe } from '../../api/financialProduct/simulatedSubscriptionAPI';

// 적금(SAVINGS)은 subscriptionAmount를 "월 납입액"으로, 그 외 상품은 "일시납 총액"으로
export default function SubscribeForm({ userId, product }) {
    const navigate = useNavigate();
    const isInstallment = product.productType === 'SAVINGS';

    const [amount, setAmount] = useState('');
    const [period, setPeriod] = useState(product.subscriptionPeriod ?? '');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);

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
        if (product.minAmount != null && amountValue < product.minAmount) {
            setError(`최소 가입금액은 ${product.minAmount.toLocaleString()}원입니다.`);
            return;
        }
        if (product.maxAmount != null && amountValue > product.maxAmount) {
            setError(`최대 가입금액은 ${product.maxAmount.toLocaleString()}원입니다.`);
            return;
        }

        setSubmitting(true);
        subscribe({
            userId,
            productId: product.productId,
            subscriptionAmount: amountValue,
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
                <div style={styles.resultTitle}>모의가입이 완료되었습니다</div>

                <div style={styles.resultGrid}>
                    <InfoRow
                        label="가입금액"
                        value={`${result.subscriptionAmount?.toLocaleString()}원`}
                    />
                    {result.monthlyPayment != null && (
                        <InfoRow
                            label="월 납입액"
                            value={`${result.monthlyPayment.toLocaleString()}원`}
                        />
                    )}
                    <InfoRow label="가입기간" value={`${result.subscriptionPeriod}개월`} />
                    <InfoRow
                        label="예상 만기금액"
                        value={`${result.expectedMaturityAmount?.toLocaleString()}원`}
                        highlight
                    />
                </div>

                <div style={styles.resultActions}>
                    <button
                        type="button"
                        className="minibtn"
                        style={styles.primaryButton}
                        onClick={() => navigate('/mypage/portfolio')}
                    >
                        내 모의가입 목록 보기
                    </button>
                    <button
                        type="button"
                        className="minibtn"
                        style={styles.secondaryButton}
                        onClick={() => setResult(null)}
                    >
                        다시 가입하기
                    </button>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGrid}>
                <label style={styles.field}>
                    <span style={styles.fieldLabel}>
                        {isInstallment ? '월 납입액' : '가입금액'} (원)
                    </span>
                    <input
                        style={styles.input}
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        min={product.minAmount ?? undefined}
                        max={product.maxAmount ?? undefined}
                    />
                </label>

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

            {error && <div style={styles.errorBox}>{error}</div>}

            <button
                type="submit"
                className="minibtn"
                disabled={submitting}
                style={styles.submitButton}
            >
                {submitting ? '가입 처리 중...' : '모의가입 신청'}
            </button>
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
        gap: '16px',
    },
    formGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '16px',
    },
    field: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
    },
    fieldLabel: {
        fontSize: '12px',
        color: 'var(--muted)',
        fontWeight: 600,
    },
    input: {
        width: '100%',
        padding: '9px 12px',
        border: '1px solid var(--line)',
        borderRadius: '8px',
        fontSize: '13px',
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
        fontSize: '12px',
        fontWeight: 600,
    },
    submitButton: {
        alignSelf: 'flex-start',
        padding: '10px 22px',
        border: 'none',
        borderRadius: '9px',
        background: 'var(--blue)',
        color: '#fff',
        fontSize: '13px',
        fontWeight: 700,
        cursor: 'pointer',
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
        fontSize: '13px',
        fontWeight: 600,
        cursor: 'pointer',
    },
};