import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitDiagnosis } from '../../api/finance/investmentProfileAPI';
import { DIAGNOSIS_QUESTIONS, PRINCIPAL_PROTECTION_QUESTION } from '../../constants/finance/diagnosisQuestions';

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

    const [result, setResult] = useState(null); // 진단 결과(제출 후 표시)
    const [submitting, setSubmitting] = useState(false);

    function handleSelect(questionId, value) {
        setAnswers((prev) => ({ ...prev, [questionId]: value }));
    }

    // 7개 문항 모두 답했는지 확인
    const isComplete = Object.values(answers).every((v) => v !== null);

    function handleSubmit() {
        setSubmitting(true);

        submitDiagnosis({
            userId: TEMP_USER_ID,
            ...answers,
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

            <button onClick={handleSubmit} disabled={!isComplete || submitting}>
                {submitting ? '제출 중...' : '진단 결과 보기'}
            </button>
        </div>
    );
}

export default InvestmentDiagnosis;