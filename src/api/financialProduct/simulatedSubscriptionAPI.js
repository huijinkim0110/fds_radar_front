import { apiFetch } from '../apiClient';

export const subscribe = (dto) =>
    apiFetch('/simulated-subscriptions', { method: 'POST', body: JSON.stringify(dto) });

export const cancelSubscription = (simulatedSubscriptionId) =>
    apiFetch(`/simulated-subscriptions/${simulatedSubscriptionId}/cancel`, { method: 'PATCH' });

export const getPortfolio = () => apiFetch('/simulated-subscriptions');