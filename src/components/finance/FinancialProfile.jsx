import { useEffect, useState } from "react";
import { getFinancialProfile, hasFinancialProfile, upsertFinancialProfile } from "../../api/finance/financialProfileAPI";
import { INCOME_SOURCE_LABELS } from "../../constants/finance/financialProfileLabels";
import { isStale, formatElapsed } from "../../utils/staleness";

const TEMP_USER_ID = 1; // 인증 붙기 전까지 임시 고정값

const INCOME_SOURCE_OPTIONS = Object.keys(INCOME_SOURCE_LABELS);

const EMPTY_FORM = {
    occupation: '',
    incomeSource: INCOME_SOURCE_OPTIONS[0],
    monthlyIncome: '',
    monthlyExpenses: '',
    creditLevel: '',
    emergencyFundAmount: ''
};

function FinancialProfile() {
    const [profile, setProfile] = useState(null);
    const [hasProfile, setHasProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);
    const [submitting, setSubmitting] = useState(false);

    function loadProfile() {
        setLoading(true);
        setError(null);
        hasFinancialProfile(TEMP_USER_ID)
            .then((has) => {
                setHasProfile(has);
                if (has) {
                    return getFinancialProfile(TEMP_USER_ID).then(setProfile);
                }
            })
            .catch(() => setError('재무 프로필을 불러오지 못했습니다.'))
            .finally(() => setLoading(false));
    }

    useEffect(() => {
        loadProfile();
    }, []);

    function handleFormChange(field, value) {
        setForm((prev) => ({ ...prev, [field]: value}));
    }

    // 수정 시작 - 기존 값으로 폼 채움 / 신규 등록 시작 - 빈 폼
    function handleStartEdit() {
        setForm(profile ? {
            occupation: profile.occupation,
            incomeSource: profile.incomeSource,
            monthlyIncome: String(profile.monthlyIncome),
            monthlyExpenses: String(profile.monthlyExpenses),
            creditLevel: String(profile.creditLevel),
            emergencyFundAmount: String(profile.emergencyFundAmount)
        } : EMPTY_FORM);
        setEditing(true);
    }

    function handleSubmit() {
        if (!form.occupation || !form.monthlyIncome || !form.monthlyExpenses || !form.creditLevel || !form.emergencyFundAmount) {
            alert('모든 항목을 입력해주세요.');
            return;
        }

        setSubmitting(true);
        upsertFinancialProfile({
            userId: TEMP_USER_ID,
            occupation: form.occupation,
            incomeSource: form.incomeSource,
            monthlyIncome: Number(form.monthlyIncome),
            monthlyExpenses: Number(form.monthlyExpenses),
            creditLevel: Number(form.creditLevel),
            emergencyFundAmount: Number(form.emergencyFundAmount)
        })
            .then((data) => {
                setProfile(data);
                setHasProfile(true);
                setEditing(false);
            })
            .catch(() => alert('저장에 실패했습니다.'))
            .finally(() => setSubmitting(false));
    }

    if (loading) return <div>불러오는 중...</div>
    if (error) return <div>{error}</div>

    // 등록/수정 폼
    if (editing) {
        return (
            <div>
                <h2>재무 프로필 {hasProfile ? '수정' : '등록'}</h2>

                <label>
                    직업
                    <input 
                        type="text"
                        value={form.occupation}
                        onChange={(e) => handleFormChange('occupation', e.target.value)}
                    />
                </label>

                <label>
                    소득원
                    <select value={form.incomeSource} onChange={(e) => handleFormChange('incomeSource', e.target.value)}>
                        {INCOME_SOURCE_OPTIONS.map((source) => (
                            <option key={source} value={source}>{INCOME_SOURCE_LABELS[source]}</option>
                        ))}
                    </select>
                </label>

                <label>
                    월 소득
                    <input
                        type="number"
                        value={form.monthlyIncome}
                        onChange={(e) => handleFormChange('monthlyIncome', e.target.value)}
                    />원
                </label>

                <label>
                    월 지출
                    <input 
                        type="number"
                        value={form.monthlyExpenses}
                        onChange={(e) => handleFormChange('monthlyExpenses', e.target.value)}
                    />원
                </label>

                <label>
                    신용점수 등급
                    <input 
                        type="number"
                        value={form.creditLevel}
                        onChange={(e) => handleFormChange('creditLevel', e.target.value)}
                    />
                </label>

                <label>
                    비상자금 보유액
                    <input 
                        type="number"
                        value={form.emergencyFundAmount}
                        onChange={(e) => handleFormChange('emergencyFundAmount', e.target.value)}
                    />
                </label>

                <button onClick={handleSubmit} disabled={submitting}>
                    {submitting ? '저장 중...' : '저장'}
                </button>
                <button type="button" onClick={() => setEditing(false)}>취소</button>
            </div>
        );
    }

    // 등록된 프로필 없음
    if (!hasProfile) {
        return (
            <div>
                <h2>재무 프로필</h2>
                <p>등록된 재무 프로필이 없어요.</p>
                <button onClick={handleStartEdit}>재무 프로필 등록</button>
            </div>
        );
    }

    // 조회 화면
    return (
        <div>
            <h2>재무 프로필</h2>

            {isStale(profile.updatedAt) && (
                <p>⚠ 재무 프로필을 {formatElapsed(profile.updatedAt)} 수정 안했어요. 업데이트를 권장해요.</p>
            )}

            <p>직업: {profile.occupation}</p>
            <p>소득원: {INCOME_SOURCE_LABELS[profile.incomeSource]}</p>
            <p>월 소득: {profile.monthlyIncome?.toLocaleString()}원</p>
            <p>월 지출: {profile.monthlyExpenses?.toLocaleString()}원</p>
            <p>월 가용 금액: {profile.availableMonthlyAmount?.toLocaleString()}원</p>
            <p>신용점수 등급: {profile.creditLevel}</p>
            <p>비상자금 보유액: {profile.emergencyFundAmount?.toLocaleString()}원</p>

            <button onClick={handleStartEdit}>수정</button>
        </div>
    );
}

export default FinancialProfile;