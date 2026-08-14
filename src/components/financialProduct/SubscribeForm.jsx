import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { subscribe } from '../../api/financialProduct/simulatedSubscriptionAPI';

// 적금(SAVINGS)은 subscriptionAmount를 "월 납입액"으로, 그 외 상품은 "일시납 총액"으로
function SubscribeForm({ userId, product }) {
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
            <div>
                <p>모의가입이 완료되었습니다.</p>
                <dl>
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
                </dl>
                <button onClick={() => navigate('/portfolio')}>내 모의가입 목록 보기</button>
                <button onClick={() => setResult(null)}>다시 가입하기</button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit}>
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

            {error && <p>{error}</p>}

            <button type="submit" disabled={submitting}>
                {submitting ? '가입 처리 중...' : '모의가입 신청'}
            </button>
        </form>
    );
}

export default SubscribeForm;