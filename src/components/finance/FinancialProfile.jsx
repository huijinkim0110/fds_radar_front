// 재무 프로필 페이지
import { useEffect, useState } from "react";

import {
    getFinancialProfile,
    hasFinancialProfile,
    upsertFinancialProfile
} from "../../api/finance/financialProfileAPI";

import { INCOME_SOURCE_LABELS } from "../../constants/finance/financialProfileLabels";
import { isStale, formatElapsed } from "../../utils/staleness";

const TEMP_USER_ID = 1; // 인증 붙기 전까지 임시 고정값
const INCOME_SOURCE_OPTIONS = Object.keys(INCOME_SOURCE_LABELS);

const EMPTY_FORM = {
    occupation: "",
    incomeSource: INCOME_SOURCE_OPTIONS[0],
    monthlyIncome: "",
    monthlyExpenses: "",
    emergencyFundAmount: ""
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
            .catch(() => setError("재무 프로필을 불러오지 못했습니다."))
            .finally(() => setLoading(false));
    }

    useEffect(() => {
        loadProfile();
    }, []);

    function handleFormChange(field, value) {
        setForm((prev) => ({
            ...prev,
            [field]: value
        }));
    }

    // 수정 시작 - 기존 값으로 폼 채움
    // 신규 등록 시작 - 빈 폼
    function handleStartEdit() {
        setForm(
            profile
                ? {
                    occupation: profile.occupation ?? "",
                    incomeSource: profile.incomeSource ?? INCOME_SOURCE_OPTIONS[0],
                    monthlyIncome: profile.monthlyIncome != null
                        ? String(profile.monthlyIncome)
                        : "",
                    monthlyExpenses: profile.monthlyExpenses != null
                        ? String(profile.monthlyExpenses)
                        : "",
                    emergencyFundAmount: profile.emergencyFundAmount != null
                        ? String(profile.emergencyFundAmount)
                        : ""
                }
                : EMPTY_FORM
        );

        setEditing(true);
    }

    function handleSubmit() {
        if (
            !form.occupation ||
            !form.incomeSource ||
            !form.monthlyIncome ||
            !form.monthlyExpenses ||
            !form.emergencyFundAmount
        ) {
            alert("모든 항목을 입력해주세요.");
            return;
        }

        setSubmitting(true);

        upsertFinancialProfile({
            userId: TEMP_USER_ID,
            occupation: form.occupation,
            incomeSource: form.incomeSource,
            monthlyIncome: Number(form.monthlyIncome),
            monthlyExpenses: Number(form.monthlyExpenses),
            emergencyFundAmount: Number(form.emergencyFundAmount)
        })
            .then((data) => {
                setProfile(data);
                setHasProfile(true);
                setEditing(false);
            })
            .catch(() => alert("저장에 실패했습니다."))
            .finally(() => setSubmitting(false));
    }

    // 로딩
    if (loading) {
        return (
            <div className="loading">
                재무 프로필을 불러오는 중...
            </div>
        );
    }

    // 오류
    if (error) {
        return (
            <div className="panel">
                <div
                    className="acard"
                    style={{ borderColor: "rgba(248,113,113,0.3)" }}
                >
                    <div
                        className="sev"
                        style={{ background: "var(--red)" }}
                    />

                    <div>
                        <div
                            className="at"
                            style={{ color: "var(--red)" }}
                        >
                            재무 프로필 조회 실패
                        </div>
                        <div className="am">{error}</div>
                    </div>

                    <div className="aright">
                        <button
                            type="button"
                            className="minibtn"
                            onClick={loadProfile}
                        >
                            다시 시도
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // 등록 / 수정 폼
    if (editing) {
        return (
            <div className="panel">
                <div className="ph-head">
                    <div>
                        <h3>재무 프로필 {hasProfile ? "수정" : "등록"}</h3>
                        <div className="ph-sub">
                            현재 재무 상태에 맞게 정보를 입력해주세요.
                        </div>
                    </div>

                    <span className="filterpill">
                        {hasProfile ? "정보 수정" : "신규 등록"}
                    </span>
                </div>

                {/* 직업 */}
                <div className="field">
                    <label>직업</label>
                    <input
                        type="text"
                        value={form.occupation}
                        placeholder="직업을 입력해주세요."
                        onChange={(e) =>
                            handleFormChange("occupation", e.target.value)
                        }
                        style={{
                            width: "100%",
                            border: "1px solid var(--line)",
                            borderRadius: "10px",
                            padding: "12px 14px",
                            fontSize: "13.5px",
                            background: "var(--panel2)",
                            color: "var(--ink)",
                            fontFamily: "inherit",
                            outline: "none"
                        }}
                    />
                </div>

                {/* 소득원 */}
                <div className="field">
                    <label>소득원</label>
                    <select
                        value={form.incomeSource}
                        onChange={(e) =>
                            handleFormChange("incomeSource", e.target.value)
                        }
                    >
                        {INCOME_SOURCE_OPTIONS.map((source) => (
                            <option key={source} value={source}>
                                {INCOME_SOURCE_LABELS[source]}
                            </option>
                        ))}
                    </select>
                </div>

                {/* 월 소득 / 월 지출 */}
                <div className="row2">
                    <div className="field">
                        <label>월 소득</label>
                        <div style={{ position: "relative" }}>
                            <input
                                type="number"
                                min="0"
                                value={form.monthlyIncome}
                                placeholder="0"
                                onChange={(e) =>
                                    handleFormChange("monthlyIncome", e.target.value)
                                }
                                style={{
                                    width: "100%",
                                    border: "1px solid var(--line)",
                                    borderRadius: "10px",
                                    padding: "12px 42px 12px 14px",
                                    fontSize: "13.5px",
                                    background: "var(--panel2)",
                                    color: "var(--ink)",
                                    fontFamily: "inherit",
                                    outline: "none"
                                }}
                            />
                            <span
                                style={{
                                    position: "absolute",
                                    right: "14px",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    fontSize: "12px",
                                    color: "var(--muted)"
                                }}
                            >
                                원
                            </span>
                        </div>
                    </div>

                    <div className="field">
                        <label>월 지출</label>
                        <div style={{ position: "relative" }}>
                            <input
                                type="number"
                                min="0"
                                value={form.monthlyExpenses}
                                placeholder="0"
                                onChange={(e) =>
                                    handleFormChange("monthlyExpenses", e.target.value)
                                }
                                style={{
                                    width: "100%",
                                    border: "1px solid var(--line)",
                                    borderRadius: "10px",
                                    padding: "12px 42px 12px 14px",
                                    fontSize: "13.5px",
                                    background: "var(--panel2)",
                                    color: "var(--ink)",
                                    fontFamily: "inherit",
                                    outline: "none"
                                }}
                            />
                            <span
                                style={{
                                    position: "absolute",
                                    right: "14px",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    fontSize: "12px",
                                    color: "var(--muted)"
                                }}
                            >
                                원
                            </span>
                        </div>
                    </div>
                </div>

                {/* 비상자금 */}
                <div className="field">
                    <label>비상자금 보유액</label>
                    <div style={{ position: "relative" }}>
                        <input
                            type="number"
                            min="0"
                            value={form.emergencyFundAmount}
                            placeholder="0"
                            onChange={(e) =>
                                handleFormChange("emergencyFundAmount", e.target.value)
                            }
                            style={{
                                width: "100%",
                                border: "1px solid var(--line)",
                                borderRadius: "10px",
                                padding: "12px 42px 12px 14px",
                                fontSize: "13.5px",
                                background: "var(--panel2)",
                                color: "var(--ink)",
                                fontFamily: "inherit",
                                outline: "none"
                            }}
                        />
                        <span
                            style={{
                                position: "absolute",
                                right: "14px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                fontSize: "12px",
                                color: "var(--muted)"
                            }}
                        >
                            원
                        </span>
                    </div>
                </div>

                {/* 신용등급 안내 */}
                <div
                    className="acard"
                    style={{ marginBottom: "16px" }}
                >
                    <div
                        className="sev"
                        style={{ background: "var(--blue)" }}
                    />
                    <div>
                        <div className="at">신용등급</div>
                        <div className="am">
                            신용등급은 직접 입력하지 않으며, 금융기관에서 확인된 정보를 기준으로 표시됩니다.
                        </div>
                    </div>
                </div>

                {/* 버튼 */}
                <div
                    style={{
                        display: "flex",
                        gap: "8px",
                        justifyContent: "flex-end",
                        marginTop: "8px"
                    }}
                >
                    <button
                        type="button"
                        className="minibtn"
                        onClick={() => setEditing(false)}
                        disabled={submitting}
                    >
                        취소
                    </button>

                    <button
                        type="button"
                        className="minibtn"
                        onClick={handleSubmit}
                        disabled={submitting}
                        style={{
                            background: "var(--blue)",
                            borderColor: "var(--blue)",
                            color: "#fff",
                            padding: "8px 18px"
                        }}
                    >
                        {submitting ? "저장 중..." : "저장"}
                    </button>
                </div>
            </div>
        );
    }

    // 등록된 프로필 없음
    if (!hasProfile) {
        return (
            <div className="panel">
                <div
                    style={{
                        textAlign: "center",
                        padding: "50px 20px"
                    }}
                >
                    <div
                        style={{
                            width: "52px",
                            height: "52px",
                            margin: "0 auto 16px",
                            borderRadius: "14px",
                            background: "var(--blue-soft)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#93C5FD",
                            fontSize: "22px",
                            fontWeight: "700"
                        }}
                    >
                        ₩
                    </div>

                    <h3>재무 프로필</h3>
                    <p
                        style={{
                            fontSize: "12.5px",
                            color: "var(--muted)",
                            marginTop: "8px",
                            marginBottom: "20px"
                        }}
                    >
                        등록된 재무 프로필이 없어요.
                    </p>

                    <button
                        type="button"
                        className="minibtn"
                        onClick={handleStartEdit}
                        style={{
                            background: "var(--blue)",
                            borderColor: "var(--blue)",
                            color: "#fff",
                            padding: "9px 16px"
                        }}
                    >
                        재무 프로필 등록
                    </button>
                </div>
            </div>
        );
    }

    // 조회 화면
    return (
        <div>
            <div className="panel">
                <div className="ph-head">
                    <div>
                        <h3>재무 프로필</h3>
                        <div className="ph-sub">
                            등록한 재무 정보를 확인할 수 있습니다.
                        </div>
                    </div>

                    <button
                        type="button"
                        className="minibtn"
                        onClick={handleStartEdit}
                    >
                        수정
                    </button>
                </div>

                {/* 오래된 정보 알림 */}
                {profile?.updatedAt && isStale(profile.updatedAt) && (
                    <div
                        className="acard"
                        style={{ marginBottom: "16px" }}
                    >
                        <div
                            className="sev"
                            style={{ background: "var(--amber)" }}
                        />
                        <div>
                            <div
                                className="at"
                                style={{ color: "var(--amber)" }}
                            >
                                재무 프로필 업데이트 권장
                            </div>
                            <div className="am">
                                재무 프로필을 {formatElapsed(profile.updatedAt)} 수정하지 않았어요.
                            </div>
                        </div>
                    </div>
                )}

                {/* 직업 */}
                <div className="setrow">
                    <div>
                        <div className="st">직업</div>
                        <div className="sm">현재 등록된 직업</div>
                    </div>
                    <div style={{ fontSize: "13px", fontWeight: "600" }}>
                        {profile.occupation || "-"}
                    </div>
                </div>

                {/* 소득원 */}
                <div className="setrow">
                    <div>
                        <div className="st">소득원</div>
                        <div className="sm">주요 소득 발생 유형</div>
                    </div>
                    <span className="filterpill">
                        {INCOME_SOURCE_LABELS[profile.incomeSource] || "-"}
                    </span>
                </div>

                {/* 월 소득 */}
                <div className="setrow">
                    <div>
                        <div className="st">월 소득</div>
                        <div className="sm">월 평균 소득</div>
                    </div>
                    <div style={{ fontSize: "14px", fontWeight: "700" }}>
                        {profile.monthlyIncome != null
                            ? `${profile.monthlyIncome.toLocaleString()}원`
                            : "-"}
                    </div>
                </div>

                {/* 월 지출 */}
                <div className="setrow">
                    <div>
                        <div className="st">월 지출</div>
                        <div className="sm">월 평균 지출</div>
                    </div>
                    <div style={{ fontSize: "14px", fontWeight: "700" }}>
                        {profile.monthlyExpenses != null
                            ? `${profile.monthlyExpenses.toLocaleString()}원`
                            : "-"}
                    </div>
                </div>

                {/* 월 가용 금액 */}
                <div className="setrow">
                    <div>
                        <div className="st">월 가용 금액</div>
                        <div className="sm">소득에서 지출을 제외한 금액</div>
                    </div>
                    <div
                        style={{
                            fontSize: "16px",
                            fontWeight: "700",
                            color: "var(--green)"
                        }}
                    >
                        {profile.availableMonthlyAmount != null
                            ? `${profile.availableMonthlyAmount.toLocaleString()}원`
                            : "-"}
                    </div>
                </div>

                {/* 신용등급 */}
                <div className="setrow">
                    <div>
                        <div className="st">신용등급</div>
                        <div className="sm">금융기관에서 확인된 신용 정보</div>
                    </div>

                    {profile.creditLevel != null ? (
                        <span className="chip c-pass">
                            {profile.creditLevel}등급
                        </span>
                    ) : (
                        <span
                            style={{
                                fontSize: "12px",
                                color: "var(--muted)"
                            }}
                        >
                            확인 정보 없음
                        </span>
                    )}
                </div>

                {/* 비상자금 */}
                <div className="setrow">
                    <div>
                        <div className="st">비상자금 보유액</div>
                        <div className="sm">현재 확보한 비상자금</div>
                    </div>
                    <div style={{ fontSize: "14px", fontWeight: "700" }}>
                        {profile.emergencyFundAmount != null
                            ? `${profile.emergencyFundAmount.toLocaleString()}원`
                            : "-"}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default FinancialProfile;
