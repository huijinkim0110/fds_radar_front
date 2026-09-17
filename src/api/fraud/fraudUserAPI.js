import { apiFetch } from '../apiClient';

export async function getMyFraudCases() {
    return apiFetch('/api/fraud-cases');
}

export async function confirmFraudCase(fraudCaseId, confirmation) {
    return apiFetch(`/api/fraud-cases/${fraudCaseId}/confirmation`, {
        method: 'PATCH',
        body: JSON.stringify({ confirmation }),
    });
}