import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { submitDiagnosis, previewDiagnosis } from "../../api/finance/investmentProfileAPI";
import { DIAGNOSIS_QUESTIONS, PRINCIPAL_PROTECTION_QUESTION } from "../../constants/finance/diagnosisQuestions";
import {
  AGE_OPTIONS,
  GENDER_OPTIONS,
  REGION_OPTIONS,
  INCOME_BRACKET_OPTIONS,
  OCCUPATION_GROUP_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  CROSS_COVERAGE_OPTIONS,
  DISEASE_HISTORY_OPTIONS,
  DISEASE_HISTORY_VALUE_MAP,
} from "../../constants/recommendation/recommendationOptions";
import TopBar from "../TopBar.jsx";
import Panel from "../Panel.jsx";

const TEMP_USER_ID = 1;

const RISK_TENDENCY_LABELS = {
  STABLE: "안정형",
  NEUTRAL: "중립형",
  ACTIVE: "적극형",
  AGGRESSIVE: "공격형",
};

function InvestmentDiagnosis() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isLoggedIn = !!user;

  const STEPS = [
    ...DIAGNOSIS_QUESTIONS,
    { id: "principalProtectionRequired", question: PRINCIPAL_PROTECTION_QUESTION.question, options: PRINCIPAL_PROTECTION_QUESTION.options },
  ];

  const [phase, setPhase] = useState("questions"); // "questions" | "info"
  const [step, setStep] = useState(0);
  const isLastStep = step === STEPS.length - 1;
  const currentQuestion = STEPS[step];

  const [answers, setAnswers] = useState({
    ageScore: null,
    investmentExperienceScore: null,
    knowledgeLevelScore: null,
    preferredPeriodScore: null,
    assetRatioScore: null,
    lossToleranceScore: null,
    principalProtectionRequired: null,
  });

  const [profileInfo, setProfileInfo] = useState({
    age: AGE_OPTIONS[1],
    gender: GENDER_OPTIONS[1],
    region: REGION_OPTIONS[1],
    incomeBracket: INCOME_BRACKET_OPTIONS[1],
    occupationGroup: OCCUPATION_GROUP_OPTIONS[0],
    maritalStatus: MARITAL_STATUS_OPTIONS[0],
    crossCoverage: CROSS_COVERAGE_OPTIONS[0],
    diseaseHistory: "NONE",
  });

  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function handleSelect(questionId, value) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  function handleProfileChange(field, value) {
    setProfileInfo((prev) => ({ ...prev, [field]: value }));
  }

  const isComplete = Object.values(answers).every((v) => v !== null);

  function handleSubmit() {
    setSubmitting(true);

    const payload = {
      ...answers,
      ...profileInfo,
      diseaseHistory: DISEASE_HISTORY_VALUE_MAP[profileInfo.diseaseHistory],
    };

    const request = isLoggedIn
        ? submitDiagnosis({ userId: TEMP_USER_ID, ...payload })
        : previewDiagnosis(payload);

    request
        .then((data) => setResult(data))
        .catch(() => alert('진단 제출에 실패했습니다.'))
        .finally(() => setSubmitting(false));
  }

  // ── 결과 화면 ──
  if (result) {
    return (
      <div
        className="diag-page"
        style={{
          width: "100%",
          maxWidth: "700px",
          margin: "0 auto",
          padding: "32px 24px 60px",
          boxSizing: "border-box",
        }}
      >
        <button type="button" className="minibtn" onClick={() => navigate('/')} style={{ marginBottom: '12px' }}>
          ← 홈으로
        </button>

        <TopBar title="투자성향 진단 결과" crumb="홈 / 투자성향 진단" search={false} />
        <Panel>
          <div className="diag-result">
            <p className="diag-result-text" style={{ fontSize: "20px" }}>
              당신의 투자성향은 <strong style={{ color: "var(--blue)" }}>{RISK_TENDENCY_LABELS[result.riskTendency]}</strong>입니다.
            </p>
            {isLoggedIn ? (
              <button className="primary" style={{ width: "auto", padding: "13px 24px" }} onClick={() => navigate('/mypage/diagnosis/results')}>
                추천 상품 보러 가기
              </button>
            ) : (
              <div>
                <p>결과는 저장되지 않았어요. 저장하고 맞춤 상품 추천까지 받으려면 로그인해주세요.</p>
                <button className="primary" style={{ width: "auto", padding: "13px 24px" }} onClick={() => navigate('/login')}>
                  로그인하러 가기
                </button>
              </div>
            )}
          </div>
        </Panel>
      </div>
    );
  }

  // ── 설문 화면 ──
  return (
    <div
      className="diag-page"
      style={{
        width: "100%",
        maxWidth: "700px",
        margin: "0 auto",
        padding: "32px 24px 60px",
        boxSizing: "border-box",
      }}
    >
      <button type="button" className="minibtn" onClick={() => navigate('/')} style={{ marginBottom: '12px' }}>
        ← 홈으로
      </button>

      <TopBar title="투자성향 진단" crumb="홈 / 투자성향 진단" search={false} />

      {phase === "questions" && (
        <div style={{ maxWidth: "480px", margin: "0 auto" }}>
          <Panel title="투자성향 문항" sub={`${step + 1} / ${STEPS.length}`} style={{ padding: "32px 28px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  onClick={() => setStep(i)}
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    background: answers[STEPS[i].id] !== null ? "var(--blue)" : "var(--line)",
                    cursor: "pointer",
                  }}
                />
              ))}
            </div>
            <div className="diag-q">
              <div className="diag-q-title">{currentQuestion.question}</div>
              <div className="diag-options">
                {currentQuestion.options.map((opt) => (
                  <label
                    key={String(opt.value)}
                    className={`diag-opt ${answers[currentQuestion.id] === opt.value ? "on" : ""}`}
                  >
                    <input
                      type="radio"
                      name={currentQuestion.id}
                      checked={answers[currentQuestion.id] === opt.value}
                      onChange={() => handleSelect(currentQuestion.id, opt.value)}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginTop: 20 }}>
              {step > 0 ? (
                <button type="button" className="minibtn" onClick={() => setStep((s) => s - 1)}>
                  이전
                </button>
              ) : <span />}

              <button
                type="button"
                className="primary"
                style={{ width: "auto", padding: "13px 20px" }}
                onClick={() => (isLastStep ? setPhase("info") : setStep((s) => s + 1))}
              >
                {isLastStep ? "다음: 추가 정보 입력하기" : "다음"}
              </button>
            </div>
          </Panel>
        </div>
      )}

      {phase === "info" && (
        <>
          <Panel title="추천 상품을 위한 추가 정보" sub="AI 추천에 사용돼요">
            <div className="diag-grid">
              <div className="field">
                <label>연령대</label>
                <select value={profileInfo.age} onChange={(e) => handleProfileChange("age", e.target.value)}>
                  {AGE_OPTIONS.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div className="field">
                <label>성별</label>
                <select value={profileInfo.gender} onChange={(e) => handleProfileChange("gender", e.target.value)}>
                  {GENDER_OPTIONS.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div className="field">
                <label>지역</label>
                <select value={profileInfo.region} onChange={(e) => handleProfileChange("region", e.target.value)}>
                  {REGION_OPTIONS.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div className="field">
                <label>소득구간</label>
                <select value={profileInfo.incomeBracket} onChange={(e) => handleProfileChange("incomeBracket", e.target.value)}>
                  {INCOME_BRACKET_OPTIONS.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div className="field">
                <label>결혼여부</label>
                <select value={profileInfo.maritalStatus} onChange={(e) => handleProfileChange("maritalStatus", e.target.value)}>
                  {MARITAL_STATUS_OPTIONS.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div className="field">
                <label>담보유형</label>
                <select value={profileInfo.crossCoverage} onChange={(e) => handleProfileChange("crossCoverage", e.target.value)}>
                  {CROSS_COVERAGE_OPTIONS.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div className="field field-wide">
                <label>직업군</label>
                <select value={profileInfo.occupationGroup} onChange={(e) => handleProfileChange("occupationGroup", e.target.value)}>
                  {OCCUPATION_GROUP_OPTIONS.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
            </div>

            <div className="field" style={{ marginTop: 24 }}>
              <label style={{ display: "block", marginBottom: 12 }}>질병 이력 (해당하는 것 1개)</label>
              <div className="diag-options diag-options-wrap">
                {DISEASE_HISTORY_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className={`diag-opt ${profileInfo.diseaseHistory === opt.value ? "on" : ""}`}
                  >
                    <input
                      type="radio"
                      name="diseaseHistory"
                      checked={profileInfo.diseaseHistory === opt.value}
                      onChange={() => handleProfileChange("diseaseHistory", opt.value)}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>
          </Panel>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
            <button type="button" className="minibtn" onClick={() => setPhase("questions")}>
              문항으로 돌아가기
            </button>

            <button className="primary" style={{ maxWidth: 260 }} onClick={handleSubmit} disabled={!isComplete || submitting}>
              {submitting ? "제출 중…" : "진단 결과 보기"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default InvestmentDiagnosis;