import { apiFetch } from '../apiClient';

export async function getUnifiedRecommendations(dto) {
    return apiFetch('/recommendations/unified', { method: 'POST', body: JSON.stringify(dto) });
}

export async function getRecommendationHistory() {
    return apiFetch('/recommendations/history');
}

export async function getRecommendationHistoryItems(recommendationResultId) {
    return apiFetch(`/recommendations/history/${recommendationResultId}/items`);
}