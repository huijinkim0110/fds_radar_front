const SIX_MONTHS_IN_MS = 1000 * 60 * 60 * 24 * 30 * 6;

// dateString 기준으로 6개월(기본값) 지났는지 판단
export function isStale(dateString, months = 6) {
    if (!dateString) return false;
    const target = new Date(dateString);
    const diffMs = Date.now() - target.getTime();
    return diffMs > SIX_MONTHS_IN_MS * (months / 6);
}

export function formatElapsed(dateString) {
    if (!dateString) return '';
    const target = new Date(dateString);
    const diffMonths = Math.floor((Date.now() - target.getTime()) / (1000 * 60 * 60 * 24 * 30));
    return diffMonths <= 0 ? '이번 달' : `${diffMonths}개월 전`;
}