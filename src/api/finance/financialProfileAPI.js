import { apiFetch } from '../apiClient';

export async function getFinancialProfile() {
    return apiFetch('/api/financial-profiles/me');
}

export async function hasFinancialProfile() {
    return apiFetch('/api/financial-profiles/exists');
}

export async function upsertFinancialProfile(dto) {
    return apiFetch('/api/financial-profiles', { method: 'POST', body: JSON.stringify(dto) });
}