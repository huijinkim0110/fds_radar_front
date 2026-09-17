import { apiFetch } from '../apiClient';

export async function getMyTransactions() {
    return apiFetch('/api/transactions?page=0&size=1000');
}
