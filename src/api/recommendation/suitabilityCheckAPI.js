import { apiFetch } from '../apiClient';

export async function checkSuitability(productId) {
    return apiFetch('/suitability-checks', { method: 'POST', body: JSON.stringify({ productId }) });
}

export async function getCheckHistory(productId) {
    return apiFetch(`/suitability-checks?productId=${productId}`);
}