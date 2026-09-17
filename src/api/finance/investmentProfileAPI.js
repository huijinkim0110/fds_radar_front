import { apiFetch } from '../apiClient';

export async function submitDiagnosis(diagnosisData) {
    return apiFetch('/investment-profiles', { method: 'POST', body: JSON.stringify(diagnosisData) });
}

// 비로그인 사용자용 - 저장 없이 진단 결과만
export async function previewDiagnosis(diagnosisData) {
    return apiFetch('/investment-profiles/preview', { method: 'POST', body: JSON.stringify(diagnosisData) });
}

export async function getRecentProfiles(limit = 3) {
    return apiFetch(`/investment-profiles?limit=${limit}`);
}

export async function getLatestProfile() {
    return apiFetch('/investment-profiles/latest');
}

export async function hasDiagnosisHistory() {
    return apiFetch('/investment-profiles/exists');
}