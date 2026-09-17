import { apiFetch } from '../api/apiClient';

export const getMyCards = () => apiFetch('/api/cards');

export const getCard = (cardId) => apiFetch(`/api/cards/${cardId}`);
