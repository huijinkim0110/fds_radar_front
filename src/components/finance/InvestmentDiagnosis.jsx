import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitDiagnosis } from '../../api/finance/investmentProfileAPI';
import { DIAGNOSIS_QUESTIONS, PRINCIPAL_PROTECTION_QUESTION } from '../../constants/finance/diagnosisQuestions';
import { 
    AGE_OPTIONS, 
    GENDER_OPTIONS,
    REGION_OPTIONS,
    INCOME_BRACKET_OPTIONS,
    OCCUPATION_GROUP_OPTIONS,
    MARITAL_STATUS_OPTIONS,
    CROSS_COVERAGE_OPTIONS,
    DISEASE_HISTORY_OPTIONS,
    DISEASE_HISTORY_VALUE_MAP
} from '../../constants/recommendation/recommendationOptions';

const TEMP_USER_ID = 1;

const RISK_TENDENCY_LABELS = {
    STABLE: '안정형', 
    NEUTRAL: '중립형', 
    ACTIVE: '적극형', 
    AGGRESSIVE: '공격형'
};

function InvestmentDiagnosis() {
    const navigate = useNavigate();

    // 각 문항의 선택값을 저장(아직 선택 안하면 null)
    const [answers, setAnswers] = useState({
        ageScore: null,
        investmentExperienceScore: null,
        knowledgeLevelScore: null,
        preferredPeriodScore: null,
        assetRatioScore: null,
        lossToleranceScore: null,
        principalProtectionRequired: null
    });

    // AI 추천용 인적사항
    const [profileInfo, setProfileInfo] = useState({
        age: AGE_OPTIONS[1],
        gender: GENDER_OPTIONS[1],
        region: REGION_OPTIONS[1],
        incomeBracket: INCOME_BRACKET_OPTIONS[1],
        occupationGroup: OCCUPATION_GROUP_OPTIONS[0],
        maritalStatus: MARITAL_STATUS_OPTIONS[0],
        crossCoverage: CROSS_COVERAGE_OPTIONS[0],
        diseaseHistory: 'NONE'
    });

    const [result, setResult] = useState(null); // 진단 결과(제출 후 표시)
    const [submitting, setSubmitting] = useState(false);

    function handleSelect(questionId, value) {
        setAnswers((prev) => ({ ...prev, [questionId]: value }));
    }

    function handleProfileChange(field, value) {
        setProfileInfo((prev) => ({ ...prev, [field]: value}));
    }

    // 7개 문항 모두 답했는지 확인
    const isComplete = Object.values(answers).every((v) => v !== null);

    function handleSubmit() {
        setSubmitting(true);

        submitDiagnosis({
            userId: TEMP_USER_ID,
            ...answers,
            ...profileInfo,
            diseaseHistory: DISEASE_HISTORY_VALUE_MAP[profileInfo.diseaseHistory],
        })
            .then((data) => setResult(data))
            .catch(() => alert('진단 제출에 실패했습니다.'))
            .finally(() => setSubmitting(false));
    }

    // 결과 화면
    if (result) {
        return (
            <div>
                <h2>투자성향 진단 결과</h2>
                <p>당신의 투자성향은 <strong>{RISK_TENDENCY_LABELS[result.riskTendency]}</strong>입니다.</p>
                <button onClick={() => navigate('/mypage/recommendations')}>추천 상품 보러가기</button>
            </div>
        );
    }

    // 설문 화면
    return (
        <div>
            <h2>투자성향 진단</h2>

            {DIAGNOSIS_QUESTIONS.map((q) => (
                <div key={q.id}>
                    <p>{q.question}</p>
                    {q.options.map((opt) => (
                        <label key={opt.value}>
                            <input 
                                type="radio"
                                name={q.id}
                                checked={answers[q.id] === opt.value}
                                onChange={() => handleSelect(q.id, opt.value)}
                            />
                            {opt.label}
                        </label>
                    ))}
                </div>
            ))}

            <div>
                <p>{PRINCIPAL_PROTECTION_QUESTION.question}</p>
                {PRINCIPAL_PROTECTION_QUESTION.options.map((opt) => (
                    <label key={String(opt.value)}>
                        <input 
                            type="radio"
                            name="principalProtectionRequired"
                            checked={answers.principalProtectionRequired === opt.value}
                            onChange={() => handleSelect('principalProtectionRequired', opt.value)}
                        />
                        {opt.label}
                    </label>
                ))}
            </div>

            {/* AI 추천용 인적사항 */}
            <fieldset>
                <legend>추천 상품을 위한 추가 정보</legend>

                <label>
                    연령대
                    <select value={profileInfo.age} onChange={(e) => handleProfileChange('age', e.target.value)}>
                        {AGE_OPTIONS.map((v) => <option key={v} value={v}>{v}</option>)}
                    </select>
                </label>

                <label>
                    성별
                    <select value={profileInfo.gender} onChange={(e) => handleProfileChange('gender', e.target.value)}>
                        {GENDER_OPTIONS.map((v) => <option key={v} value={v}>{v}</option>)}
                    </select>
                </label>

                <label>
                    지역
                    <select value={profileInfo.region} onChange={(e) => handleProfileChange('region', e.target.value)}>
                        {REGION_OPTIONS.map((v) => <option key={v} value={v}>{v}</option>)}
                    </select>
                </label>

                <label>
                    소득구간
                    <select value={profileInfo.incomeBracket} onChange={(e) => handleProfileChange('incomeBracket', e.target.value)}>
                        {INCOME_BRACKET_OPTIONS.map((v) => <option key={v} value={v}>{v}</option>)}
                    </select>
                </label>

                <label>
                    직업군
                    <select value={profileInfo.occupationGroup} onChange={(e) => handleProfileChange('occupationGroup', e.target.value)}>
                        {OCCUPATION_GROUP_OPTIONS.map((v) => <option key={v} value={v}>{v}</option>)}
                    </select>
                </label>

                <label>
                    결혼여부
                    <select value={profileInfo.maritalStatus} onChange={(e) => handleProfileChange('maritalStatus', e.target.value)}>
                        {MARITAL_STATUS_OPTIONS.map((v) => <option key={v} value={v}>{v}</option>)}
                    </select>
                </label>

                <label>
                    담보유형
                    <select value={profileInfo.crossCoverage} onChange={(e) => handleProfileChange('crossCoverage', e.target.value)}>
                        {CROSS_COVERAGE_OPTIONS.map((v) => <option key={v} value={v}>{v}</option>)}
                    </select>
                </label>

                <fieldset>
                    <legend>질병 이력(해당하는 것 1개 선택)</legend>
                    {DISEASE_HISTORY_OPTIONS.map((opt) => (
                        <label key={opt.value}>
                            <input
                                type="radio"
                                name="diseaseHistory"
                                checked={profileInfo.diseaseHistory === opt.value}
                                onChange={() => handleProfileChange('diseaseHistory', opt.value)}
                            />
                            {opt.label}
                        </label>
                    ))}
                </fieldset>
            </fieldset>

            <button onClick={handleSubmit} disabled={!isComplete || submitting}>
                {submitting ? '제출 중...' : '진단 결과 보기'}
            </button>
        </div>
    );
}

export default InvestmentDiagnosis;