import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { submitDiagnosis } from "../../api/finance/investmentProfileAPI";
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
    submitDiagnosis({
      userId: TEMP_USER_ID,
      ...answers,
      ...profileInfo,
      diseaseHistory: DISEASE_HISTORY_VALUE_MAP[profileInfo.diseaseHistory],
    })
      .then((data) => setResult(data))
      .catch(() => alert("진단 제출에 실패했습니다."))
      .finally(() => setSubmitting(false));
  }

  // ── 결과 화면 ──
  if (result) {
    return (
      <>
        <TopBar title="투자성향 진단 결과" crumb="마이페이지 / 투자성향" search={false} />
        <Panel>
          <div className="diag-result">
            <div className="diag-result-badge">{RISK_TENDENCY_LABELS[result.riskTendency]}</div>
            <p className="diag-result-text">
              당신의 투자성향은 <strong>{RISK_TENDENCY_LABELS[result.riskTendency]}</strong>입니다.
            </p>
            <button className="primary" style={{ maxWidth: 260 }} onClick={() => navigate("/mypage/recommendations")}>
              추천 상품 보러가기 →
            </button>
          </div>
        </Panel>
      </>
    );
  }

  // ── 설문 화면 ──
  return (
    <>
      <TopBar title="투자성향 진단" crumb="마이페이지 / 투자성향" search={false} />

      {/* 진단 문항 */}
      <Panel title="투자성향 문항" sub="7개 문항에 모두 답해주세요">
        <div className="diag-list">
          {DIAGNOSIS_QUESTIONS.map((q) => (
            <div className="diag-q" key={q.id}>
              <div className="diag-q-title">{q.question}</div>
              <div className="diag-options">
                {q.options.map((opt) => (
                  <label
                    key={opt.value}
                    className={`diag-opt ${answers[q.id] === opt.value ? "on" : ""}`}
                  >
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
            </div>
          ))}

          {/* 원금보장 문항 */}
          <div className="diag-q">
            <div className="diag-q-title">{PRINCIPAL_PROTECTION_QUESTION.question}</div>
            <div className="diag-options">
              {PRINCIPAL_PROTECTION_QUESTION.options.map((opt) => (
                <label
                  key={String(opt.value)}
                  className={`diag-opt ${answers.principalProtectionRequired === opt.value ? "on" : ""}`}
                >
                  <input
                    type="radio"
                    name="principalProtectionRequired"
                    checked={answers.principalProtectionRequired === opt.value}
                    onChange={() => handleSelect("principalProtectionRequired", opt.value)}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>
        </div>
      </Panel>

      {/* AI 추천용 인적사항 */}
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
            <label>직업군</label>
            <select value={profileInfo.occupationGroup} onChange={(e) => handleProfileChange("occupationGroup", e.target.value)}>
              {OCCUPATION_GROUP_OPTIONS.map((v) => <option key={v} value={v}>{v}</option>)}
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
        </div>

        {/* 질병 이력 */}
        <div className="field" style={{ marginTop: 8 }}>
          <label>질병 이력 (해당하는 것 1개)</label>
          <div className="diag-options">
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

      <button className="primary" style={{ maxWidth: 260, marginTop: 16 }} onClick={handleSubmit} disabled={!isComplete || submitting}>
        {submitting ? "제출 중…" : "진단 결과 보기"}
      </button>
    </>
  );
}

export default InvestmentDiagnosis;