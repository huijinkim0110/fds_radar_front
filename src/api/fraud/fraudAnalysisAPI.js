import { apiFetch } from "../apiClient";

// 오탐 목록 조회
export async function getFalsePositives() {
    return apiFetch(`/api/admin/fraud-analysis/false-positives`);
}

// 미탐 목록 조회
export async function getFalseNegatives() {
    return apiFetch(`/api/admin/fraud-analysis/false-negatives`);
}

// 이상거래 분석 통계
export async function getStats() {
    return apiFetch(`/api/admin/fraud-analysis/stats`);
}