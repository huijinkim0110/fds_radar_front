// 백엔드 enum(fds.radar.common.*)과 1:1로 맞춘 한글 라벨 매핑
// 값이 늘어나면 여기에만 추가하면 됨 (컴포넌트 쪽 수정 불필요)

// 사건 상태 (CaseStatus)
export const CASE_STATUS_LABELS = {
    RECEIVED: "접수",
    INVESTIGATING: "조사중",
    CLOSED: "종결",
};

// 우선순위 (CasePriority)
export const CASE_PRIORITY_LABELS = {
    LOW: "낮음",
    MEDIUM: "보통",
    HIGH: "높음",
};

// 본인확인 (UserConfirmation)
export const USER_CONFIRMATION_LABELS = {
    CONFIRMED: "본인 확인",
    DENIED: "본인 아님",
    NO_RESPONSE: "미응답",
};

// 최종판정 (FraudDecision)
export const FRAUD_DECISION_LABELS = {
    NORMAL: "정상",
    FRAUD: "사기",
};

// AI 예측결과 (PredictedResult)
export const PREDICTED_RESULT_LABELS = {
    NORMAL: "정상",
    FRAUD: "이상",
};

// 이상거래 유형 (PredictedFraudType)
export const PREDICTED_FRAUD_TYPE_LABELS = {
    ACCOUNT_TAKEOVER: "계정/카드 도용",
    UNUSUAL_TRANSFER: "이상 송금",
    STOLEN_CARD: "도난/분실 카드 사용 의심",
    MONEY_LAUNDERING_PATTERN: "자금세탁 의심 패턴",
    OTHER_FRAUD_TYPE: "기타",
};

// 처리이력 액션 (FraudActionType)
export const FRAUD_ACTION_TYPE_LABELS = {
    HOLD: "거래 보류",
    CONFIRMED: "사용자 확인",
    INVESTIGATE: "조사",
    LOCK: "카드/계좌 잠금",
    FINALIZE: "확정",
};

// 공통 헬퍼: 매핑에 없는 값이거나 null/undefined/빈 문자열이면 "-" 처리
function getLabel(map, value) {
    if (value === null || value === undefined || value === "") return "-";
    return map[value] ?? value;
}

export function getCaseStatusLabel(value) {
    return getLabel(CASE_STATUS_LABELS, value);
}

export function getCasePriorityLabel(value) {
    return getLabel(CASE_PRIORITY_LABELS, value);
}

export function getUserConfirmationLabel(value) {
    return getLabel(USER_CONFIRMATION_LABELS, value);
}

export function getFraudDecisionLabel(value) {
    return getLabel(FRAUD_DECISION_LABELS, value);
}

export function getPredictedResultLabel(value) {
    return getLabel(PREDICTED_RESULT_LABELS, value);
}

export function getPredictedFraudTypeLabel(value) {
    return getLabel(PREDICTED_FRAUD_TYPE_LABELS, value);
}

export function getFraudActionTypeLabel(value) {
    return getLabel(FRAUD_ACTION_TYPE_LABELS, value);
}

// 이상확률(0~1 사이 소수)을 퍼센트 문자열로 변환: 0.8 -> "80%"
export function formatProbabilityPercent(value) {
    if (value === null || value === undefined || value === "") return "-";
    const num = Number(value);
    if (Number.isNaN(num)) return String(value);
    return `${Math.round(num * 100)}%`;
}

// 날짜/시간 포맷: "2026-08-19T10:30:00" -> "2026.08.19 10:30:00"
export function formatDateTime(value) {
    if (!value) return "-";

    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;

    const pad = (n) => String(n).padStart(2, "0");
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const mi = pad(d.getMinutes());
    const ss = pad(d.getSeconds());

    return `${yyyy}.${mm}.${dd} ${hh}:${mi}:${ss}`;
}

export const REQUEST_TARGET_TYPE_LABELS = {
    CARD: "카드",
    ACCOUNT: "계좌"
};

export const LOCK_REQUEST_STATUS_LABELS = {
    RECEIVED: "대기중",
    COMPLETED: "승인됨",
    REJECTED: "반려됨",
};

export function getRequestTargetTypeLabel(value) {
    return getLabel(REQUEST_TARGET_TYPE_LABELS, value);
}

export function getLockRequestStatusLabel(value) {
    return getLabel(LOCK_REQUEST_STATUS_LABELS, value);
}

// 거래유형 (TransactionType)
export const TRANSACTION_TYPE_LABELS = {
    CARD_PAYMENT: "카드결제",
    ACCOUNT_TRANSFER: "계좌이체",
};

export function getTransactionTypeLabel(value) {
    return getLabel(TRANSACTION_TYPE_LABELS, value);
}

// 거래유형에 따라 잠글 수 있는 대상을 자동으로 결정 (관리자가 임의로 고르지 못하게)
export function getLockTargetTypeFromTransactionType(transactionType) {
    if (transactionType === "CARD_PAYMENT") return "CARD";
    if (transactionType === "ACCOUNT_TRANSFER") return "ACCOUNT";
    return null;
}